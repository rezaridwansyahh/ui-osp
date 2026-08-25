import api from './api';
import { saveToken, saveUser } from '../utils/jwt';
import { fetchGyms } from './gymService';
import { fetchFranchiseByGymId } from './franchiseService';

async function resolveBrandIdFromGym(user) {
  const gymId = user.gymId ?? user.gym?.id ?? null;

  if (user.brandId) return user.brandId;
  if (!gymId) return null;

  try {
    const gyms = await fetchGyms();
    const gym = gyms.find((g) => g.id === gymId);
    return gym?.brandId ?? null;
  } catch (err) {
    console.error('Gagal fetch gyms saat resolve brandId:', err);
    return null;
  }
}

// UPDATE: endpoint single-gym-lookup (/api/franchise/mappings/gym/:gymId) lagi
// bug, konsisten 500 walau data mapping-nya valid (cross-checked via
// /api/franchise/mappings all-mappings). Response-nya juga cuma punya
// franchiseId, gak pernah ada field areaId terpisah — franchiseId ITU
// area context yang dipake /items endpoints. Reported ke mentor (pending fix).
async function resolveFranchiseIdFromGym(user) {
  const gymId = user.gymId ?? user.gym?.id ?? null;

  if (!gymId || gymId === -1) return null; // -1 = SystemOperator/multi-gym, gak applicable

  try {
    const franchise = await fetchFranchiseByGymId(gymId);
    return franchise?.franchiseId ?? null;
  } catch (err) {
    console.error('Gagal fetch franchise saat resolve franchiseId:', err);
    return null; // fallback aman, bukan crash — known backend bug, lihat comment di atas
  }
}

export async function loginAPI(username, password) {
  try {
    const { data } = await api.post('/api/v2/login', { username, password });

    const [brandId, franchiseId] = await Promise.all([
      resolveBrandIdFromGym(data.user),
      resolveFranchiseIdFromGym(data.user),
    ]);

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