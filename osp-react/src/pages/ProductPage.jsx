import { useState, useMemo, useEffect, useCallback } from 'react';
import { Plus, Search, Trash2, RefreshCw } from 'lucide-react';
import { PRODUCT_CATEGORIES, CATEGORY_ICONS } from '../data/products';
import { fetchAllItems } from '../services/itemService';
import { useShowToast } from '../contexts/ToastContext';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import SearchInput from '../components/ui/SearchInput';

// Halaman daftar produk: grid + toolbar, CRUD pakai modal
// List sudah connect ke GET /items (backend). Add/Edit/Delete MASIH LOKAL SAJA —
// dokumentasi API belum punya endpoint POST/PUT/DELETE untuk items, jadi
// perubahan lewat form ini belum ke-persist ke backend (hilang lagi kalau refresh).

// Map response backend {id, productName, shortName, price, active} → shape yang dipakai UI
// CATATAN: field asli beda dari dokumentasi (yang bilang itemId/name/category/stock) —
// API ini ternyata gak punya konsep category/stock sama sekali.
function mapApiItem(item) {
  return {
    id: item.id != null ? String(item.id) : item.itemId,
    name: item.productName || item.name || '(Tanpa nama)',
    cat: item.shortName || '-', // dipakai sebagai badge kode produk, bukan kategori beneran
    price: item.price ?? 0,
    active: item.active !== false,
    icon: '📦',
  };
}

// Generate ID baru (P1, P2, …) dari angka tertinggi yang sekarang ada — dipakai buat produk yang ditambah lokal
function nextProductId(list) {
  const nums = list.map((p) => {
    const m = /^P(\d+)$/i.exec(p.id);
    return m ? Number(m[1]) : 0;
  });
  const max = nums.length ? Math.max(...nums) : 0;
  return `P${max + 1}`;
}

// Form modal kosong (bisa dipakai tambah atau reset habis edit)
const emptyForm = () => ({
  name: '',
  cat: PRODUCT_CATEGORIES[0],
  price: '',
});

export default function ProductPage() {
  const showToast = useShowToast();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  // null = mode tambah, string = id produk yang lagi diedit
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  // Nge-track apakah ada perubahan lokal (add/edit/delete) yang belum "tersimpan"
  // ke backend — dipakai buat banner peringatan & konfirmasi sebelum refresh.
  const [hasLocalChanges, setHasLocalChanges] = useState(false);

  const loadItems = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchAllItems();
      // Response backend sering ada duplikat id persis sama — dedupe biar gak dobel di grid & gak bikin React key warning
      const seen = new Map();
      data.forEach((item) => {
        if (!seen.has(item.id)) seen.set(item.id, item);
      });
      setProducts(Array.from(seen.values()).map(mapApiItem));
      setHasLocalChanges(false);
    } catch (err) {
      console.error('Gagal fetch items:', err);
      setLoadError('Gagal memuat produk dari server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleRefreshClick = () => {
    if (hasLocalChanges) {
      const ok = window.confirm(
        'Ada perubahan lokal (tambah/edit/hapus) yang belum tersimpan ke server. Refresh akan menghapus perubahan itu. Lanjutkan?'
      );
      if (!ok) return;
    }
    loadItems();
  };

  // Filter: nama atau kategori (case-insensitive)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q)
    );
  }, [products, query]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm());
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      cat: p.cat,
      price: String(p.price),
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = form.name.trim();
    const priceNum = Number(form.price);
    if (!name || Number.isNaN(priceNum) || priceNum < 0) {
      return;
    }

    if (editingId) {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== editingId) return p;
          const catChanged = p.cat !== form.cat;
          return {
            ...p,
            name,
            cat: form.cat,
            price: priceNum,
            icon: catChanged ? CATEGORY_ICONS[form.cat] : p.icon,
          };
        })
      );
      setHasLocalChanges(true);
      showToast('Produk berhasil diupdate (lokal saja, belum tersimpan ke server)', 'success');
    } else {
      const id = nextProductId(products);
      setProducts((prev) => [
        ...prev,
        {
          id,
          name,
          cat: form.cat,
          price: priceNum,
          icon: CATEGORY_ICONS[form.cat],
        },
      ]);
      setHasLocalChanges(true);
      showToast('Produk berhasil ditambahkan (lokal saja, belum tersimpan ke server)', 'success');
    }
    closeModal();
  };

  const handleDelete = (id) => {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    // Konfirmasi native browser
    if (!window.confirm(`Hapus produk "${p.name}"?`)) return;
    setProducts((prev) => prev.filter((x) => x.id !== id));
    setHasLocalChanges(true);
    showToast('Produk berhasil dihapus', 'success');
  };

  return (
    <div className="p-4 lg:p-6">
      {/* Toolbar: aksi tambah (violet = variant primary) + cari + refresh */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button type="button" icon={Plus} onClick={openAdd}>
            Add New Product
          </Button>
          <Button
            type="button"
            variant="outline"
            icon={RefreshCw}
            onClick={handleRefreshClick}
            disabled={loading}
            aria-label="Refresh produk"
          />
        </div>
        <div className="w-full sm:max-w-xs">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Cari nama atau kategori..."
          />
        </div>
      </div>

      {hasLocalChanges && (
        <div className="mb-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          Ada perubahan lokal yang belum tersimpan ke server (belum ada endpoint tambah/edit/hapus produk di backend). Perubahan ini akan hilang kalau kamu refresh halaman atau klik tombol Refresh.
        </div>
      )}

      {loadError && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {loadError}
        </div>
      )}

      {loading ? (
        <div className="text-center text-sm text-gray-500 py-12">Memuat produk...</div>
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {filtered.map((p) => {
          const icon = p.icon;
          const category = p.cat;
          const id = p.id;
          const name = p.name;
          // Format harga pakai locale browser
          const price = p.price.toLocaleString();
          return (
            <div
              key={p.id}
              className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="aspect-video bg-slate-50 flex items-center justify-center text-5xl group-hover:scale-110 transition-transform duration-500">
                {icon}
              </div>
              <div className="p-5">
                <div className="flex justify-between items-center mb-2">
                  <span className="px-2.5 py-1 text-[10px] font-bold text-violet-600 bg-violet-50 rounded-lg uppercase tracking-widest">
                    {category}
                  </span>
                  <span className="text-[10px] font-mono text-gray-400">{id}</span>
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1 group-hover:text-violet-600 transition-colors">
                  {name}
                </h3>
                <div className="flex items-center gap-2 mt-3">
                  <p className="text-lg font-bold text-slate-800 font-mono">IDR {price}</p>
                  {!p.active && (
                    <span className="px-2 py-0.5 text-[10px] font-bold text-red-600 bg-red-50 rounded uppercase tracking-widest">
                      Inactive
                    </span>
                  )}
                </div>
              </div>
              <div className="px-5 py-4 bg-gray-50/50 border-t border-gray-100 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1 justify-center"
                  onClick={() => openEdit(p)}
                >
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  icon={Trash2}
                  className="flex-1 justify-center"
                  onClick={() => handleDelete(p.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Kosong: bedain filter vs data beneran habis */}
      {!loading && filtered.length === 0 && (
        <div className="text-center text-sm text-gray-500 py-12">
          <Search className="w-10 h-10 text-gray-200 mx-auto mb-3" aria-hidden />
          <p>{query.trim() ? 'Tidak ada produk yang cocok.' : 'Belum ada produk.'}</p>
        </div>
      )}

      {/* Satu modal buat tambah & edit — judul beda */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingId ? 'Edit Product' : 'Add New Product'}
        footer={
          <>
            <Button type="button" variant="secondary" className="flex-1" onClick={closeModal}>
              Batal
            </Button>
            <Button type="submit" form="product-form" className="flex-1">
              Simpan
            </Button>
          </>
        }
      >
        <form id="product-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="product-name" className="block text-xs font-semibold text-gray-600 mb-1.5">
              Product Name
            </label>
            <input
              id="product-name"
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
              required
            />
          </div>
          <div>
            <label htmlFor="product-cat" className="block text-xs font-semibold text-gray-600 mb-1.5">
              Category
            </label>
            <select
              id="product-cat"
              value={form.cat}
              onChange={(e) => setForm((f) => ({ ...f, cat: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
            >
              {PRODUCT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="product-price" className="block text-xs font-semibold text-gray-600 mb-1.5">
              Price
            </label>
            <input
              id="product-price"
              type="number"
              min="0"
              step="1"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}