import { useState, useCallback } from 'react';
import { fetchOrders, mapOrderToTransaction } from '../services/orderService';

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

export default function useOrders(initialGymId = -1) {
  const [gymId, setGymId] = useState(initialGymId);
  const [dateRange, setDateRange] = useState({ startDate: getToday(), endDate: getToday() });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const rawData = await fetchOrders({
        gymId,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });

      console.log('[useOrders] Raw API response:', rawData);

      const items = Array.isArray(rawData) ? rawData : (rawData?.data ?? rawData?.content ?? []);
      const mapped = items.map((item, i) => mapOrderToTransaction(item, i));
      setOrders(mapped);
      setSearched(true);
    } catch (err) {
      console.error('[useOrders] Fetch error:', err);
      setError(err.response?.data?.message || err.message || 'Gagal memuat data order.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [gymId, dateRange]);

  return {
    orders,
    loading,
    error,
    searched,
    refetch: loadOrders,
    gymId,
    setGymId,
    dateRange,
    setDateRange,
  };
}
