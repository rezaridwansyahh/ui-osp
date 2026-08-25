import api from './api';

/** Semua payment type — tidak butuh param. */
export async function fetchPaymentTypes() {
  const { data } = await api.get('/master/paymenttype');
  return data;
}

/** Semua gym (format lama /master/gyms, sorted by name). */
export async function fetchMasterGyms() {
  const { data } = await api.get('/master/gyms');
  return data;
}