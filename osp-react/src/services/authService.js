import api from './api';
import { saveToken, saveUser } from '../utils/jwt';

/**
 * Login ke backend OSP.
 * Kirim username & password, simpan JWT + user data kalau berhasil.
 */
export async function loginAPI(username, password) {
  try {
    const { data } = await api.post('/v2/login', { username, password });

    // Simpan JWT token dan user data ke localStorage
    saveToken(data.jwt);
    saveUser(data.user);

    return {
      success: true,
      token: data.jwt,
      user: data.user,
    };
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      'Username atau password salah.';

    return { success: false, error: message };
  }
}
