const STORAGE_KEY = 'osp_custom_brands';

export function getCustomBrands() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Gagal baca custom brands:', err);
    return [];
  }
}

export function addCustomBrand(name, existingIds) {
  const customBrands = getCustomBrands();
  const allIds = [...existingIds, ...customBrands.map((b) => b.id)];
  const nextId = allIds.length ? Math.max(...allIds) + 1 : 1;

  const newBrand = { id: nextId, name: name.trim() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...customBrands, newBrand]));
  return newBrand;
}

export function removeCustomBrand(id) {
  const updated = getCustomBrands().filter((b) => b.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}