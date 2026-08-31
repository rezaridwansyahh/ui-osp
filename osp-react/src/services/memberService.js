import api from './api';
import { formatCurrency } from '../utils/helpers';

// CATATAN: field respons /customers dikonfirmasi dari network tab (Aug 14):
// { id, name, keyFob, email, phoneNumber, additionalInformation (JSON string
// berisi array [{amount, description, type}]), createdDate, gymName, status,
// membershipType, responseCode, responseMessage }. status sering null di data
// real — dibiarin null apa adanya (lihat mapApiCustomer di bawah), TIDAK
// difallback ke 'ACTIVE' atau string lain. Badge/STATUS_DOT_COLORS sudah
// punya fallback abu-abu buat status yang falsy.

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

let customersCache = null; // { data, fetchedAt }
const CUSTOMERS_CACHE_TTL_MS = 5 * 60 * 1000; // 5 menit

/**
 * Sama seperti fetchAllCustomers(), tapi nyimpen hasilnya di memory session
 * ini selama CUSTOMERS_CACHE_TTL_MS — biar HomePage & MembersPage gak dobel
 * nembak /customers (bisa >140s) pas user gonta-ganti halaman dalam rentang
 * waktu pendek. Pass { force: true } buat selalu fetch ulang (misalnya
 * tombol Refresh manual di MembersPage).
 */
export async function fetchAllCustomersCached({ force = false } = {}) {
  const now = Date.now();
  if (!force && customersCache && now - customersCache.fetchedAt < CUSTOMERS_CACHE_TTL_MS) {
    return customersCache.data;
  }
  const data = await fetchAllCustomers();
  customersCache = { data, fetchedAt: now };
  return data;
}

/** Search customer by nama/keyword — BUTUH brandId. */
export async function searchCustomers(search, brandId) {
  const { data } = await api.get('/customers/search/', {
    params: { search, brandId },
  });
  return data;
}

/**
 * Kode angka memberships.status dari backend (PUT /customers/{id}):
 * 0 = ACTIVE, 1 = DEFAULTED, 2 = EXPIRED/CANCELED, 3 = FREEZE.
 * GET /customers mengembalikan status sebagai STRING ('ACTIVE', dst) — konversi
 * ke angka cuma dibutuhkan saat kirim PUT.
 */
export const MEMBER_STATUS_TO_CODE = {
  ACTIVE: 0,
  DEFAULTED: 1,
  EXPIRED: 2,
  FREEZE: 3,
};

/**
 * Edit member (personaldetails + memberships sekaligus) via PUT /customers/{id}.
 * Backend HANYA meng-update field yang ada (non-null) di body — kirim cuma yang
 * berubah. Kalau member gak punya baris memberships, field membership di-skip
 * diam-diam dan cuma personaldetails yang keupdate.
 *
 * Sukses  -> { ...fields, responseCode: '_000', responseMessage: 'SUCCESS' }
 * Gagal   -> { responseCode: '_003', responseMessage: 'NOT FOUND' }
 *
 * Field body yang didukung (semua opsional): firstName, lastName, email, keyfob,
 * mobileNumber, phoneNumber, address, gender, birthdate, packageId, packageDesc,
 * paymentType, membershipMinLength, paymentValue, status (angka, lihat
 * MEMBER_STATUS_TO_CODE), signupDate, startDate, expiryDate.
 */
export async function updateMember(id, patch) {
  const { data } = await api.put(`/customers/${id}`, patch);
  if (data?.responseCode && data.responseCode !== '_000') {
    throw new Error(data.responseMessage || 'Gagal menyimpan perubahan member.');
  }
  return data;
}

/** Buang cache in-memory /customers (dipanggil setelah edit member berhasil). */
export function clearCustomersCache() {
  customersCache = null;
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
    phone: c.phoneNumber || '-',
    register: c.createdDate ? c.createdDate.slice(0, 10) : '-',
    bill: billAmount > 0 ? formatCurrency(billAmount) : '-',
    billAmount,
    // status sering null di data real (GET /customers) — dibiarin null apa
    // adanya, gak dipaksa jadi string apapun. Badge/STATUS_DOT_COLORS udah
    // punya fallback abu-abu buat status yang falsy.
    status: c.status ? c.status.toUpperCase() : null,
    membershipType: c.membershipType || null,
  };
}