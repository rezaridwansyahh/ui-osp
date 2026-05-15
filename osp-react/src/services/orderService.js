import api from './api';

/**
 * Fetch detail order/transaksi dari backend.
 * @param {Object} params
 * @param {number} params.gymId — ID gym (-1 untuk semua gym)
 * @param {string} params.startDate — Format YYYY-MM-DD
 * @param {string} params.endDate — Format YYYY-MM-DD
 */
export async function fetchOrders({ gymId = -1, startDate, endDate }) {
  const { data } = await api.get('/placeorder/details-orderv2', {
    params: { gymId, startDate, endDate },
  });
  return data;
}

/**
 * Mapping dari response API ke format yang dipakai tabel DailyTransaction.
 * Field names mungkin perlu disesuaikan setelah lihat response asli.
 * Cek console.log di useOrders untuk lihat raw response.
 */
export function mapOrderToTransaction(order, index) {
  return {
    id: order.id ?? order.orderId ?? `ORD-${index}`,
    date: order.orderDate ?? order.date ?? order.createdAt ?? '-',
    invoice: order.invoiceNo ?? order.invoice ?? order.orderNo ?? '-',
    member: order.memberName ?? order.member ?? order.customerName ?? '-',
    total: order.totalAmount ?? order.total ?? order.amount ?? 0,
    status: normalizeStatus(order.status ?? order.orderStatus ?? ''),
    channel: order.paymentChannel ?? order.channel ?? order.paymentMethod ?? '-',
    gym: order.gymName ?? order.gym ?? '-',
    updatedBy: order.updatedBy ?? order.createdBy ?? '-',
    raw: order,
  };
}

// Standarisasi status supaya konsisten dengan Badge component
function normalizeStatus(status) {
  const upper = String(status).toUpperCase();
  if (upper.includes('SUCCESS') || upper.includes('PAID') || upper.includes('COMPLETED')) return 'SUCCESS';
  if (upper.includes('VOID') || upper.includes('CANCEL')) return 'VOID';
  if (upper.includes('PENDING') || upper.includes('WAIT')) return 'PENDING';
  return upper || 'UNKNOWN';
}
