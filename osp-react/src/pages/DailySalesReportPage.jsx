import { useState, useMemo } from 'react';
import {
  Search, Printer, FileText, FileSpreadsheet,
  RefreshCw, FileX, Loader2, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useShowToast } from '../contexts/ToastContext';
import * as XLSX from 'xlsx';
import { fetchOrders } from '../services/orderService';
import { formatCurrency } from '../utils/helpers';

const PAGE_SIZE = 20;

function today() {
  return new Date().toISOString().slice(0, 10);
}

function fmtDate(str) {
  if (!str || str === '-') return '-';
  return String(str).split('T')[0].replace(' ', '').slice(0, 10);
}

function fmtAmount(val) {
  const n = Number(val);
  if (isNaN(n) || val == null) return '-';
  return formatCurrency(n);
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
        Klik{' '}
        <button onClick={onRefresh} className="font-semibold text-violet-500 underline">
          Search
        </button>{' '}
        untuk memuat data.
      </p>
    </div>
  );
}

const COLS = [
  { label: 'Trx Date',     key: 'trxDate',       render: (o) => fmtDate(o.trxDate) },
  { label: 'Posting Date', key: 'createdDate',    render: (o) => fmtDate(o.createdDate) },
  { label: 'Merchant',     key: 'gymName',        render: (o) => o.gymName ?? '-' },
  { label: 'Member Name',  key: 'customerName',   render: (o) => o.customerName ?? '-' },
  { label: 'Package',      key: 'productName',    render: (o) => o.productName ?? '-' },
  { label: 'Payment Type', key: 'channelType',    render: (o) => o.channelType ?? '-' },
  { label: 'Card Type',    key: 'cardType1',      render: (o) => o.cardType1 || '-' },
  { label: 'Debit Amount', key: 'paidAmount',     render: (o) => fmtAmount(o.paidAmount),   cls: 'text-right font-mono' },
  { label: 'Internal MDR', key: 'internalMdr',    render: (o) => o.internalMdr ?? '-' },
  { label: 'External MDR', key: 'externalMdr',    render: (o) => o.externalMdr ?? '-' },
  { label: 'MDR',          key: 'mdrRp',          render: (o) => fmtAmount(o.mdrRp),        cls: 'text-right font-mono' },
];

// ─── Main page ────────────────────────────────────────────────────
export default function DailySalesReportPage() {
  const { user } = useAuth();
  const showToast = useShowToast();

  const defaultGymId = user?.gymId ?? -1;
  const gymList = user?.gymList ?? [];

  // Filter state
  const [gymId, setGymId]         = useState(defaultGymId);
  const [dateRange, setDateRange] = useState({ startDate: today(), endDate: today() });

  // Data state
  const [rows, setRows]                   = useState([]);
  const [totalPages, setTotalPages]       = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage]                   = useState(0);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState(null);
  const [searched, setSearched]           = useState(false);

  // Client-side search within current page
  const [search, setSearch] = useState('');

  // ── Fetch ─────────────────────────────────────────────────────
  async function fetchPage(targetPage) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchOrders({
        gymId,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        page: targetPage,
        size: PAGE_SIZE,
        sort: 'createdDate,desc',
      });

      setRows(res.content ?? []);
      setTotalPages(res.totalPages ?? 0);
      setTotalElements(res.totalElements ?? 0);
      setPage(targetPage);
      setSearched(true);
      setSearch('');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Gagal memuat data.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch() {
    fetchPage(0);
  }

  function handlePageChange(newPage) {
    if (newPage < 0 || newPage >= totalPages) return;
    fetchPage(newPage);
    document.getElementById('dsr-table-wrap')?.scrollTo({ top: 0 });
  }

  // ── Client-side filter on current page ───────────────────────
  const filtered = useMemo(() => {
    if (!search) return rows;
    const q = search.toLowerCase();
    return rows.filter((o) =>
      (o.customerName ?? '').toLowerCase().includes(q) ||
      (o.gymName ?? '').toLowerCase().includes(q) ||
      (o.productName ?? '').toLowerCase().includes(q) ||
      (o.channelType ?? '').toLowerCase().includes(q) ||
      String(o.trxId ?? '').includes(q)
    );
  }, [rows, search]);

  // ── Export ────────────────────────────────────────────────────
  function handleCSV() {
  const headers = COLS.map((c) => c.label);
  const exportRows = filtered.map((o) => COLS.map((c) => c.render(o)));

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...exportRows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Daily Sales Report');
  XLSX.writeFile(workbook, 'daily-sales-report.xlsx');

  showToast?.('XLSX berhasil diunduh', 'success');
}

  // ── Windowed pagination ───────────────────────────────────────
  function getPageNumbers() {
    const range = [];
    const delta = 2;
    const left  = Math.max(0, page - delta);
    const right = Math.min(totalPages - 1, page + delta);

    if (left > 0) {
      range.push(0);
      if (left > 1) range.push('...');
    }
    for (let i = left; i <= right; i++) range.push(i);
    if (right < totalPages - 1) {
      if (right < totalPages - 2) range.push('...');
      range.push(totalPages - 1);
    }
    return range;
  }

  const startRecord = totalElements === 0 ? 0 : page * PAGE_SIZE + 1;
  const endRecord   = Math.min((page + 1) * PAGE_SIZE, totalElements);

  return (
    <div className="p-6 space-y-4">

      {/* ── Filter bar ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Gym</label>
            <select
              value={gymId}
              onChange={(e) => setGymId(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-violet-400"
            >
              <option value={-1}>All</option>
              {gymList.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
            {gymList.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">No gym assigned to your account.</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange((p) => ({ ...p, startDate: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
            />
          </div>
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
            onClick={handleSearch}
            disabled={loading}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-lg transition"
          >
            {loading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Search className="w-4 h-4" />}
            Search
          </button>
        </div>
      </div>

      {/* ── Action bar ── */}
      {searched && !loading && (
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCSV}
            className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition"
          >
            <FileText className="w-3.5 h-3.5" /> CSV
          </button>
          <button
            onClick={handleCSV}
            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 bg-gray-600 hover:bg-gray-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition"
          >
            <Printer className="w-3.5 h-3.5" /> Print
          </button>
          <div className="ml-auto flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 bg-white">
            <Search className="w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search halaman ini..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-sm outline-none w-44"
            />
          </div>
        </div>
      )}

      {/* ── Table card ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {!searched && !loading ? (
          <IdleState onRefresh={handleSearch} />
        ) : loading ? (
          <LoadingState />
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-red-400">
            <p className="text-sm">{error}</p>
            <button onClick={handleSearch} className="mt-3 text-xs text-violet-500 underline">
              Coba lagi
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div id="dsr-table-wrap" className="overflow-x-auto">
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
                      <td className="px-4 py-3 text-gray-500 text-xs">{page * PAGE_SIZE + i + 1}</td>
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

            {/* ── Pagination footer ── */}
            <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-gray-100 gap-3 bg-gray-50">
              <span className="text-xs text-slate-500">
                Showing{' '}
                <span className="font-bold text-slate-700">{startRecord}–{endRecord}</span>
                {' '}of{' '}
                <span className="font-bold text-slate-700">{totalElements.toLocaleString('id-ID')}</span>
                {' '}records
                {search && (
                  <span className="text-violet-500 ml-1">({filtered.length} matched)</span>
                )}
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 0 || loading}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {getPageNumbers().map((p, idx) =>
                  p === '...' ? (
                    <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-xs text-gray-400">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      disabled={loading}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors ${
                        p === page
                          ? 'bg-violet-600 text-white shadow-sm'
                          : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {p + 1}
                    </button>
                  )
                )}

                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages - 1 || loading}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}