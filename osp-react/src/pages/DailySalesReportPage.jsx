import { useState, useMemo } from 'react';
import { Printer, FileText, FileSpreadsheet, RefreshCw, FileX, Loader2, Search } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useShowToast } from '../contexts/ToastContext';
import { useOrderReport } from '../hooks/useOrderReport';
import { exportColumnsToXlsx } from '../utils/reportExport';
import { formatIDR, today } from '../utils/helpers';
import ReportFilterBar from '../components/ui/ReportFilterBar';
import ReportPagination from '../components/ui/ReportPagination';

const PAGE_SIZE = 20;

function fmtDate(str) {
  if (!str || str === '-') return '-';
  return String(str).split('T')[0].replace(' ', '').slice(0, 10);
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
  { label: 'Debit Amount', key: 'paidAmount',     render: (o) => formatIDR(o.paidAmount), cls: 'text-right font-mono' },
  { label: 'Internal MDR', key: 'internalMdr',    render: (o) => o.internalMdr ?? '-' },
  { label: 'External MDR', key: 'externalMdr',    render: (o) => o.externalMdr ?? '-' },
  { label: 'MDR',          key: 'mdrRp',          render: (o) => formatIDR(o.mdrRp), cls: 'text-right font-mono' },
];

// ─── Main page ────────────────────────────────────────────────────
export default function DailySalesReportPage() {
  const { user } = useAuth();
  const showToast = useShowToast();

  const gymList = user?.gymList ?? [];

  // Filter state (halaman yang pegang)
  const [gymId, setGymId] = useState(user?.gymId ?? -1);
  const [startDate, setStartDate] = useState(today());
  const [endDate, setEndDate] = useState(today());

  const {
    rows, totalPages, totalElements, page, loading, error, searched,
    search, setSearch, runSearch, goToPage,
  } = useOrderReport({ pageSize: PAGE_SIZE });

  const doSearch = () => runSearch({ gymId, startDate, endDate });

  const handlePageChange = (newPage) => {
    goToPage(newPage);
    document.getElementById('dsr-table-wrap')?.scrollTo({ top: 0 });
  };

  // Filter client-side dalam halaman aktif
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

  const handleExport = () => {
    exportColumnsToXlsx(COLS, filtered, {
      fileName: 'daily-sales-report.xlsx',
      sheetName: 'Daily Sales Report',
    });
    showToast?.('XLSX berhasil diunduh', 'success');
  };

  return (
    <div className="p-6 space-y-4">
      <ReportFilterBar
        gymId={gymId}
        onGymIdChange={setGymId}
        gymList={gymList}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        onSearch={doSearch}
        loading={loading}
      />

      {/* ── Action bar ── */}
      {searched && !loading && (
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition"
          >
            <FileText className="w-3.5 h-3.5" /> CSV
          </button>
          <button
            onClick={handleExport}
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
          <IdleState onRefresh={doSearch} />
        ) : loading ? (
          <LoadingState />
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-red-400">
            <p className="text-sm">{error}</p>
            <button onClick={doSearch} className="mt-3 text-xs text-violet-500 underline">
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

            <ReportPagination
              page={page}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={PAGE_SIZE}
              loading={loading}
              onPageChange={handlePageChange}
              matchedCount={filtered.length}
              searchActive={!!search}
            />
          </>
        )}
      </div>
    </div>
  );
}
