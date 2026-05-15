import { useState, useEffect, useCallback } from 'react';
import { fetchOrders, mapOrderToTransaction } from '../services/orderService';

// Default range: 6 bulan terakhir sampai hari ini
function getDefaultDateRange() {
  const today = new Date();
  const sixMonthsAgo = new Date(today);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const fmt = (d) => d.toISOString().slice(0, 10);
  return { startDate: fmt(sixMonthsAgo), endDate: fmt(today) };
}

/**
 * Custom hook buat fetch data order dari API.
 * Return: { orders, loading, error, refetch, gymId, setGymId, dateRange, setDateRange }
 */
export default function useOrders(initialGymId = -1) {
  const defaultRange = getDefaultDateRange();

  const [gymId, setGymId] = useState(initialGymId);
  const [dateRange, setDateRange] = useState(defaultRange);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const rawData = await fetchOrders({
        gymId,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });

      // Log raw response supaya gampang debug dan mapping field
      console.log('[useOrders] Raw API response:', rawData);

      // Response bisa berupa array langsung atau object { data: [...] }
      const items = Array.isArray(rawData) ? rawData : (rawData?.data ?? rawData?.content ?? []);

      const mapped = items.map((item, i) => mapOrderToTransaction(item, i));
      setOrders(mapped);
    } catch (err) {
      console.error('[useOrders] Fetch error:', err);
      setError(err.response?.data?.message || err.message || 'Gagal memuat data order.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [gymId, dateRange]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return {
    orders,
    loading,
    error,
    refetch: loadOrders,
    gymId,
    setGymId,
    dateRange,
    setDateRange,
  };
}
