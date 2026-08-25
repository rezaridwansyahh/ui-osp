import { useState, useMemo } from 'react';
import { FileX, Loader2, Printer, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import * as XLSX from 'xlsx';
import { useShowToast } from '../contexts/ToastContext';
import { fetchOrders } from '../services/orderService';

const PAGE_SIZE = 20;

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
  { key: 'trxDate',       label: 'Trx Date',        render: (r) => formatDate(r.trxDate) },
  { key: 'trxId',         label: 'Trx Id',           render: (r) => r.trxId ?? '-' },
  { key: 'trxStatus',     label: 'Trx Status',       render: (r) => r.transactionStatus ?? '-' },
  { key: 'orderId',       label: 'Order Id',         render: (r) => r.orderId ?? '-' },
  { key: 'customerName',  label: 'Customer Name',    render: (r) => r.customerName ?? '-' },
  { key: 'productName',   label: 'Product Name',     render: (r) => r.productName ?? '-' },
  { key: 'channelType',   label: 'Channel Type',     render: (r) => r.channelType ?? '-' },
  { key: 'qty',           label: 'Qty and Price',    render: (r) => r.qty ?? '-' },
  { key: 'totalPrice',    label: 'Total Price',      money: true, render: (r) => r.totalPrice },
  { key: 'discountAmount',label: 'Discount Amount',  money: true, render: (r) => r.discountAmount },
  { key: 'paidAmount',    label: 'Paid Amount',      money: true, render: (r) => r.paidAmount },
  { key: 'keyfob',        label: 'Key No',           render: (r) => r.keyfob ?? '-' },
  { key: 'gymName',       label: 'Gym Name',         render: (r) => r.gymName ?? '-' },
  { key: 'channelType1',  label: 'Channel Type 1',   render: (r) => r.channelType1 ?? '-' },
  { key: 'cardType1',     label: 'Card Type 1',      render: (r) => r.cardType1 || '-' },
  { key: 'bank1',         label: 'Bank 1',           render: (r) => r.bank1 || '-' },
  { key: 'paidAmount1',   label: 'Paid Amount 1',    money: true, render: (r) => r.paidAmount1 },
  { key: 'cardNo1',       label: 'Card Number 1',    render: (r) => r.cardNo1 || '-' },
  { key: 'reference1',    label: 'Reference 1',      render: (r) => r.reference1 || '-' },
  { key: 'installment1',  label: 'Installment 1',    render: (r) => r.installment1 || '-' },
];

export default function OspReportPage() {
  const showToast = useShowToast();
  const { user } = useAuth();
  const gymList = user?.gymList ?? [];

  // Filter state
  const [gymId, setGymId]         = useState(-1);
  const [startDate, setStartDate] = useState(today());
  const [endDate, setEndDate]     = useState('');

  // Data state
  const [data, setData]           = useState([]);
  const [totalPages, setTotalPages]     = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [searched, setSearched]   = useState(false);

  // Pagination & search state
  const [page, setPage]           = useState(0); // 0-indexed (Spring)
  const [tableSearch, setTableSearch] = useState('');

  // ── Fetch from API ────────────────────────────────────────────
  async function fetchPage(targetPage) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchOrders({
        gymId,
        startDate,
        endDate: endDate || undefined,
        page: targetPage,
        size: PAGE_SIZE,
        sort: 'createdDate,desc',
      });

      const items      = res.content ?? [];
      const pages      = res.totalPages ?? 0;
      const elements   = res.totalElements ?? 0;

      setData(items);
      setTotalPages(pages);
      setTotalElements(elements);
      setPage(targetPage);
      setSearched(true);
      setTableSearch('');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Gagal memuat data.');
      setData([]);
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
    // Scroll table back to top
    document.getElementById('osp-table-wrap')?.scrollTo({ top: 0 });
  }

  // ── Client-side search within current page ────────────────────
  const filtered = useMemo(() => {
    if (!tableSearch) return data;
    const q = tableSearch.toLowerCase();
    return data.filter((r) =>
      (r.customerName ?? '').toLowerCase().includes(q) ||
      (r.gymName ?? '').toLowerCase().includes(q) ||
      (r.productName ?? '').toLowerCase().includes(q) ||
      String(r.trxId ?? '').includes(q) ||
      String(r.orderId ?? '').includes(q)
    );
  }, [data, tableSearch]);

  // ── Export (current page only) ────────────────────────────────
  function handleExportCSV() {
  const headers = COLUMNS.map((c) => c.label);
  const rows = filtered.map((r) =>
    COLUMNS.map((c) => {
      const val = c.render(r);
      return val ?? '-';
    })
  );

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'OSP Report');
  XLSX.writeFile(workbook, 'osp_report.xlsx');

  showToast('XLSX exported', 'success');
}

  // ── Pagination display helpers ────────────────────────────────
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
    <div className="p-4 lg:p-6 space-y-4">

      {/* ── Filter bar ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
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
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-violet-400"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-violet-400"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleSearch}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Search
          </button>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
          <X className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      {/* ── Table card ── */}
      {searched && !error && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Toolbar */}
          <div className="px-4 py-3 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleExportCSV}
                className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                CSV
              </button>
              <button
                onClick={handleExportCSV}
                className="px-3 py-1.5 text-xs font-bold text-white bg-green-600 rounded hover:bg-green-700"
              >
                Excel
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-gray-500 rounded hover:bg-gray-600"
              >
                <Printer className="w-3.5 h-3.5" /> Print
              </button>
              <span className="text-xs text-gray-400 ml-1">
                {totalElements.toLocaleString('id-ID')} records total
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Search page:</span>
              <input
                type="text"
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                placeholder="nama, gym, produk..."
                className="px-2 py-1 text-sm border border-gray-200 rounded outline-none focus:border-violet-400 w-44"
              />
            </div>
          </div>

          {/* Table */}
          <div id="osp-table-wrap" className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-20 gap-3">
                <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
                <span className="text-sm text-gray-500">Memuat data...</span>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-100">
                    <th className="px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                      No
                    </th>
                    {COLUMNS.map((c) => (
                      <th
                        key={c.key}
                        className="px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap"
                      >
                        {c.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={COLUMNS.length + 1}
                        className="px-4 py-12 text-center text-sm text-gray-400"
                      >
                        <FileX className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        No data found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((r, i) => (
                      <tr
                        key={`${r.id}-${i}`}
                        className="hover:bg-violet-50/30 transition-colors"
                      >
                        <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                          {page * PAGE_SIZE + i + 1}
                        </td>
                        {COLUMNS.map((c) => (
                          <td
                            key={c.key}
                            className={`px-4 py-3 whitespace-nowrap text-gray-700 ${
                              c.money ? 'font-mono text-right' : ''
                            }`}
                          >
                            {c.money ? formatIDR(c.render(r)) : (c.render(r) ?? '-')}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* ── Pagination footer ── */}
          <div className="px-4 py-3 bg-slate-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-slate-500">
              Showing{' '}
              <span className="font-bold text-slate-700">{startRecord}–{endRecord}</span>
              {' '}of{' '}
              <span className="font-bold text-slate-700">{totalElements.toLocaleString('id-ID')}</span>
              {' '}records
              {tableSearch && (
                <span className="text-violet-500 ml-1">
                  ({filtered.length} matched on this page)
                </span>
              )}
            </span>

            <div className="flex items-center gap-1">
              {/* Prev */}
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 0 || loading}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page numbers */}
              {getPageNumbers().map((p, idx) =>
                p === '...' ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="w-8 h-8 flex items-center justify-center text-xs text-gray-400"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    disabled={loading}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors disabled:cursor-not-allowed ${
                      p === page
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {p + 1}
                  </button>
                )
              )}

              {/* Next */}
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages - 1 || loading}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}