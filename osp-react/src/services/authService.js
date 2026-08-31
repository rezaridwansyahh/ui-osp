import api from './api';
import { saveToken, saveUser } from '../utils/jwt';
import { fetchGyms } from './gymService';
import { fetchFranchiseByGymId, fetchFranchiseGyms } from './franchiseService';

/**
 * Resolve brandId + franchiseId dari gym user dalam SATU call ke
 * `GET /api/franchise/gyms` (list gym + brand + franchise).
 *
 * franchiseId dipakai sebagai `areaId` di endpoint /items. brandId dipakai buat
 * tema & routing RBAC.
 *
 * Kalau list itu gagal, fallback ke cara lama: brandId dari `/master/gyms`,
 * franchiseId dari `/api/franchise/mappings/gym/{gymId}`.
 */
async function resolveGymContext(user) {
  const gymId = user.gymId ?? user.gym?.id ?? null;
  const seed = { brandId: user.brandId ?? null, franchiseId: null };

  // -1 = SystemOperator/multi-gym — gak ada satu gym/brand/franchise spesifik
  if (!gymId || gymId === -1) return seed;

  try {
    const gyms = await fetchFranchiseGyms();
    const gym = Array.isArray(gyms) ? gyms.find((g) => g.id === gymId) : null;
    if (gym) {
      return {
        brandId: seed.brandId ?? gym.brandId ?? null,
        franchiseId: gym.franchiseId ?? null,
      };
    }
    return seed;
  } catch (err) {
    console.error('resolveGymContext: /api/franchise/gyms gagal, pakai fallback lama:', err);
    const [brandId, franchiseId] = await Promise.all([
      fetchGyms()
        .then((gs) => gs.find((g) => g.id === gymId)?.brandId ?? null)
        .catch(() => null),
      fetchFranchiseByGymId(gymId)
        .then((f) => f?.franchiseId ?? null)
        .catch(() => null),
    ]);
    return { brandId: seed.brandId ?? brandId, franchiseId };
  }
}

export async function loginAPI(username, password) {
  try {
    const { data } = await api.post('/api/v2/login', { username, password });

    const { brandId, franchiseId } = await resolveGymContext(data.user);

    const resolvedUser = {
      ...data.user,
      brandId,
      franchiseId,
      areaId: franchiseId, // areaId endpoints pake franchiseId sbg area context
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

/**
 * Reset password ala-admin lewat PATCH /user/reset-password: langsung set
 * password baru di tabel users, TIDAK butuh password lama.
 *
 * body: { userId, newPassword } — `userId` di sini adalah USERNAME (string),
 * bukan id numerik.
 *
 * Sukses -> { responseCode: '_000', responseMessage: 'SUCCESS' }
 * Gagal  -> _004 (password < 6 karakter), _003 (user not found)
 */
export async function resetPassword(userId, newPassword) {
  const { data } = await api.patch('/user/reset-password', { userId, newPassword });
  if (data?.responseCode && data.responseCode !== '_000') {
    throw new Error(data.responseMessage || 'Gagal reset password.');
  }
  return data;
}