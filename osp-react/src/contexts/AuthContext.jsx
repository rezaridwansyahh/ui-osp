import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getToken, isTokenValid, clearAuth, getUser } from '../utils/jwt';
import { loginAPI } from '../services/authService';
import { applyTheme, resetTheme } from '../services/themeService';

const AuthContext = createContext(null);

// Tentuin apakah user punya akses gym yang valid.
// gymList kosong ATAU brandId null/undefined → dianggap no-gym.
function hasGymAccess(user) {
  return !!(user?.gymList?.length > 0 && user?.brandId !== null && user?.brandId !== undefined);
}

// Ambil user dari localStorage kalau token masih valid
function getUserFromStorage() {
  const token = getToken();
  if (!token || !isTokenValid(token)) {
    clearAuth();
    return null;
  }
  const user = getUser();
  // Apply theme langsung saat app load (kalau sudah login)
  // No gym access → reset ke default, jangan biarkan tema lama nyangkut
  if (hasGymAccess(user)) applyTheme(user.brandId);
  else resetTheme();
  return user;
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
      // Apply theme sesuai brandId dari user yang login
      // No gym access → reset eksplisit, jangan biarkan tema sesi sebelumnya nyangkut
      if (hasGymAccess(result.user)) {
        applyTheme(result.user.brandId);
      } else {
        resetTheme();
      }
    }
    return result;
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
    resetTheme();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        hasGymAccess: hasGymAccess(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus dipanggil di dalam AuthProvider');
  return ctx;
}