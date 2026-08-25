import api from './api';

// CATATAN: field respons /customers dikonfirmasi dari network tab (Aug 14):
// { id, name, keyFob, email, phoneNumber, additionalInformation (JSON string
// berisi array [{amount, description, type}]), createdDate, gymName, status,
// membershipType, responseCode, responseMessage }. status sering null di data
// real — fallback ke 'ACTIVE' dipertahankan biar Badge gak error, tapi ini
// asumsi sampai dikonfirmasi mentor/backend field status yang bener.

/** Total angka mentah dari additionalInformation (buat kalkulasi & display, parse sekali). */
function sumAdditionalInfo(raw) {
  if (!raw) return 0;
  try {
    const items = JSON.parse(raw);
    if (!Array.isArray(items)) return 0;
    return items.reduce((sum, it) => sum + (Number(it.amount) || 0), 0);
  } catch {
    return 0;
  }
}

/** Semua customer (tidak butuh gymId/brandId). */
export async function fetchAllCustomers() {
  // Response bisa lambat (>60s) di beberapa gym besar — timeout dinaikin
  // khusus buat call ini, override default 60s di api.js.
  const { data } = await api.get('/customers', { timeout: 180000 });
  return data;
}

/** Search customer by nama/keyword — BUTUH brandId. */
export async function searchCustomers(search, brandId) {
  const { data } = await api.get('/customers/search/', {
    params: { search, brandId },
  });
  return data;
}

/** Pending membership list per gym — BUTUH gymId. Dipakai PendingMembershipPage. */
export async function fetchPendingMembershipByGym(gymId) {
  const { data } = await api.get('/customers/search/pending-membership-gym/', {
    params: { gymId },
  });
  return data;
}

/** Map response backend -> shape yang dipakai MembersPage UI. */
export function mapApiCustomer(c) {
  const billAmount = sumAdditionalInfo(c.additionalInformation);
  return {
    id: c.id != null ? String(c.id) : '-',
    name: c.name || '(Tanpa nama)',
    email: c.email || '-',
    keyfob: c.keyFob || '-',
    register: c.createdDate ? c.createdDate.slice(0, 10) : '-',
    bill: billAmount > 0 ? `IDR ${billAmount.toLocaleString('id-ID')}` : '-',
    billAmount,
    // status sering null di data real (GET /customers) — dibiarin null apa
    // adanya, gak dipaksa jadi string apapun. Badge/STATUS_DOT_COLORS udah
    // punya fallback abu-abu buat status yang falsy.
    status: c.status ? c.status.toUpperCase() : null,
  };
}