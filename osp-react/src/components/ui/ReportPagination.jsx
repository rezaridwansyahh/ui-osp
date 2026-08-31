import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getPageWindow } from '../../utils/pagination';

// Footer pagination bersama buat report berbasis order. page & totalPages
// 0-indexed (Spring Pageable). matchedCount/searchActive opsional — buat
// nampilin "(N matched)" pas ada pencarian client-side di halaman aktif.
export default function ReportPagination({
  page,
  totalPages,
  totalElements,
  pageSize,
  loading = false,
  onPageChange,
  matchedCount,
  searchActive = false,
}) {
  const startRecord = totalElements === 0 ? 0 : page * pageSize + 1;
  const endRecord = Math.min((page + 1) * pageSize, totalElements);

  const numBtn =
    'w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors disabled:cursor-not-allowed';
  const arrowBtn =
    'w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors';

  return (
    <div className="px-4 py-3 bg-slate-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
      <span className="text-xs text-slate-500">
        Showing{' '}
        <span className="font-bold text-slate-700">
          {startRecord}–{endRecord}
        </span>{' '}
        of{' '}
        <span className="font-bold text-slate-700">
          {totalElements.toLocaleString('id-ID')}
        </span>{' '}
        records
        {searchActive && (
          <span className="text-violet-500 ml-1">({matchedCount} matched)</span>
        )}
      </span>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0 || loading}
          className={arrowBtn}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {getPageWindow(page, totalPages).map((p, idx) =>
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
              onClick={() => onPageChange(p)}
              disabled={loading}
              className={`${numBtn} ${
                p === page
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {p + 1}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1 || loading}
          className={arrowBtn}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
