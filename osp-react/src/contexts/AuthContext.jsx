import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getToken, isTokenValid, clearAuth, getUser } from '../utils/jwt';
import { loginAPI } from '../services/authService';

const AuthContext = createContext(null);

// Ambil user dari localStorage kalau token masih valid
function getUserFromStorage() {
  const token = getToken();
  if (!token || !isTokenValid(token)) {
    clearAuth();
    return null;
  }
  return getUser();
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getUserFromStorage);

  // Sync state kalau tab lain logout/login (storage event)
  useEffect(() => {
    const handleStorage = () => setUser(getUserFromStorage());
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Login via API — async karena nembak endpoint real
  const login = useCallback(async (username, password) => {
    const result = await loginAPI(username, password);
    if (result.success) {
      setUser(result.user);
    }
    return result;
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus dipanggil di dalam AuthProvider');
  return ctx;
}
