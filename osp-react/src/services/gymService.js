import api from './api';

// Entry dummy/testing dari backend yang bukan gym asli — jangan ditampilkan
const EXCLUDED_GYM_NAMES = ['Development', 'MEMBR Merchant'];

export async function fetchGyms() {
  const { data } = await api.get('/pos-backend/master/gyms');
  return data.filter((gym) => !EXCLUDED_GYM_NAMES.includes(gym.name));
}