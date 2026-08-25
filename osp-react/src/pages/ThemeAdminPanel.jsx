import { useState, useEffect } from 'react';
import brandThemes from '../data/brandThemes.json';
import {
  getOverrideForBrand,
  saveOverrideForBrand,
  resetOverrideForBrand,
} from '../services/themeOverrideService';
import { applyTheme } from '../services/themeService';
import {
  getCustomBrands,
  addCustomBrand,
  removeCustomBrand,
} from '../services/customBrandService';

const BASE_BRAND_OPTIONS = [
  { id: 1, name: 'Anytime Fitness' },
  { id: 2, name: 'Bee Active' },
  { id: 3, name: 'OSP' },
];

const FIELD_GROUPS = [
  {
    label: 'Sidebar',
    fields: [
      ['sidebarBg', 'Sidebar Background', 'color'],
      ['sidebarBorder', 'Sidebar Border', 'color'],
      ['borderAccent', 'Border Accent', 'color'],
      ['userCardBg', 'User Card Background', 'color'],
    ],
  },
  {
    label: 'Navigation',
    fields: [
      ['navActiveBg', 'Nav Active Background', 'color'],
      ['navActiveColor', 'Nav Active Text', 'color'],
      ['navInactiveColor', 'Nav Inactive Text', 'color'],
      ['navHoverBg', 'Nav Hover Background', 'color'],
      ['navHoverColor', 'Nav Hover Text', 'color'],
      ['parentActiveColor', 'Parent Active Text', 'color'],
      ['parentActiveBg', 'Parent Active Background', 'color'],
      ['childActiveBg', 'Child Active Background', 'color'],
      ['childActiveColor', 'Child Active Text', 'color'],
      ['childInactiveColor', 'Child Inactive Text', 'color'],
    ],
  },
  {
    label: 'Logo & Font',
    fields: [
      ['brandName', 'Brand Name (alt text logo)', 'text'],
      ['logoBg', 'Logo Background', 'color'],
      ['logoText', 'Logo Text (fallback)', 'text'],
      ['fontFamily', 'Font Family', 'text'],
    ],
  },
];

// Resize gambar pakai canvas sebelum di-convert ke base64,
// biar logo resolusi tinggi otomatis dikecilin (max 300px lebar/tinggi)
// dan gak makan localStorage terlalu banyak.
const MAX_LOGO_DIMENSION = 300;

// Dipakai bareng oleh Upload File & Paste URL: terima HTMLImageElement
// yang sudah loaded, kembalikan base64 PNG hasil resize.
const imageElementToResizedBase64 = (img) => {
  let { width, height } = img;

  if (width > MAX_LOGO_DIMENSION || height > MAX_LOGO_DIMENSION) {
    const ratio = Math.min(MAX_LOGO_DIMENSION / width, MAX_LOGO_DIMENSION / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, width, height);

  // Titik gagal paling umum untuk gambar dari URL luar: kalau server sumber
  // gak ngasih header CORS, canvas dianggap "tainted" dan toDataURL bakal
  // throw SecurityError. Upload File gak kena ini karena filenya lokal.
  return canvas.toDataURL('image/png');
};

export default function ThemeAdminPanel() {
  const [selectedBrand, setSelectedBrand] = useState(1);
  const [formData, setFormData] = useState({});
  const [logoMode, setLogoMode] = useState('url'); // 'url' | 'upload'
  const [saved, setSaved] = useState(false);

  // state khusus mode "Paste URL"
  const [logoUrlInput, setLogoUrlInput] = useState('');
  const [urlError, setUrlError] = useState('');
  const [urlLoading, setUrlLoading] = useState(false);

  // state buat fitur "Brand Baru"
  const [customBrands, setCustomBrands] = useState(getCustomBrands());
  const [showAddBrand, setShowAddBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');

  const brandOptions = [...BASE_BRAND_OPTIONS, ...customBrands];

  // load data (override kalau ada, fallback ke base theme) tiap ganti brand
  useEffect(() => {
    const key = String(selectedBrand);
    const base = brandThemes[key] ?? brandThemes['default'];
    const override = getOverrideForBrand(key);
    setFormData({ ...base, ...override });
    setSaved(false);
    setUrlError('');
    setLogoUrlInput('');
  }, [selectedBrand]);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const resizeImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          try {
            resolve(imageElementToResizedBase64(img));
          } catch (err) {
            reject(err);
          }
        };
        img.onerror = () => reject(new Error('Gagal load gambar'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Gagal baca file'));
      reader.readAsDataURL(file);
    });
  };

  const handleLogoFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // batas ukuran file asli sebelum resize, biar canvas gak berat proses gambar raksasa
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file terlalu besar. Maksimal 5MB.');
      return;
    }

    try {
      const resizedDataUrl = await resizeImage(file);
      handleFieldChange('logoUrl', resizedDataUrl);
    } catch (err) {
      console.error('Gagal resize logo:', err);
      alert('Gagal memproses gambar. Coba file lain.');
    }
  };

  // Ambil gambar dari URL luar, convert jadi base64 (sama seperti Upload File),
  // supaya logo gak gantung ke link eksternal yang bisa expired/rusak/di-hotlink-block.
  const handleLoadFromUrl = async () => {
    const url = logoUrlInput.trim();
    if (!url) return;

    setUrlError('');
    setUrlLoading(true);

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous'; // wajib biar canvas gak "tainted" KALAU server support CORS

      const loaded = await new Promise((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = () =>
          reject(
            new Error(
              'URL ini gak bisa dimuat sebagai gambar. Kemungkinan bukan direct image link ' +
                '(misal link halaman Google Images, bukan file gambarnya langsung), atau link-nya rusak/expired.'
            )
          );
        img.src = url;
      });

      const dataUrl = imageElementToResizedBase64(loaded);
      handleFieldChange('logoUrl', dataUrl);
      setLogoUrlInput('');
    } catch (err) {
      if (err.name === 'SecurityError') {
        setUrlError(
          'Gambar berhasil dimuat tapi server sumbernya menolak akses cross-origin (CORS). ' +
            'Ini biasa terjadi untuk gambar dari Google Images / situs stok foto. ' +
            'Solusi: klik kanan gambar aslinya → Save Image As → lalu pakai tombol "Upload File" di sini.'
        );
      } else {
        setUrlError(err.message);
      }
    } finally {
      setUrlLoading(false);
    }
  };

  const handleSave = () => {
    saveOverrideForBrand(selectedBrand, formData);
    applyTheme(selectedBrand); // langsung apply biar keliatan efeknya
    setSaved(true);
  };

  const handleResetBrand = () => {
    if (!confirm(`Reset tema ${brandOptions.find((b) => b.id === selectedBrand)?.name} ke default?`)) return;
    resetOverrideForBrand(selectedBrand);
    const key = String(selectedBrand);
    setFormData(brandThemes[key] ?? brandThemes['default']);
    applyTheme(selectedBrand);
    setSaved(false);
  };

  // ── Fitur Brand Baru ──────────────────────────────────────────
  const handleAddBrand = () => {
    if (!newBrandName.trim()) return;
    const baseIds = BASE_BRAND_OPTIONS.map((b) => b.id);
    const newBrand = addCustomBrand(newBrandName, baseIds);

    // kasih starting point: default theme + nama brand baru,
    // biar pas dipilih formData-nya langsung terisi bukan kosong
    saveOverrideForBrand(newBrand.id, {
      ...brandThemes['default'],
      brandName: newBrandName.trim(),
    });

    setCustomBrands(getCustomBrands());
    setNewBrandName('');
    setShowAddBrand(false);
    setSelectedBrand(newBrand.id);
  };

  const handleDeleteCustomBrand = (id) => {
    if (!confirm('Hapus brand ini? Snippet yang belum di-export ke brandThemes.json akan hilang.')) return;
    removeCustomBrand(id);
    resetOverrideForBrand(id);
    setCustomBrands(getCustomBrands());
    if (selectedBrand === id) setSelectedBrand(BASE_BRAND_OPTIONS[0].id);
  };

  const handleExportJSON = () => {
    const snippet = JSON.stringify({ [selectedBrand]: formData }, null, 2);
    navigator.clipboard
      .writeText(snippet)
      .then(() => alert('Snippet disalin. Paste ke brandThemes.json lalu commit.'))
      .catch(() => prompt('Copy snippet ini ke brandThemes.json:', snippet));
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-xl font-bold mb-4 text-gray-900">Theme Admin Panel</h1>

      {/* Brand selector */}
      <div className="flex gap-2 mb-6 flex-wrap items-center">
        {brandOptions.map((brand) => (
          <div key={brand.id} className="relative group">
            <button
              onClick={() => setSelectedBrand(brand.id)}
              className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                selectedBrand === brand.id
                  ? 'border-2 border-blue-600 bg-blue-50 font-semibold text-blue-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {brand.name}
            </button>
            {customBrands.some((b) => b.id === brand.id) && (
              <button
                onClick={() => handleDeleteCustomBrand(brand.id)}
                className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] hidden group-hover:flex items-center justify-center"
                title="Hapus brand ini"
              >
                ×
              </button>
            )}
          </div>
        ))}

        {showAddBrand ? (
          <div className="flex gap-1.5 items-center">
            <input
              type="text"
              autoFocus
              placeholder="Nama brand baru"
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddBrand()}
              className="px-2 py-1.5 text-sm rounded-md border border-gray-300"
            />
            <button
              onClick={handleAddBrand}
              className="px-3 py-1.5 text-sm rounded-md bg-blue-600 text-white font-medium"
            >
              Tambah
            </button>
            <button
              onClick={() => { setShowAddBrand(false); setNewBrandName(''); }}
              className="px-2 py-1.5 text-sm text-gray-500"
            >
              Batal
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAddBrand(true)}
            className="px-3 py-2 rounded-lg border border-dashed border-gray-300 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600"
          >
            + Brand Baru
          </button>
        )}
      </div>

      {/* Logo section */}
      <div className="mb-6 p-4 border border-gray-200 rounded-lg">
        <h2 className="text-sm font-semibold mb-3 text-gray-800">Logo</h2>

        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setLogoMode('url')}
            className={`px-3 py-1 text-xs rounded-md border transition-colors ${
              logoMode === 'url'
                ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium'
                : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Paste URL
          </button>
          <button
            onClick={() => setLogoMode('upload')}
            className={`px-3 py-1 text-xs rounded-md border transition-colors ${
              logoMode === 'upload'
                ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium'
                : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Upload File
          </button>
        </div>

        {logoMode === 'url' ? (
          <div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="https://example.com/logo.png"
                value={logoUrlInput}
                onChange={(e) => setLogoUrlInput(e.target.value)}
                className="flex-1 px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleLoadFromUrl}
                disabled={urlLoading || !logoUrlInput.trim()}
                className="px-3 py-2 rounded-md bg-blue-600 text-white text-sm font-medium disabled:opacity-50"
              >
                {urlLoading ? 'Loading...' : 'Load'}
              </button>
            </div>
            {urlError && <p className="text-xs text-red-600 mt-2">{urlError}</p>}
          </div>
        ) : (
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoFileUpload}
              className="text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 file:text-sm file:font-medium hover:file:bg-blue-100"
            />
            <p className="text-xs text-gray-400 mt-1">
              Gambar otomatis di-resize maks. {MAX_LOGO_DIMENSION}px sebelum disimpan.
            </p>
          </div>
        )}

        {formData.logoUrl && (
          <div className="mt-3">
            <p className="text-xs text-gray-500 mb-1">Preview (warna asli file):</p>
            <img
              src={formData.logoUrl}
              alt="Logo preview"
              className="max-h-12 max-w-40 object-contain"
            />

            <label className="flex items-center gap-2 mt-3 text-xs text-gray-700">
              <input
                type="checkbox"
                checked={formData.invertLogo !== false}
                onChange={(e) => handleFieldChange('invertLogo', e.target.checked)}
              />
              Invert logo jadi putih (matikan kalau logo sudah berwarna/putih)
            </label>

            {formData.invertLogo !== false ? (
              <p className="text-xs text-amber-600 mt-2">
                ⚠️ Filter invert AKTIF — di sidebar, logo ini akan tampil putih polos
                (semua warna asli dihilangkan). Cocok untuk logo gelap/hitam.
              </p>
            ) : (
              <div className="mt-2 p-2 rounded-md bg-gray-800">
                <p className="text-xs text-gray-300 mb-1">Preview di sidebar (invert nonaktif):</p>
                <img
                  src={formData.logoUrl}
                  alt="Sidebar preview"
                  className="max-h-12 max-w-40 object-contain"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Field groups */}
      {FIELD_GROUPS.map((group) => (
        <div key={group.label} className="mb-5 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-sm font-semibold mb-3 text-gray-800">{group.label}</h2>
          <div className="grid grid-cols-2 gap-3">
            {group.fields.map(([field, label, type]) => (
              <div key={field}>
                <label className="block text-xs text-gray-500 mb-1">{label}</label>
                <div className="flex gap-1.5">
                  <input
                    type={type === 'color' ? 'color' : 'text'}
                    value={formData[field] ?? ''}
                    onChange={(e) => handleFieldChange(field, e.target.value)}
                    className={`h-8 rounded-md border border-gray-300 ${
                      type === 'color' ? 'w-10 p-0' : 'w-full px-2 text-sm'
                    }`}
                  />
                  {type === 'color' && (
                    <input
                      type="text"
                      value={formData[field] ?? ''}
                      onChange={(e) => handleFieldChange(field, e.target.value)}
                      className="flex-1 px-2 py-1 rounded-md border border-gray-300 text-xs"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors"
        >
          Save & Apply
        </button>
        <button
          onClick={handleResetBrand}
          className="px-5 py-2.5 rounded-lg bg-white text-red-600 font-semibold text-sm border border-red-600 hover:bg-red-50 transition-colors"
        >
          Reset ke Default
        </button>
        <button
          onClick={handleExportJSON}
          className="px-5 py-2.5 rounded-lg bg-white text-gray-700 font-semibold text-sm border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          Export JSON
        </button>
        {saved && <span className="text-green-600 text-sm">✓ Tersimpan</span>}
      </div>
    </div>
  );
}