import { useState, useMemo } from 'react';
import { Download, SlidersHorizontal, FileX, Eye, X, RefreshCw, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import useOrders from '../hooks/useOrders';
import { useShowToast } from '../contexts/ToastContext';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import SearchInput from '../components/ui/SearchInput';
import Pagination from '../components/ui/Pagination';
import Modal from '../components/ui/Modal';
import { exportTableToCSV, formatIDR } from '../utils/helpers';

const PAGE_SIZE = 8;

const EMPTY_FILTERS = {
  member: '',
  invoice: '',
  status: '',
  channel: '',
};

export default function DailyTransactionPage() {
  const showToast = useShowToast();
  const { user } = useAuth();

  // Ambil gymList dari user buat dropdown filter gym
  const gymList = user?.gymList ?? [];
  const defaultGymId = user?.gymId ?? -1;

  const {
    orders,
    loading,
    error,
    refetch,
    gymId,
    setGymId,
    dateRange,
    setDateRange,
  } = useOrders(defaultGymId);

  const [statusOverrides, setStatusOverrides] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterDraft, setFilterDraft] = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const [sortField, setSortField] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const [voidTarget, setVoidTarget] = useState(null);
  const [detailTransaction, setDetailTransaction] = useState(null);

  // Gabung data API dengan override status (VOID)
  const rowsWithOverrides = useMemo(
    () => orders.map((t) => ({ ...t, status: statusOverrides[t.id] ?? t.status })),
    [orders, statusOverrides]
  );

  // Kumpulkan unique values dari data buat opsi filter
  const uniqueChannels = useMemo(
    () => [...new Set(orders.map((o) => o.channel).filter(Boolean))].sort(),
    [orders]
  );
  const uniqueStatuses = useMemo(
    () => [...new Set(orders.map((o) => o.status).filter(Boolean))].sort(),
    [orders]
  );

  function rowMatchesApplied(t) {
    const f = appliedFilters;
    const memberQ = f.member.toLowerCase().trim();
    if (memberQ && !t.member.toLowerCase().includes(memberQ)) return false;
    const invQ = f.invoice.toLowerCase().trim();
    if (invQ && !t.invoice.toLowerCase().includes(invQ)) return false;
    if (f.status && t.status !== f.status) return false;
    if (f.channel && t.channel !== f.channel) return false;
    return true;
  }

  function rowMatchesSearch(t) {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      t.invoice.toLowerCase().includes(q) ||
      t.member.toLowerCase().includes(q) ||
      t.channel.toLowerCase().includes(q) ||
      t.status.toLowerCase().includes(q)
    );
  }

  const filteredSorted = useMemo(() => {
    let list = rowsWithOverrides.filter(rowMatchesApplied).filter(rowMatchesSearch);

    const dir = sortDir === 'asc' ? 1 : -1;
    list = [...list].sort((a, b) => {
      if (sortField === 'date') return String(a.date).localeCompare(String(b.date)) * dir;
      if (sortField === 'invoice') return String(a.invoice).localeCompare(String(b.invoice)) * dir;
      return 0;
    });

    return list;
  }, [rowsWithOverrides, appliedFilters, searchQuery, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / PAGE_SIZE));
  const displayPage = Math.min(Math.max(1, page), totalPages);

  const pagedRows = useMemo(() => {
    const start = (displayPage - 1) * PAGE_SIZE;
    return filteredSorted.slice(start, start + PAGE_SIZE);
  }, [filteredSorted, displayPage]);

  function toggleSort(field) {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir(field === 'date' ? 'desc' : 'asc');
    }
  }

  function handleSearchChange(value) {
    setSearchQuery(value);
    setPage(1);
  }

  function handleApplyFilters() {
    setAppliedFilters({ ...filterDraft });
    setPage(1);
    setFilterOpen(false);
    showToast('Filter diterapkan', 'success');
  }

  function handleResetFilters() {
    setFilterDraft(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
    setPage(1);
  }

  // Ganti gym → trigger refetch otomatis lewat useOrders
  function handleGymChange(newGymId) {
    setGymId(Number(newGymId));
    setPage(1);
  }

  // Ganti date range → trigger refetch otomatis
  function handleDateRangeChange(field, value) {
    setDateRange((prev) => ({ ...prev, [field]: value }));
    setPage(1);
  }

  function handleExportTable() {
    const headers = ['No.', 'Date', 'Invoice', 'Member', 'Amount', 'Status', 'Channel', 'Gym'];
    const rows = filteredSorted.map((t, i) => [
      i + 1, t.date, t.invoice, t.member, t.total, t.status, t.channel, t.gym,
    ]);
    exportTableToCSV(headers, rows, 'daily_transaction.csv');
    showToast('Export berhasil', 'success');
  }

  function handleDownloadVoidReport() {
    const voidRows = filteredSorted.filter((t) => t.status === 'VOID');
    if (voidRows.length === 0) {
      showToast('Tidak ada transaksi VOID pada filter saat ini.', 'error');
      return;
    }
    const headers = ['No', 'Date', 'Invoice', 'Member', 'Amount', 'Status', 'Channel', 'Gym'];
    const rows = voidRows.map((t, i) => [
      i + 1, t.date, t.invoice, t.member, t.total, t.status, t.channel, t.gym,
    ]);
    exportTableToCSV(headers, rows, 'void_transactions_report.csv');
    showToast('Laporan VOID diunduh.', 'success');
  }

  function confirmVoid() {
    if (!voidTarget) return;
    setStatusOverrides((prev) => ({ ...prev, [voidTarget.id]: 'VOID' }));
    setVoidTarget(null);
    showToast('Transaksi dibatalkan (VOID).', 'success');
  }

  const sortHint = (field) =>
    sortField === field ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '';

  return (
    <div className="p-4 lg:p-6">
      {/* API Controls: gym selector + date range + refresh */}
      <ApiControlBar
        gymId={gymId}
        gymList={gymList}
        dateRange={dateRange}
        loading={loading}
        onGymChange={handleGymChange}
        onDateChange={handleDateRangeChange}
        onRefresh={refetch}
      />

      {/* Toolbar: export, filter toggle, search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="md" icon={Download} onClick={handleExportTable}>
              Export
            </Button>
            <button
              type="button"
              onClick={() => setFilterOpen((o) => !o)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-violet-600 bg-violet-50 border border-violet-100 rounded-lg hover:bg-violet-100 transition-all shadow-sm"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filter
            </button>
            <button
              type="button"
              onClick={handleDownloadVoidReport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-red-500 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-all active:scale-95 uppercase tracking-wide"
            >
              <FileX className="w-3.5 h-3.5" />
              Download Filter Report on Void Trx
            </button>
          </div>
          <div className="w-full md:w-80">
            <SearchInput
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search invoice, member, channel..."
              className="[&_input]:py-2.5 [&_input]:rounded-xl [&_input]:pl-10"
            />
          </div>
        </div>

        {/* Panel filter */}
        <div className={`mt-4 pt-4 border-t border-gray-100 ${filterOpen ? '' : 'hidden'}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <FilterInput
              label="Member Name / ID"
              type="text"
              placeholder="Search member..."
              value={filterDraft.member}
              onChange={(v) => setFilterDraft((d) => ({ ...d, member: v }))}
            />
            <FilterInput
              label="Invoice No"
              type="text"
              placeholder="INV-..."
              value={filterDraft.invoice}
              onChange={(v) => setFilterDraft((d) => ({ ...d, invoice: v }))}
            />
            <FilterSelect
              label="Status"
              value={filterDraft.status}
              options={uniqueStatuses}
              placeholder="All Status"
              onChange={(v) => setFilterDraft((d) => ({ ...d, status: v }))}
            />
            <FilterSelect
              label="Channel"
              value={filterDraft.channel}
              options={uniqueChannels}
              placeholder="All Channel"
              onChange={(v) => setFilterDraft((d) => ({ ...d, channel: v }))}
            />
            <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-4">
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex-1 max-w-[160px] px-4 py-2 text-sm font-semibold text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleApplyFilters}
                className="flex-1 max-w-[160px] px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 shadow-sm transition-colors"
              >
                Apply Filter
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabel / Loading / Error */}
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : orders.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100">
                  <Th>No.</Th>
                  <Th sortable onClick={() => toggleSort('date')}>Date{sortHint('date')}</Th>
                  <Th sortable onClick={() => toggleSort('invoice')}>Invoice{sortHint('invoice')}</Th>
                  <Th>Member</Th>
                  <Th className="text-right">Amount</Th>
                  <Th>Status</Th>
                  <Th className="text-center">Channel</Th>
                  <Th className="text-center">Action</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {pagedRows.map((t, i) => {
                  const rowNo = (displayPage - 1) * PAGE_SIZE + i + 1;
                  return (
                    <tr key={t.id} className="hover:bg-violet-50/30 transition-colors">
                      <td className="px-6 py-4 text-gray-400 font-medium">{rowNo}</td>
                      <td className="px-6 py-4 font-semibold text-gray-600">{t.date}</td>
                      <td className="px-6 py-4 font-mono font-bold text-violet-600">{t.invoice}</td>
                      <td className="px-6 py-4 font-bold text-slate-800">{t.member}</td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-slate-900">
                        {formatIDR(t.total)}
                      </td>
                      <td className="px-6 py-4"><Badge status={t.status} /></td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-bold uppercase tracking-wide">
                          {t.channel}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setDetailTransaction(t)}
                            className="p-2 text-slate-300 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all"
                            aria-label="Detail transaksi"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            disabled={t.status === 'VOID'}
                            onClick={() => setVoidTarget(t)}
                            className="px-2 py-1 text-[10px] font-bold border border-red-200 text-red-500 rounded hover:bg-red-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            Void
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 bg-slate-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-slate-400 font-medium">
              Total: <span className="text-slate-900 font-bold">{filteredSorted.length}</span> records found
            </span>
            <Pagination currentPage={displayPage} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>
      )}

      {/* Modal konfirmasi VOID */}
      <Modal
        isOpen={!!voidTarget}
        onClose={() => setVoidTarget(null)}
        title="Void Transaction"
        maxWidth="max-w-sm"
        footer={
          <>
            <Button variant="outline" className="flex-1" onClick={() => setVoidTarget(null)}>Cancel</Button>
            <Button variant="danger" className="flex-1" onClick={confirmVoid}>Void Transaction</Button>
          </>
        }
      >
        <p className="text-sm text-gray-600 mb-4">Are you sure you want to void this transaction?</p>
        {voidTarget && (
          <div className="p-3 bg-gray-50 rounded-xl text-xs font-medium text-gray-700 space-y-1">
            <div className="font-bold">{voidTarget.invoice}</div>
            <div>Member: {voidTarget.member}</div>
            <div>Total: {formatIDR(voidTarget.total)}</div>
          </div>
        )}
      </Modal>

      {/* Modal detail */}
      <Modal
        isOpen={!!detailTransaction}
        onClose={() => setDetailTransaction(null)}
        title="Transaction Detail"
        maxWidth="max-w-md"
        footer={
          <Button variant="outline" onClick={() => setDetailTransaction(null)}>Close</Button>
        }
      >
        {detailTransaction && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <DetailRow label="Transaction ID" value={detailTransaction.id} mono />
            <DetailRow label="Invoice" value={detailTransaction.invoice} mono violet />
            <DetailRow label="Date" value={detailTransaction.date} />
            <DetailRow label="Member" value={detailTransaction.member} />
            <DetailRow label="Total" value={formatIDR(detailTransaction.total)} large mono />
            <DetailRow label="Status" value={<Badge status={detailTransaction.status} />} />
            <DetailRow
              label="Channel"
              value={
                <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-bold uppercase tracking-wide">
                  {detailTransaction.channel}
                </span>
              }
            />
            <DetailRow label="Gym" value={detailTransaction.gym} />
            <DetailRow label="Updated By" value={detailTransaction.updatedBy} />
          </div>
        )}
      </Modal>
    </div>
  );
}

// ──────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────

function ApiControlBar({ gymId, gymList, dateRange, loading, onGymChange, onDateChange, onRefresh }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
      <div className="flex flex-col md:flex-row md:items-end gap-4">
        {/* Gym selector */}
        <div className="flex-1 min-w-0">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
            Gym
          </label>
          <select
            value={gymId}
            onChange={(e) => onGymChange(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-violet-400"
          >
            <option value={-1}>All Gyms</option>
            {gymList.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>

        {/* Date range */}
        <div className="flex-1 min-w-0">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
            Start Date
          </label>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => onDateChange('startDate', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-violet-400"
          />
        </div>
        <div className="flex-1 min-w-0">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
            End Date
          </label>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => onDateChange('endDate', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-violet-400"
          />
        </div>

        {/* Refresh button */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-violet-600 bg-violet-50 border border-violet-100 rounded-lg hover:bg-violet-100 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 flex flex-col items-center justify-center gap-3">
      <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      <p className="text-sm text-gray-500 font-medium">Memuat data transaksi...</p>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-16 flex flex-col items-center justify-center gap-3">
      <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
        <X className="w-6 h-6 text-red-500" />
      </div>
      <p className="text-sm text-red-600 font-medium text-center max-w-md">{message}</p>
      <button
        onClick={onRetry}
        className="mt-2 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors"
      >
        Coba Lagi
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 flex flex-col items-center justify-center gap-3">
      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
        <FileX className="w-6 h-6 text-gray-400" />
      </div>
      <p className="text-sm text-gray-500 font-medium">Tidak ada data transaksi untuk periode ini.</p>
    </div>
  );
}

function Th({ children, sortable, onClick, className = '' }) {
  const base = 'px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest';
  if (sortable) {
    return (
      <th className={`${base} ${className}`}>
        <button
          type="button"
          onClick={onClick}
          className="cursor-pointer hover:text-violet-600 font-bold uppercase tracking-widest text-[11px] text-slate-400"
        >
          {children}
        </button>
      </th>
    );
  }
  return <th className={`${base} ${className}`}>{children}</th>;
}

function DetailRow({ label, value, mono, violet, large }) {
  return (
    <>
      <div className="text-gray-400 uppercase text-[10px] font-bold tracking-widest">{label}</div>
      <div className={`${mono ? 'font-mono' : ''} ${violet ? 'text-violet-600' : 'text-slate-800'} ${large ? 'text-lg' : ''} font-bold`}>
        {value}
      </div>
    </>
  );
}

function FilterInput({ label, value, onChange, ...props }) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-violet-400"
        {...props}
      />
    </div>
  );
}

function FilterSelect({ label, value, options, placeholder, onChange }) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-violet-400"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
