import { useState, useCallback } from 'react';
import { fetchOrders } from '../services/orderService';

/**
 * State machine bersama buat report berbasis order (DailySalesReport & OspReport):
 * fetch server-side paginated dari `fetchOrders`, simpan halaman aktif, dan
 * pegang 1 kotak pencarian client-side buat filter baris di halaman yang lagi
 * kebuka.
 *
 * Filter (gymId / startDate / endDate) tetap dipegang halaman masing-masing —
 * dioper ke `runSearch(params)`. `goToPage` pakai params terakhir yang dipakai.
 */
export function useOrderReport({ pageSize = 20, sort = 'createdDate,desc' } = {}) {
  const [rows, setRows] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const [search, setSearch] = useState('');
  const [lastParams, setLastParams] = useState(null);

  const fetchPage = useCallback(
    async (params, targetPage) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchOrders({
          gymId: params.gymId,
          startDate: params.startDate,
          endDate: params.endDate || undefined,
          page: targetPage,
          size: pageSize,
          sort,
        });
        setRows(res.content ?? []);
        setTotalPages(res.totalPages ?? 0);
        setTotalElements(res.totalElements ?? 0);
        setPage(targetPage);
        setSearched(true);
        setSearch('');
        setLastParams(params);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Gagal memuat data.');
        setRows([]);
      } finally {
        setLoading(false);
      }
    },
    [pageSize, sort]
  );

  const runSearch = useCallback((params) => fetchPage(params, 0), [fetchPage]);

  const goToPage = useCallback(
    (targetPage) => {
      if (!lastParams || targetPage < 0 || targetPage >= totalPages) return;
      fetchPage(lastParams, targetPage);
    },
    [fetchPage, lastParams, totalPages]
  );

  return {
    rows,
    totalPages,
    totalElements,
    page,
    pageSize,
    loading,
    error,
    searched,
    search,
    setSearch,
    runSearch,
    goToPage,
  };
}
