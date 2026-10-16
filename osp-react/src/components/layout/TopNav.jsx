import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, Palette } from 'lucide-react';
import { SIDEBAR_NAV, NAV_ICON_MAP } from '../../utils/constants';
import { useAuth } from '../../hooks/useAuth';

// Eksplorasi poin 2 dari mentor: nav dipindah ke atas (bar horizontal di
// bawah Navbar), bukan sidebar kiri. Sumber data sama persis sama Sidebar
// (SIDEBAR_NAV) biar nav item-nya gak dobel-maintain — bedanya cuma
// accordion (Sidebar) vs dropdown (sini).
export default function TopNav() {
  const location = useLocation();
  const { user } = useAuth();
  const [openMenu, setOpenMenu] = useState(null);
  const containerRef = useRef(null);

  // Tutup dropdown kalau klik di luar nav
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Tutup dropdown tiap pindah halaman — diadaptasi saat render (pola resmi
  // React buat "adjusting state when a prop changes"), bukan di useEffect.
  const [prevPath, setPrevPath] = useState(location.pathname);
  if (prevPath !== location.pathname) {
    setPrevPath(location.pathname);
    setOpenMenu(null);
  }

  const isChildActive = (path) => location.pathname === path;
  const isParentActive = (item) => item.children?.some((c) => c.path === location.pathname);

  const itemCls = (active) =>
    `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
      active ? 'bg-violet-50 text-violet-600' : 'text-gray-600 hover:bg-gray-100'
    }`;

  return (
    <nav
      ref={containerRef}
      className="min-h-12 bg-white border-b border-gray-200 flex items-center gap-1 px-4 lg:px-6 py-2 flex-wrap shrink-0"
    >
      {SIDEBAR_NAV.map((item) => {
        const Icon = NAV_ICON_MAP[item.icon];

        if (!item.children) {
          const active = location.pathname === item.path;
          return (
            <Link key={item.label} to={item.path} className={itemCls(active)}>
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        }

        const open = openMenu === item.label;
        const active = isParentActive(item);
        return (
          <div key={item.label} className="relative">
            <button
              type="button"
              onClick={() => setOpenMenu(open ? null : item.label)}
              className={itemCls(active || open)}
            >
              <Icon className="w-4 h-4" />
              {item.label}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
              <div className="absolute left-0 top-full mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50">
                {item.children.map((child) => (
                  <Link
                    key={child.path}
                    to={child.path}
                    onClick={() => setOpenMenu(null)}
                    className={`block px-3 py-2 text-sm transition-colors ${
                      isChildActive(child.path)
                        ? 'bg-violet-50 text-violet-600 font-semibold'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {user?.brandId === 3 && (
        <Link
          to="/admin/theme"
          className={itemCls(location.pathname === '/admin/theme')}
        >
          <Palette className="w-4 h-4" />
          Theme Settings
        </Link>
      )}
    </nav>
  );
}
