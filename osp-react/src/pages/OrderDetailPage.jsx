import { useState } from 'react';
import { Search, Printer, FileText, FileSpreadsheet, RefreshCw, FileX, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import useOrders from '../hooks/useOrders';
import { useShowToast } from '../contexts/ToastContext';
import { exportTableToCSV } from '../utils/helpers';

// ─── Format helpers ───────────────────────────────────────────────
function fmtDate(str) {
  if (!str || str === '-') return '-';
  return String(str).split(' ')[0];
}
function fmtAmount(val) {
  const n = Number(val);
  if (isNaN(n)) return '-';
  return n.toLocaleString('id-ID');
}

// ─── Sub components ───────────────────────────────────────────────
function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <Loader2 className="w-8 h-8 animate-spin mb-3 text-violet-400" />
      <p className="text-sm">Memuat data...</p>
    </div>
  );
}
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <FileX className="w-10 h-10 mb-3 text-gray-300" />
      <p className="text-sm">Tidak ada data ditemukan.</p>
    </div>
  );
}
function IdleState({ onRefresh }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <RefreshCw className="w-10 h-10 mb-3 text-gray-300" />
      <p className="text-sm">
        Klik <button onClick={onRefresh} className="font-semibold text-violet-500 underline">Search</button> untuk memuat data.
      </p>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────
export default function OrderDetailPage() {
  const { user } = useAuth();
  const showToast = useShowToast();
  const defaultGymId = user?.gymId ?? -1;
  const gymList = user?.gymList ?? [];

  const {
    orders,
    loading,
    error,
    searched,
    refetch,
    gymId,
    setGymId,
    dateRange,
    setDateRange,
  } = useOrders(defaultGymId);

  const [search, setSearch] = useState('');

  // Filter by search box
  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    return (
      !q ||
      o.member?.toLowerCase().includes(q) ||
      o.gym?.toLowerCase().includes(q) ||
      o.product?.toLowerCase().includes(q) ||
      o.trxId?.toLowerCase().includes(q) ||
      o.paymentType?.toLowerCase().includes(q)
    );
  });

  // Export CSV
  function handleCSV() {
    const headers = ['Trx Date', 'Posting Date', 'Merchant', 'Member Name', 'Package', 'Payment Type', 'Card Type', 'Debit Amount', 'Internal MDR', 'External MDR', 'MDR (in Rp)'];
    const rows = filtered.map((o) => [
      fmtDate(o.date), fmtDate(o.postingDate), o.gym, o.member, o.product,
      o.paymentType, o.cardType, o.debitAmount, o.internalMdr, o.externalMdr, o.mdrRp,
    ]);
    exportTableToCSV(headers, rows, 'order-detail.csv');
    showToast?.('CSV berhasil diunduh', 'success');
  }

  function handlePrint() { window.print(); }

  const COLS = [
    { label: 'Trx Date',      key: 'date',        render: (o) => fmtDate(o.date) },
    { label: 'Posting Date',  key: 'postingDate',  render: (o) => fmtDate(o.postingDate) },
    { label: 'Merchant',      key: 'gym',          render: (o) => o.gym },
    { label: 'Member Name',   key: 'member',       render: (o) => o.member },
    { label: 'Package',       key: 'product',      render: (o) => o.product },
    { label: 'Payment Type',  key: 'paymentType',  render: (o) => o.paymentType },
    { label: 'Card Type',     key: 'cardType',     render: (o) => o.cardType },
    { label: 'Debit Amount',  key: 'debitAmount',  render: (o) => fmtAmount(o.debitAmount), cls: 'text-right' },
    { label: 'Internal MDR',  key: 'internalMdr',  render: (o) => o.internalMdr },
    { label: 'External MDR',  key: 'externalMdr',  render: (o) => o.externalMdr },
    { label: 'MDR (in Rp)',   key: 'mdrRp',        render: (o) => fmtAmount(o.mdrRp), cls: 'text-right' },
  ];

  return (
    <div className="p-6 space-y-4">
      {/* Filter bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Gym */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Gym</label>
            <select value={gymId} onChange={(e) => setGymId(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-violet-400">
              <option value={-1}>all</option>
              {gymList.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
          {/* Start Date */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange((p) => ({ ...p, startDate: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
            />
          </div>
          {/* End Date */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange((p) => ({ ...p, endDate: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            onClick={refetch}
            disabled={loading}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-lg transition"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Search
          </button>
        </div>
      </div>

      {/* Action bar */}
      {searched && !loading && (
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={handleCSV} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition">
            <FileText className="w-3.5 h-3.5" /> CSV
          </button>
          <button onClick={handleCSV} className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition">
            <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
          </button>
          <button onClick={handlePrint} className="flex items-center gap-1.5 bg-gray-600 hover:bg-gray-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition">
            <Printer className="w-3.5 h-3.5" /> Print
          </button>
          {/* Search */}
          <div className="ml-auto flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 bg-white">
            <Search className="w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-sm outline-none w-40"
            />
          </div>
        </div>
      )}

      {/* Table / states */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {!searched && !loading ? (
          <IdleState onRefresh={refetch} />
        ) : loading ? (
          <LoadingState />
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-red-400">
            <p className="text-sm">{error}</p>
            <button onClick={refetch} className="mt-3 text-xs text-violet-500 underline">Coba lagi</button>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">No</th>
                  {COLS.map((c) => (
                    <th key={c.key} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((o, i) => (
                  <tr key={o.id ?? i} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-gray-500 text-xs">{i + 1}</td>
                    {COLS.map((c) => (
                      <td key={c.key} className={`px-4 py-3 text-gray-700 whitespace-nowrap ${c.cls ?? ''}`}>
                        {c.render(o)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
