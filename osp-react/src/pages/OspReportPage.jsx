import { useState, useMemo } from 'react';
import { FileX, Loader2, Printer, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { exportTableToCSV } from '../utils/helpers';
import { useShowToast } from '../contexts/ToastContext';
import api from '../services/api';

const PAGE_SIZE = 10;

function today() {
  return new Date().toISOString().slice(0, 10);
}

const formatIDR = (n) => {
  if (n == null) return '-';
  return 'Rp ' + Number(n).toLocaleString('id-ID');
};

const formatDate = (d) => {
  if (!d) return '-';
  return String(d).replace('T', ' ').slice(0, 19);
};

const COLUMNS = [
  { key: 'trxDate', label: 'Trx Date', render: (r) => formatDate(r.trxDate) },
  { key: 'orderId', label: 'Trx Id', render: (r) => r.orderId ?? '-' },
  { key: 'trxStatus', label: 'Trx Status', render: (r) => '-' },
  { key: 'orderDetailId', label: 'Order Id', render: (r) => r.orderDetailId ?? '-' },
  { key: 'customerName', label: 'Customer Name', render: (r) => r.customerName ?? '-' },
  { key: 'productName', label: 'Product Name', render: (r) => r.productName ?? '-' },
  { key: 'channelType', label: 'Channel Type', render: (r) => r.channelType ?? '-' },
  { key: 'qtyAndPrice', label: 'Qty and Price', render: (r) => `${r.quantity ?? 1}@${r.unitPrice ?? 0}` },
  { key: 'totalPrice', label: 'Total Price', money: true, render: (r) => r.paidAmount },
  { key: 'discountAmount', label: 'Discount Amount', money: true, render: (r) => r.discountAmount },
  { key: 'paidAmount', label: 'Paid Amount', money: true, render: (r) => r.paidForSpecificAmount },
  { key: 'customerId', label: 'Customer Id', render: (r) => '-' },
  { key: 'keyNo', label: 'Key No', render: (r) => r.keyfob ?? '-' },
  { key: 'gymName', label: 'Gym Name', render: (r) => r.gymName ?? '-' },
  { key: 'channelType1', label: 'Channel Type 1', render: (r) => r.detailChannel ?? '-' },
  { key: 'cardType1', label: 'Card Type 1', render: (r) => r.cardType || '-' },
  { key: 'bank1', label: 'Bank 1', render: (r) => r.bank || '-' },
  { key: 'paidAmount1', label: 'Paid Amount 1', money: true, render: (r) => r.realPaid },
  { key: 'cardNumber1', label: 'Card Number 1', render: (r) => r.cardNumber || '-' },
  { key: 'reference1', label: 'Reference 1', render: (r) => r.transactionRefId || '-' },
  { key: 'installment1', label: 'Installment 1', render: (r) => r.installment || '-' },
];

export default function OspReportPage() {
  const showToast = useShowToast();
  const { user } = useAuth();
  const gymList = user?.gymList ?? [];

  const [gymId, setGymId] = useState(-1);
  const [startDate, setStartDate] = useState(today());
  const [endDate, setEndDate] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const [tableSearch, setTableSearch] = useState('');
  const [page, setPage] = useState(1);

  async function handleSearch() {
    setLoading(true);
    setError(null);
    try {
      const params = { gymId, startDate };
      if (endDate) params.endDate = endDate;
      const { data: res } = await api.get('/placeorder/details-order', { params });
      const items = Array.isArray(res) ? res : (res?.data ?? res?.content ?? []);
      setData(items);
      setSearched(true);
      setPage(1);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Gagal memuat data.');
      setData([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    if (!searched) return [];
    const q = tableSearch.toLowerCase();
    return data.filter((r) =>
      !q ||
      (r.customerName ?? '').toLowerCase().includes(q) ||
      (r.gymName ?? '').toLowerCase().includes(q) ||
      (r.productName ?? '').toLowerCase().includes(q) ||
      String(r.orderId ?? '').includes(q)
    );
  }, [data, searched, tableSearch]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleExportCSV() {
    const headers = COLUMNS.map((c) => c.label);
    const rows = filtered.map((r) => COLUMNS.map((c) => {
      const val = c.render(r);
      return val ?? '-';
    }));
    exportTableToCSV(headers, rows, 'osp_report.csv');
    showToast('CSV exported', 'success');
  }

  return (
    <div className="p-4 lg:p-6 space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Gym</label>
          <select value={gymId} onChange={(e) => setGymId(Number(e.target.value))}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-violet-400">
            <option value={-1}>all</option>
            {gymList.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Start Date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-violet-400" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">End Date</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-violet-400" />
          </div>
        </div>
        <div className="flex justify-end">
          <button onClick={handleSearch} disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Search
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
          <X className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      {searched && !error && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button onClick={handleExportCSV} className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 rounded hover:bg-blue-700">CSV</button>
              <button onClick={handleExportCSV} className="px-3 py-1.5 text-xs font-bold text-white bg-green-600 rounded hover:bg-green-700">Excel</button>
              <button onClick={() => window.print()} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-gray-500 rounded hover:bg-gray-600">
                <Printer className="w-3.5 h-3.5" /> Print
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Search:</span>
              <input type="text" value={tableSearch}
                onChange={(e) => { setTableSearch(e.target.value); setPage(1); }}
                className="px-2 py-1 text-sm border border-gray-200 rounded outline-none focus:border-violet-400 w-40" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100">
                  {COLUMNS.map((c) => (
                    <th key={c.key} className="px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{c.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paged.length === 0 ? (
                  <tr><td colSpan={COLUMNS.length} className="px-4 py-12 text-center text-sm text-gray-400">
                    <FileX className="w-8 h-8 mx-auto mb-2 text-gray-300" /> No data found.
                  </td></tr>
                ) : paged.map((r, i) => (
                  <tr key={`${r.id}-${i}`} className="hover:bg-violet-50/30 transition-colors">
                    {COLUMNS.map((c) => (
                      <td key={c.key} className={`px-4 py-3 whitespace-nowrap ${c.money ? 'font-mono text-right' : ''} text-gray-700`}>
                        {c.money ? formatIDR(c.render(r)) : (c.render(r) ?? '-')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 bg-slate-50 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">Total: <span className="font-bold text-slate-700">{filtered.length}</span> records</span>
            <div className="flex items-center gap-1">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="px-2 py-1 text-xs font-semibold text-gray-500 border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-40">Prev</button>
              <span className="px-3 py-1 text-xs font-bold text-violet-600 bg-violet-50 rounded">{page} / {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                className="px-2 py-1 text-xs font-semibold text-gray-500 border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-40">Next</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
