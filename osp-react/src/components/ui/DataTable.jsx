import { useState, useMemo } from 'react';
import Pagination from './Pagination';

export default function DataTable({
  columns,
  data,
  pageSize = 8,
  renderRow,
  emptyMessage = 'No data found.',
  footerLeft,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, asc: true });

  // Sort data kalo ada sort config
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;
    return [...data].sort((a, b) => {
      const aVal = String(a[sortConfig.key] ?? '');
      const bVal = String(b[sortConfig.key] ?? '');
      const result = aVal.localeCompare(bVal, undefined, { numeric: true });
      return sortConfig.asc ? result : -result;
    });
  }, [data, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startIdx = (currentPage - 1) * pageSize;
  const pageData = sortedData.slice(startIdx, startIdx + pageSize);

  // Reset ke page 1 kalo data berubah
  useMemo(() => {
    if (currentPage > Math.ceil(data.length / pageSize)) {
      setCurrentPage(1);
    }
  }, [data.length, currentPage, pageSize]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      asc: prev.key === key ? !prev.asc : true,
    }));
  };

  const endIdx = Math.min(startIdx + pageSize, sortedData.length);
  const rangeText = sortedData.length > 0 ? `${startIdx + 1}-${endIdx}` : '0';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-gray-200">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'} ${col.width || ''}`}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable && (
                      <button
                        className="text-gray-400 hover:text-gray-600 ml-0.5"
                        onClick={() => handleSort(col.key)}
                      >
                        {sortConfig.key === col.key
                          ? sortConfig.asc ? '▲' : '▼'
                          : '▼'}
                      </button>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-400 text-sm">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              pageData.map((row, idx) => renderRow(row, startIdx + idx))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-gray-100 gap-2">
        <p className="text-xs text-gray-500">
          {footerLeft || `Showing ${rangeText} of ${sortedData.length} records`}
        </p>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
