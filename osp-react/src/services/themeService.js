import brandThemes from '../data/brandThemes.json';
import { getOverrideForBrand } from './themeOverrideService';

/**
 * Ambil data tema lengkap untuk sebuah brandId.
 * Cek override dari admin panel (localStorage) dulu, baru fallback ke brandThemes.json.
 */
export function getTheme(brandId) {
  const key = String(brandId ?? 'default');
  const baseTheme = brandThemes[key] ?? brandThemes['default'];
  const override = getOverrideForBrand(key);
  return override ? { ...baseTheme, ...override } : baseTheme;
}

/**
 * Apply theme berdasarkan brandId ke CSS Variables di :root
 * Dipanggil saat login berhasil, saat app load (kalau user sudah login),
 * atau saat admin save perubahan di Theme Admin Panel.
 */
export function applyTheme(brandId) {
  const theme = getTheme(brandId);
  const root = document.documentElement;

  root.style.setProperty('--sidebar-bg',            theme.sidebarBg);
  root.style.setProperty('--sidebar-border',        theme.sidebarBorder);
  root.style.setProperty('--user-card-bg',          theme.userCardBg);
  root.style.setProperty('--nav-active-bg',         theme.navActiveBg);
  root.style.setProperty('--nav-active-color',      theme.navActiveColor);
  root.style.setProperty('--nav-inactive-color',    theme.navInactiveColor);
  root.style.setProperty('--nav-hover-bg',          theme.navHoverBg);
  root.style.setProperty('--nav-hover-color',       theme.navHoverColor);
  root.style.setProperty('--nav-parent-active-color', theme.parentActiveColor);
  root.style.setProperty('--nav-parent-active-bg',  theme.parentActiveBg);
  root.style.setProperty('--nav-child-active-bg',   theme.childActiveBg);
  root.style.setProperty('--nav-child-active-color', theme.childActiveColor);
  root.style.setProperty('--nav-child-inactive-color', theme.childInactiveColor);
  root.style.setProperty('--sidebar-border-accent', theme.borderAccent);
  root.style.setProperty('--logo-bg',               theme.logoBg);
  root.style.setProperty('--logo-text',             `"${theme.logoText ?? ''}"`);
  root.style.setProperty('--font-family',           theme.fontFamily);
}

/**
 * Reset ke default theme (saat logout, atau saat brandId null/admin OSP tanpa gym)
 */
export function resetTheme() {
  applyTheme('default');
}