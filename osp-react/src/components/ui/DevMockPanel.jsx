import { useState } from 'react';
import { applyTheme, resetTheme } from '../../services/themeService';

// Key ini harus match sama USER_KEY di utils/jwt.js
const USER_STORAGE_KEY = 'osp_user';

const MOCK_OPTIONS = [
  { label: 'OSP Admin (brandId 3)', brandId: 3 },
  { label: 'Anytime Fitness (brandId 1)', brandId: 1 },
  { label: 'Bee Active (brandId 2)', brandId: 2 },
  { label: 'No brand (null)', brandId: null },
];

export default function DevMockPanel() {
  const [open, setOpen] = useState(false);

  // Cuma render kalau mode development — otomatis hilang di production build
  if (!import.meta.env.DEV) return null;

  const mockBrandId = (brandId) => {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) {
      alert('Belum ada user di localStorage. Login dulu ya.');
      return;
    }

    const user = JSON.parse(raw);
    user.brandId = brandId;
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));

    if (brandId) applyTheme(brandId);
    else resetTheme();

    window.location.reload(); // reload biar AuthContext & sidebar re-read state baru
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      {open && (
        <div className="mb-2 bg-white border border-gray-300 rounded-lg shadow-lg p-2 w-56">
          <p className="text-xs font-semibold text-gray-500 px-2 pb-2">
            🔧 Dev: Mock brandId
          </p>
          {MOCK_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              onClick={() => mockBrandId(opt.brandId)}
              className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-gray-100 text-gray-700"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="bg-gray-800 text-white text-xs px-3 py-2 rounded-full shadow-lg hover:bg-gray-700"
      >
        🔧 Dev Mock
      </button>
    </div>
  );
}