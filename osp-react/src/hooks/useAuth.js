import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContextObject';

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus dipanggil di dalam AuthProvider');
  return ctx;
}
