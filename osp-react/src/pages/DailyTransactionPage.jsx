import { useState, useMemo } from 'react';
import { Download, SlidersHorizontal, FileX, Eye, X } from 'lucide-react';
import {
  TRANSACTIONS,
  TRANSACTION_CHANNELS,
  TRANSACTION_STATUSES,
  GYMS,
} from '../data/transactions';
import { useShowToast } from '../contexts/ToastContext';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import SearchInput from '../components/ui/SearchInput';
import Pagination from '../components/ui/Pagination';
import Modal from '../components/ui/Modal';
import { exportTableToCSV, formatIDR } from '../utils/helpers';

const PAGE_SIZE = 8;

const EMPTY_FILTERS = {
  dateFrom: '',
  dateTo: '',
  member: '',
  invoice: '',
  status: '',
  channel: '',
  gym: '',
};

// Halaman transaksi harian — konversi dari dailytransaction.html:
// toolbar, filter collapsible, tabel custom + pagination, modal void & detail
export default function DailyTransactionPage() {
  const showToast = useShowToast();

  // Status VOID dari aksi user (map id -> status), tanpa mutasi TRANSACTIONS asli
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

  const rowsWithOverrides = useMemo(
    () =>
      TRANSACTIONS.map((t) => ({
        ...t,
        status: statusOverrides[t.id] ?? t.status,
      })),
    [statusOverrides]
  );

  function rowMatchesApplied(t) {
    const f = appliedFilters;
    if (f.dateFrom && t.date < f.dateFrom) return false;
    if (f.dateTo && t.date > f.dateTo) return false;
    const memberQ = f.member.toLowerCase().trim();
    if (memberQ && !t.member.toLowerCase().includes(memberQ)) return false;
    const invQ = f.invoice.toLowerCase().trim();
    if (invQ && !t.invoice.toLowerCase().includes(invQ)) return false;
    if (f.status && t.status !== f.status) return false;
    if (f.channel && t.channel !== f.channel) return false;
    if (f.gym && t.gym !== f.gym) return false;
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
      if (sortField === 'date') {
        return a.date.localeCompare(b.date) * dir;
      }
      if (sortField === 'invoice') {
        return a.invoice.localeCompare(b.invoice) * dir;
      }
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

  function handleExportTable() {
    const headers = ['No.', 'Date', 'Invoice', 'Member', 'Amount', 'Status', 'Channel', 'Gym'];
    const rows = filteredSorted.map((t, i) => [
      i + 1,
      t.date,
      t.invoice,
      t.member,
      t.total,
      t.status,
      t.channel,
      t.gym,
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
      i + 1,
      t.date,
      t.invoice,
      t.member,
      t.total,
      t.status,
      t.channel,
      t.gym,
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

        {/* Panel filter bisa di-toggle (violet toolbar) */}
        <div
          className={`mt-4 pt-4 border-t border-gray-100 ${filterOpen ? '' : 'hidden'}`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                Date From
              </label>
              <input
                type="date"
                value={filterDraft.dateFrom}
                onChange={(e) =>
                  setFilterDraft((d) => ({ ...d, dateFrom: e.target.value }))
                }
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-violet-400"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                Date To
              </label>
              <input
                type="date"
                value={filterDraft.dateTo}
                onChange={(e) =>
                  setFilterDraft((d) => ({ ...d, dateTo: e.target.value }))
                }
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-violet-400"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                Member Name / ID
              </label>
              <input
                type="text"
                value={filterDraft.member}
                onChange={(e) =>
                  setFilterDraft((d) => ({ ...d, member: e.target.value }))
                }
                placeholder="Search member..."
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-violet-400"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                Invoice No
              </label>
              <input
                type="text"
                value={filterDraft.invoice}
                onChange={(e) =>
                  setFilterDraft((d) => ({ ...d, invoice: e.target.value }))
                }
                placeholder="INV-..."
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-violet-400"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                Status
              </label>
              <select
                value={filterDraft.status}
                onChange={(e) =>
                  setFilterDraft((d) => ({ ...d, status: e.target.value }))
                }
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-violet-400"
              >
                <option value="">All Status</option>
                {TRANSACTION_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                Channel
              </label>
              <select
                value={filterDraft.channel}
                onChange={(e) =>
                  setFilterDraft((d) => ({ ...d, channel: e.target.value }))
                }
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-violet-400"
              >
                <option value="">All Channel</option>
                {TRANSACTION_CHANNELS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                Gym
              </label>
              <select
                value={filterDraft.gym}
                onChange={(e) =>
                  setFilterDraft((d) => ({ ...d, gym: e.target.value }))
                }
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-violet-400"
              >
                <option value="">All Gyms</option>
                {GYMS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex-1 px-4 py-2 text-sm font-semibold text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleApplyFilters}
                className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 shadow-sm transition-colors"
              >
                Apply Filter
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabel custom (tanpa DataTable) + pagination manual */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-100">
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  No.
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  <button
                    type="button"
                    onClick={() => toggleSort('date')}
                    className="cursor-pointer hover:text-violet-600 font-bold uppercase tracking-widest text-[11px] text-slate-400"
                  >
                    Date{sortHint('date')}
                  </button>
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  <button
                    type="button"
                    onClick={() => toggleSort('invoice')}
                    className="cursor-pointer hover:text-violet-600 font-bold uppercase tracking-widest text-[11px] text-slate-400"
                  >
                    Invoice{sortHint('invoice')}
                  </button>
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Member
                </th>
                <th className="px-6 py-4 text-right text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Amount
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Status
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">
                  Channel
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {pagedRows.map((t, i) => {
                const rowNo = (displayPage - 1) * PAGE_SIZE + i + 1;
                return (
                  <tr
                    key={t.id}
                    className="hover:bg-violet-50/30 transition-colors"
                  >
                    <td className="px-6 py-4 text-gray-400 font-medium">{rowNo}</td>
                    <td className="px-6 py-4 font-semibold text-gray-600">{t.date}</td>
                    <td className="px-6 py-4 font-mono font-bold text-violet-600">
                      {t.invoice}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">{t.member}</td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-slate-900">
                      {formatIDR(t.total)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge status={t.status} />
                    </td>
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
            Total:{' '}
            <span className="text-slate-900 font-bold">{filteredSorted.length}</span>{' '}
            records found
          </span>
          <Pagination
            currentPage={displayPage}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* Modal konfirmasi VOID */}
      <Modal
        isOpen={!!voidTarget}
        onClose={() => setVoidTarget(null)}
        title="Void Transaction"
        maxWidth="max-w-sm"
        footer={
          <>
            <Button variant="outline" className="flex-1" onClick={() => setVoidTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" className="flex-1" onClick={confirmVoid}>
              Void Transaction
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to void this transaction?
        </p>
        {voidTarget && (
          <div className="p-3 bg-gray-50 rounded-xl text-xs font-medium text-gray-700 space-y-1">
            <div className="font-bold">{voidTarget.invoice}</div>
            <div>Member: {voidTarget.member}</div>
            <div>Total: {formatIDR(voidTarget.total)}</div>
          </div>
        )}
      </Modal>

      {/* Modal detail: grid 2 kolom, semua field transaksi */}
      <Modal
        isOpen={!!detailTransaction}
        onClose={() => setDetailTransaction(null)}
        title="Transaction Detail"
        maxWidth="max-w-md"
        footer={
          <Button variant="outline" onClick={() => setDetailTransaction(null)}>
            Close
          </Button>
        }
      >
        {detailTransaction && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-gray-400 uppercase text-[10px] font-bold tracking-widest">
              Transaction ID
            </div>
            <div className="font-mono font-bold text-slate-800">{detailTransaction.id}</div>
            <div className="text-gray-400 uppercase text-[10px] font-bold tracking-widest">
              Invoice
            </div>
            <div className="font-bold text-violet-600 font-mono">{detailTransaction.invoice}</div>
            <div className="text-gray-400 uppercase text-[10px] font-bold tracking-widest">
              Date
            </div>
            <div className="font-bold text-slate-800">{detailTransaction.date}</div>
            <div className="text-gray-400 uppercase text-[10px] font-bold tracking-widest">
              Member
            </div>
            <div className="font-bold text-slate-800">{detailTransaction.member}</div>
            <div className="text-gray-400 uppercase text-[10px] font-bold tracking-widest">
              Total
            </div>
            <div className="font-bold text-slate-900 font-mono text-lg">
              {formatIDR(detailTransaction.total)}
            </div>
            <div className="text-gray-400 uppercase text-[10px] font-bold tracking-widest">
              Status
            </div>
            <div>
              <Badge status={detailTransaction.status} />
            </div>
            <div className="text-gray-400 uppercase text-[10px] font-bold tracking-widest">
              Channel
            </div>
            <div>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-bold uppercase tracking-wide">
                {detailTransaction.channel}
              </span>
            </div>
            <div className="text-gray-400 uppercase text-[10px] font-bold tracking-widest">
              Gym
            </div>
            <div className="font-medium text-gray-600">{detailTransaction.gym}</div>
            <div className="text-gray-400 uppercase text-[10px] font-bold tracking-widest">
              Updated By
            </div>
            <div className="font-medium text-gray-600">{detailTransaction.updatedBy}</div>
          </div>
        )}
      </Modal>
    </div>
  );
}
