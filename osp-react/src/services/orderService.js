import api from './api';

/**
 * Fetch detail order/transaksi dari backend.
 * @param {Object} params
 * @param {number} params.gymId — ID gym (-1 untuk semua gym)
 * @param {string} params.startDate — Format YYYY-MM-DD
 * @param {string} params.endDate — Format YYYY-MM-DD
 */
export async function fetchOrders({ gymId = -1, startDate, endDate }) {
  const { data } = await api.get('/placeorder/details-order', {
    params: { gymId, startDate, endDate },
  });
  return data;
}

/**
 * Mapping dari response API ke format tabel Daily Sales Report.
 * Berdasarkan response real:
 * { id, trxId, transactionStatus, orderId, trxDate, customer,
 *   customerName, channelType, gymName, productName, totalAmount,
 *   paidAmount, discountAmount, createdDate, createdUser, sales, ... }
 */
export function mapOrderToTransaction(order) {
  return {
    id: order.id ?? order.orderId ?? order.trxId,
    trxId: order.trxId ?? '-',
    orderId: order.orderId ?? '-',
    date: formatTrxDate(order.trxDate ?? order.createdDate),
    member: order.customerName ?? '-',
    customerId: order.customer ?? '-',
    total: order.totalAmount ?? order.paidAmount ?? 0,
    discount: order.discountAmount ?? 0,
    paidAmount: order.paidAmount ?? 0,
    status: normalizeStatus(order.transactionStatus ?? ''),
    channel: order.channelType ?? '-',
    gym: order.gymName ?? '-',
    gymId: order.gymId ?? null,
    product: order.productName ?? '-',
    qty: order.qty ?? '-',
    note: order.note ?? '',
    keyfob: order.keyfob ?? '',
    sales: order.sales ?? order.createdUser ?? '-',
    createdUser: order.createdUser ?? '-',
    createdDate: order.createdDate ?? '-',

    // Detail pembayaran (bisa multi-channel)
    payments: extractPayments(order),

    postingDate: order.postingDate ?? order.createdDate ?? '-',
    paymentType: order.channelType ?? order.paymentType ?? '-',
    cardType: order.cardType ?? order.cardType1 ?? '-',
    debitAmount: order.paidAmount ?? order.totalAmount ?? 0,
    internalMdr: order.internalMdr ?? order.mdrInternal ?? '%',
    externalMdr: order.externalMdr ?? order.mdrExternal ?? '%',
    mdrRp: order.mdrRp ?? order.mdrAmount ?? 0,

    raw: order,
  };
}

// Ambil tanggal aja dari "2025-07-09 04:32:16" → "2025-07-09"
function formatTrxDate(dateStr) {
  if (!dateStr) return '-';
  return dateStr.split(' ')[0];
}

// Ekstrak detail pembayaran (support sampai 3 channel)
function extractPayments(order) {
  const payments = [];
  for (let i = 1; i <= 3; i++) {
    const channel = order[`channelType${i}`];
    const amount = order[`paidAmount${i}`];
    if (channel || amount) {
      payments.push({
        channel: channel ?? '-',
        cardType: order[`cardType${i}`] ?? '-',
        amount: amount ?? 0,
        cardNo: order[`cardNo${i}`] ?? '-',
        reference: order[`reference${i}`] ?? '-',
        installment: order[`installment${i}`] ?? '-',
        bank: order[`bank${i}`] ?? '-',
      });
    }
  }
  return payments;
}

// Standarisasi status supaya konsisten dengan Badge component
function normalizeStatus(status) {
  const upper = String(status).toUpperCase();
  if (upper.includes('COMPLETED') || upper.includes('SUCCESS') || upper.includes('PAID')) return 'SUCCESS';
  if (upper.includes('VOID') || upper.includes('CANCEL')) return 'VOID';
  if (upper.includes('PENDING') || upper.includes('WAIT')) return 'PENDING';
  return upper || 'UNKNOWN';
}
