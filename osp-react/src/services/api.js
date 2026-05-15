import axios from 'axios';
import { getToken, removeToken } from '../utils/jwt';

// Base URL: di development pakai proxy Vite, di production pakai URL lengkap
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/pos-backend';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Request interceptor — otomatis inject JWT token ke setiap request
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle 401 (token expired / unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
      localStorage.removeItem('osp_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
