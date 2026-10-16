import { Link, useLocation } from 'react-router-dom';
import { Palette } from 'lucide-react';
import { SIDEBAR_NAV, NAV_ICON_MAP } from '../../utils/constants';
import { useAuth } from '../../hooks/useAuth';

// Varian ke-2 dari eksplorasi poin 2 (sebelumnya TopNav): dock ngambang di
// bawah ala macOS/iOS — icon doang, gak ada label teks, posisinya di tengah
// bawah layar. Sumber data sama persis (SIDEBAR_NAV di-flatten jadi leaf
// pages), Home ikut dimasukin (beda dari QuickAccessSection di Home yang
// sengaja nge-skip Home sendiri). Tiap child pakai icon spesifik dia sendiri
// (biar beda-beda sesuai fungsinya) — fallback ke icon parent cuma kalau
// child-nya kebetulan belum dikasih icon sendiri.
const DOCK_ITEMS = SIDEBAR_NAV.flatMap((item) =>
  item.children
    ? item.children.map((child) => ({ ...child, icon: child.icon || item.icon }))
    : [item]
);

export default function BottomDock() {
  const location = useLocation();
  const { user } = useAuth();

  const itemCls = (active) =>
    `flex items-center justify-center w-11 h-11 rounded-full transition-all relative ${
      active ? 'bg-violet-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 hover:scale-110'
    }`;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
      <nav className="flex items-center gap-1 px-2 py-2 bg-white/90 backdrop-blur-md border border-gray-200 rounded-full shadow-xl">
        {DOCK_ITEMS.map((item) => {
          const Icon = NAV_ICON_MAP[item.icon];
          const active = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} title={item.label} className={itemCls(active)}>
              <Icon className="w-5 h-5" />
            </Link>
          );
        })}

        {user?.brandId === 3 && (
          <Link
            to="/admin/theme"
            title="Theme Settings"
            className={itemCls(location.pathname === '/admin/theme')}
          >
            <Palette className="w-5 h-5" />
          </Link>
        )}
      </nav>
    </div>
  );
}
