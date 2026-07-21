const STORAGE_KEY = 'osp_theme_overrides';

export function getOverrides() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.error('Gagal baca theme overrides:', err);
    return {};
  }
}

export function getOverrideForBrand(brandId) {
  const overrides = getOverrides();
  return overrides[String(brandId)] ?? null;
}

export function saveOverrideForBrand(brandId, themeData) {
  const overrides = getOverrides();
  overrides[String(brandId)] = themeData;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
}

export function resetOverrideForBrand(brandId) {
  const overrides = getOverrides();
  delete overrides[String(brandId)];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
}

export function resetAllOverrides() {
  localStorage.removeItem(STORAGE_KEY);
}