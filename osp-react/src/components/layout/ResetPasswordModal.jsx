import { useState } from 'react';
import Modal from '../ui/Modal';
import { useShowToast } from '../../contexts/ToastContext';

const EMPTY_FORM = { oldPassword: '', newPassword: '', confirmPassword: '' };

// Belum ada endpoint reset password di backend (masih sistem lama). Validasi
// di sini murni client-side, submit tidak benar-benar mengganti password.
export default function ResetPasswordModal({ isOpen, onClose }) {
  const showToast = useShowToast();
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setError('');
  };

  const handleClose = () => {
    setForm(EMPTY_FORM);
    setError('');
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      setError('New Password dan Confirm Password tidak sama.');
      return;
    }

    showToast('Password berhasil direset (lokal saja, belum tersimpan ke server)', 'success');
    handleClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Reset Password" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          Belum ada endpoint reset password di backend. Submit ini tidak benar-benar mengganti password kamu.
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Old Password *</label>
          <input
            type="password"
            required
            placeholder="Enter your current password"
            value={form.oldPassword}
            onChange={handleChange('oldPassword')}
            className="w-full border-b border-gray-200 py-1.5 text-sm focus:outline-none focus:border-violet-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">New Password *</label>
          <input
            type="password"
            required
            placeholder="Enter your new password"
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
            placeholder="Re-enter your new password"
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
          className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
        >
          Submit
        </button>
      </form>
    </Modal>
  );
}
