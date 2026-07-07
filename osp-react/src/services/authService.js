import api from './api';
import { saveToken, saveUser } from '../utils/jwt';

function resolveBrandId(user) {
  if (user.brandId) return user.brandId;
  
  const role = user.role?.toLowerCase() ?? '';
  if (role.includes('bee active')) return 2;
  if (role.includes('anytime fitness')) return 1;
  return null;
}

export async function loginAPI(username, password) {
  try {
    const { data } = await api.post('/api/v2/login', { username, password });

    const resolvedUser = {
      ...data.user,
      brandId: resolveBrandId(data.user),
    };

    saveToken(data.jwt);
    saveUser(resolvedUser);

    return {
      success: true,
      token: data.jwt,
      user: resolvedUser,
    };
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      'Username atau password salah.';

    return { success: false, error: message };
  }
}