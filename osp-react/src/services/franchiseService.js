
import api from './api';

// Mapping franchise-gym untuk 1 gym. Sempat konsisten 500 (lihat komentar lama
// di authService), per Agu 2026 sudah balik 200 lagi — tapi `brandId`/`brandName`
// di response ini selalu null, jadi cuma andal buat `franchiseId`.
export const fetchFranchiseByGymId = async (gymId) => {
  const res = await api.get(`/api/franchise/mappings/gym/${gymId}`);
  return res.data; // { franchiseId, franchiseName, gymId, gymName, brandId: null, ... }
};

// Semua gym + brand + franchise dalam satu response (GET /api/franchise/gyms).
// Ini yang dipakai saat login buat resolve brandId + franchiseId sekaligus.
// CATATAN: versi single-gym `/api/franchise/gyms/{gymId}` masih 500 — jangan
// dipakai, filter dari list ini aja.
export const fetchFranchiseGyms = async () => {
  const res = await api.get('/api/franchise/gyms');
  return res.data; // [{ id, name, brandId, brandName, franchiseId, franchiseName, exist, ... }]
};
