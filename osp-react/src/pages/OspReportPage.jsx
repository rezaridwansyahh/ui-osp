import { useState, useMemo } from 'react';
import { FileX, Loader2, Printer, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useShowToast } from '../contexts/ToastContext';
import { useOrderReport } from '../hooks/useOrderReport';
import { exportColumnsToXlsx } from '../utils/reportExport';
import { formatIDR, today } from '../utils/helpers';
import ReportFilterBar from '../components/ui/ReportFilterBar';
import ReportPagination from '../components/ui/ReportPagination';

const PAGE_SIZE = 20;

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

  // Filter state (halaman yang pegang)
  const [gymId, setGymId] = useState(-1);
  const [startDate, setStartDate] = useState(today());
  const [endDate, setEndDate] = useState('');

  const {
    rows, totalPages, totalElements, page, loading, error, searched,
    search, setSearch, runSearch, goToPage,
  } = useOrderReport({ pageSize: PAGE_SIZE });

  const doSearch = () => runSearch({ gymId, startDate, endDate });

  const handlePageChange = (newPage) => {
    goToPage(newPage);
    document.getElementById('osp-table-wrap')?.scrollTo({ top: 0 });
  };

  // Filter client-side dalam halaman aktif
  const filtered = useMemo(() => {
    if (!search) return rows;
    const q = search.toLowerCase();
    return rows.filter((r) =>
      (r.customerName ?? '').toLowerCase().includes(q) ||
      (r.gymName ?? '').toLowerCase().includes(q) ||
      (r.productName ?? '').toLowerCase().includes(q) ||
      String(r.trxId ?? '').includes(q) ||
      String(r.orderId ?? '').includes(q)
    );
  }, [rows, search]);

  const handleExportCSV = () => {
    exportColumnsToXlsx(COLUMNS, filtered, {
      fileName: 'osp_report.xlsx',
      sheetName: 'OSP Report',
    });
    showToast('XLSX exported', 'success');
  };

  return (
    <div className="p-4 lg:p-6 space-y-4">
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
                className="px-3 py-1.5 text-xs font-bold text-white bg-violet-600 rounded hover:bg-violet-700"
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
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
        </div>
      )}
    </div>
  );
}
