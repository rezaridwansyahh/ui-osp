import api from './api';
import { saveToken, saveUser } from '../utils/jwt';
import { fetchGyms } from './gymService';

// SEBELUM: resolveBrandId(user) parsing role string ("bee active" / "anytime fitness")
// MASALAH: role brand-agnostic (SystemOperator, Club Manager, dll) gak match apapun,
// padahal user itu jelas punya gym access yang valid (contoh: SystemOperator dengan
// Gym Access "AF AKR Tower" tapi logo/tema gak ke-apply).
//
// SESUDAH: brandId diturunkan dari gym yang di-assign ke user, bukan dari role.
// brandId 3 = OSP (admin) — perlu dikonfirmasi apakah admin punya gymId sendiri
// atau brandId 3 di-set langsung dari backend response.
async function resolveBrandIdFromGym(user) {
  // TODO (perlu dikonfirmasi ke backend/mentor): field gym pada user object.
  // Sementara diasumsikan `user.gymId`, dengan fallback ke `user.gym?.id`.
  const gymId = user.gymId ?? user.gym?.id ?? null;

  // Kalau backend sudah kirim brandId langsung (misal untuk OSP admin = 3), pakai itu
  if (user.brandId) return user.brandId;

  if (!gymId) return null; // gak ada gym context sama sekali → neutral/default theme

  try {
    const gyms = await fetchGyms();
    const gym = gyms.find((g) => g.id === gymId);
    return gym?.brandId ?? null;
  } catch (err) {
    console.error('Gagal fetch gyms saat resolve brandId:', err);
    return null; // fallback aman: neutral theme, bukan crash
  }
}

export async function loginAPI(username, password) {
  try {
    const { data } = await api.post('/api/v2/login', { username, password });

    const brandId = await resolveBrandIdFromGym(data.user);

    const resolvedUser = {
      ...data.user,
      brandId,
    };

    saveToken(data.jwt);
    saveUser(resolvedUser);

    return {
      success: true,
      token: data.jwt,
      user: resolvedUser,
    };
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      'Username atau password salah.';

    return { success: false, error: message };
  }
}