import { useState } from 'react';
import Modal from '../ui/Modal';
import { useShowToast } from '../../contexts/ToastContext';
import { resetPassword } from '../../services/authService';
import { isEndpointMissing } from '../../utils/apiErrors';

const NOT_DEPLOYED_MSG =
  'Endpoint reset password belum aktif di server ini — menunggu deploy dari tim backend.';

const EMPTY_FORM = { newPassword: '', confirmPassword: '' };

// PATCH /user/reset-password — reset ala-admin: set password baru langsung,
// TIDAK butuh password lama (makanya gak ada field "Old Password"). `userId`
// yang dikirim ke backend adalah username, bukan id numerik.
export default function ResetPasswordModal({ isOpen, onClose, user }) {
  const showToast = useShowToast();
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const userId = user?.username ?? user?.id ?? '';

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setError('');
  };

  const handleClose = () => {
    setForm(EMPTY_FORM);
    setError('');
    setSaving(false);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.newPassword.length < 6) {
      setError('Password baru minimal 6 karakter.');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('New Password dan Confirm Password tidak sama.');
      return;
    }
    if (!userId) {
      setError('User tidak dikenali — coba login ulang.');
      return;
    }

    setSaving(true);
    try {
      await resetPassword(userId, form.newPassword);
      showToast('Password berhasil diganti.', 'success');
      handleClose();
    } catch (err) {
      setError(
        isEndpointMissing(err)
          ? NOT_DEPLOYED_MSG
          : err.response?.data?.responseMessage || err.message || 'Gagal reset password.'
      );
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Reset Password" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-gray-500">
          Password baru akan langsung dipakai. Kamu tidak perlu memasukkan
          password lama.
        </p>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">New Password *</label>
          <input
            type="password"
            required
            placeholder="Minimal 6 karakter"
            value={form.newPassword}
            onChange={handleChange('newPassword')}
            className="w-full border-b border-gray-200 py-1.5 text-sm focus:outline-none focus:border-violet-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Confirm Password *</label>
          <input
            type="password"
            required
            placeholder="Ulangi password baru"
            value={form.confirmPassword}
            onChange={handleChange('confirmPassword')}
            className="w-full border-b border-gray-200 py-1.5 text-sm focus:outline-none focus:border-violet-500"
          />
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Menyimpan...' : 'Submit'}
        </button>
      </form>
    </Modal>
  );
}
