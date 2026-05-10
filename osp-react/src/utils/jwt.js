const TOKEN_KEY = 'osp_token';
const USER_KEY = 'osp_user';

// Decode payload dari JWT token (base64 decode bagian tengah)
export function decodeToken(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(atob(parts[1]));
  } catch {
    return null;
  }
}

// Cek apakah token masih valid berdasarkan field `exp` dari backend
export function isTokenValid(token) {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) return false;
  // `exp` dari backend biasanya dalam detik (Unix timestamp)
  return Date.now() < payload.exp * 1000;
}

// ── Token Storage ──────────────────────────────

export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// ── User Storage ───────────────────────────────

export function saveUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function removeUser() {
  localStorage.removeItem(USER_KEY);
}

// Bersihkan semua data auth (token + user)
export function clearAuth() {
  removeToken();
  removeUser();
}
