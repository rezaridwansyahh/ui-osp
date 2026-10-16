import api from './api';
import { formatCurrency } from '../utils/helpers';

/**
 * Search recurring billing report — GET /api/report-recurring. Wajib pakai
 * gymName (BUKAN gymId — kolom gym_id selalu null di tabel ini), dikombinasi
 * sama memberId buat scope ke 1 member di dalam SlidePanel detail.
 *
 * @param {Object} params
 * @param {string} params.gymName — wajib, exact match case-insensitive
 * @param {number} [params.memberId]
 * @param {number} [params.membershipId]
 * @param {string} [params.recurringStatus] — e.g. 'Success' | 'Failed'
 * @param {number} [params.page] — 0-indexed
 * @param {number} [params.size]
 * @param {string} [params.sort]
 */
export async function fetchReportRecurring(params) {
  const { data } = await api.get('/api/report-recurring', { params });
  return data;
}

/** Map 1 baris GET /api/report-recurring -> shape yang dipakai section recurring di detail member. */
export function mapRecurringRow(r) {
  return {
    id: r.id,
    periode: r.periode || '-',
    amount: r.amount ?? null,
    amountDisplay: r.amount != null ? formatCurrency(r.amount) : '-',
    tfToGym: r.tfToGym ?? null,
    status: r.recurringStatus || null,
    recurring1Status: r.recurring1Status || null,
    recurring2Status: r.recurring2Status || null,
    cardType: r.cardType || '-',
    bank: r.bank || '-',
    createdDate: r.createdDate ? r.createdDate.slice(0, 10) : '-',
  };
}
