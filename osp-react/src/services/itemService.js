import api from './api';

/**
 * areaId belum ketemu di response manapun yang kita punya sekarang
 * (bukan di /api/v2/login, bukan di /gym, bukan di /master/gyms).
 * Fungsi ini satu-satunya tempat yang nebak/resolve areaId dari user object —
 * begitu mentor/backend confirm field yang benar, cukup update di sini,
 * gak perlu ubah tiap pemanggil.
 */
export function resolveAreaId(user) {
  const candidate =
    user?.areaId ??
    user?.gymList?.[0]?.areaId ??
    null;

  if (candidate == null) {
    console.warn(
      '[itemService] areaId tidak ditemukan di user object — endpoint /items yang butuh areaId akan gagal atau dikirim tanpa filter area. Perlu konfirmasi field yang benar ke backend/mentor.'
    );
  }
  return candidate;
}

/**
 * Ambil semua item — SATU-SATUNYA endpoint /items yang tidak butuh areaId sama sekali.
 * Dipakai sebagai fallback aman selama areaId belum ada sumber yang jelas.
 */
export async function fetchAllItems() {
  const { data } = await api.get('/items');
  return data;
}

/** Semua grup produk (tidak butuh gymId/areaId). */
export async function fetchItemGroups() {
  const { data } = await api.get('/items/group');
  return data;
}

/** Item berdasarkan grup — BUTUH gymId & areaId. */
export async function fetchItemsByGroup(groupId, { gymId, areaId } = {}) {
  const { data } = await api.get(`/items/group=${groupId}`, {
    params: { gymId, areaId },
  });
  return data;
}

/** Item tunggal berdasarkan ID (tidak perlu gymId/areaId sesuai dokumentasi). */
export async function fetchItemById(itemId) {
  const { data } = await api.get(`/items/item=${itemId}`);
  return data;
}

/** Search item by nama — BUTUH gymId & areaId. */
export async function searchItems(term, { gymId, areaId } = {}) {
  const { data } = await api.get(`/items/search/${encodeURIComponent(term)}`, {
    params: { gymId, areaId },
  });
  return data;
}

/** Simple search — cuma butuh gymId (bukan areaId), tanpa filter monthly payment. */
export async function simpleSearchItems(term, gymid) {
  const { data } = await api.get('/items/simple-search', {
    params: { search: term, gymid },
  });
  return data;
}

/** Semua item dalam satu gym — BUTUH gymId & areaId. */
export async function fetchItemsInGym({ gymId, areaId } = {}) {
  const { data } = await api.get('/items/item', {
    params: { gymId, areaId },
  });
  return data;
}

/** Item berdasarkan shortname — BUTUH gymId & areaId. */
export async function fetchItemByShortname(shortname, { gymId, areaId } = {}) {
  const { data } = await api.get(`/items/item/${encodeURIComponent(shortname)}`, {
    params: { gymId, areaId },
  });
  return data;
}