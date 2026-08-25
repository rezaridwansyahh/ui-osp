import { useState } from 'react';
import Modal from '../ui/Modal';
import { useShowToast } from '../../contexts/ToastContext';

const EMPTY_FORM = {
  userId: '',
  shortName: '',
  title: 'Mr',
  email: '',
  firstName: '',
  phone: '',
  lastName: '',
  role: '',
};

function buildInitialForm(user) {
  return {
    ...EMPTY_FORM,
    userId: user?.username || user?.id || '',
    role: user?.role || '',
  };
}

// Belum ada endpoint update profile di backend (masih sistem lama, sama seperti
// processPayment di MonthlyPaymentPage). Field yang tidak tersedia di objek
// user (shortName, title, email, firstName, phone, lastName) dibiarkan kosong,
// bukan dikarang — lihat aturan CLAUDE.md.
export default function EditProfileModal({ isOpen, onClose, user }) {
  const showToast = useShowToast();
  const [form, setForm] = useState(() => buildInitialForm(user));

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    showToast('Profil berhasil diupdate (lokal saja, belum tersimpan ke server)', 'success');
    onClose();
  };

  const handleClose = () => {
    setForm(buildInitialForm(user));
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Profile" maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          Belum ada endpoint update profile di backend. Perubahan hanya lokal dan tidak tersimpan ke server.
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">User Id</label>
            <input
              type="text"
              value={form.userId}
              onChange={handleChange('userId')}
              className="w-full border-b border-gray-200 py-1.5 text-sm focus:outline-none focus:border-violet-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Short Name</label>
            <input
              type="text"
              value={form.shortName}
              onChange={handleChange('shortName')}
              className="w-full border-b border-gray-200 py-1.5 text-sm focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
            <select
              value={form.title}
              onChange={handleChange('title')}
              className="w-full border-b border-gray-200 py-1.5 text-sm focus:outline-none focus:border-violet-500 bg-transparent"
            >
              <option value="Mr">Mr</option>
              <option value="Mrs">Mrs</option>
              <option value="Ms">Ms</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Email *</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={handleChange('email')}
              className="w-full border-b border-gray-200 py-1.5 text-sm focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">First Name *</label>
            <input
              type="text"
              required
              value={form.firstName}
              onChange={handleChange('firstName')}
              className="w-full border-b border-gray-200 py-1.5 text-sm focus:outline-none focus:border-violet-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
            <input
              type="tel"
              placeholder="e.g., +62 812 3456 7890"
              value={form.phone}
              onChange={handleChange('phone')}
              className="w-full border-b border-gray-200 py-1.5 text-sm focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Last Name *</label>
            <input
              type="text"
              required
              value={form.lastName}
              onChange={handleChange('lastName')}
              className="w-full border-b border-gray-200 py-1.5 text-sm focus:outline-none focus:border-violet-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Role</label>
            <input
              type="text"
              value={form.role}
              onChange={handleChange('role')}
              className="w-full border-b border-gray-200 py-1.5 text-sm focus:outline-none focus:border-violet-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-4 py-2.5 text-sm font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors shadow-sm"
        >
          Save
        </button>
      </form>
    </Modal>
  );
}
