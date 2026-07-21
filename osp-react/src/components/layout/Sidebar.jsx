import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Store, Package, BarChart3, ChevronDown, User, FileText, Palette } from 'lucide-react';
import { SIDEBAR_NAV } from '../../utils/constants';
import { useAuth } from '../../contexts/AuthContext';
import { getTheme } from '../../services/themeService';

const ICON_MAP = { Home, Store, Package, BarChart3, FileText };

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const { user } = useAuth();
  const [openMenus, setOpenMenus] = useState({});
  const theme = getTheme(user?.brandId);

  // Auto-buka menu yg punya child aktif
  useEffect(() => {
    const newOpen = {};
    SIDEBAR_NAV.forEach((item) => {
      if (item.children) {
        const hasActive = item.children.some((c) => c.path === location.pathname);
        if (hasActive) newOpen[item.label] = true;
      }
    });
    setOpenMenus((prev) => ({ ...prev, ...newOpen }));
  }, [location.pathname]);

  const toggleMenu = (label) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isChildActive = (path) => location.pathname === path;


  return (
    <>
      {/* Overlay buat mobile */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden ${isOpen ? '' : 'hidden'}`}
        onClick={onClose}
      />

      <aside
        className={`fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300 ease-in-out flex flex-col flex-shrink-0 lg:translate-x-0 lg:static lg:z-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ backgroundColor: 'var(--sidebar-bg)', borderRight: '1px solid var(--sidebar-border)' }}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-5 flex-shrink-0"
          style={theme.invertLogo === false ? undefined : { filter: 'brightness(0) invert(1)' }}
        >
        <img
        src={theme.logoUrl}
        alt={theme.brandName}
        className="h-25 w-auto object-contain max-w-[160px]"
        style={theme.invertLogo === false ? undefined : { filter: 'brightness(0) invert(1)' }}
      />
</div>

        {/* User info */}
        <div
          className="mx-3 mt-4 mb-2 p-3 rounded-xl flex items-center gap-3"
          style={{ backgroundColor: 'var(--user-card-bg)' }}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-400 rounded-full flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="text-white text-sm font-semibold truncate">{user?.name || 'Guest'}</div>
            <div className="text-xs uppercase tracking-wider truncate" style={{ color: 'var(--nav-inactive-color)' }}>
              {user?.role || 'USER'}
            </div>
            {(user?.gymName || user?.gymList?.[0]?.name) && (
              <div className="text-[10px] truncate mt-0.5" style={{ color: 'var(--nav-inactive-color)', opacity: 0.7 }}>
                {user.gymName || user.gymList[0].name}
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1 sidebar-scrollbar">
          {SIDEBAR_NAV.map((item) => {
            const Icon = ICON_MAP[item.icon];

            // Simple link tanpa children
            if (!item.children) {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors sidebar-nav-item"
                  style={{
                    backgroundColor: active ? 'var(--nav-active-bg)' : 'transparent',
                    color: active ? 'var(--nav-active-color)' : 'var(--nav-inactive-color)',
                  }}
                >
                  <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                  {item.label}
                </Link>
              );
            }

            // Menu dengan children (collapsible)
            const menuOpen = openMenus[item.label];
            return (
              <div key={item.label}>
                <button
                  onClick={() => toggleMenu(item.label)}
                  className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors sidebar-nav-item"
                  style={{
                    backgroundColor: menuOpen ? 'var(--nav-parent-active-bg)' : 'transparent',
                    color: menuOpen ? 'var(--nav-parent-active-color)' : 'var(--nav-inactive-color)',
                  }}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                    {item.label}
                  </span>
                  <ChevronDown className={`w-4 h-4 arrow-icon ${menuOpen ? 'arrow-open' : ''}`} />
                </button>

                <div className={`menu-sub ${menuOpen ? 'open' : ''}`}>
                  <div
                    className="ml-[30px] pl-3 mt-1 space-y-0.5"
                    style={{ borderLeft: '1px solid var(--sidebar-border-accent)' }}
                  >
                    {item.children.map((child) => {
                      const childActive = isChildActive(child.path);
                      return (
                        <Link
                          key={child.path}
                          to={child.path}
                          onClick={onClose}
                          className="block px-3 py-2 rounded-md text-sm transition-colors sidebar-nav-item"
                          style={{
                            backgroundColor: childActive ? 'var(--nav-child-active-bg)' : 'transparent',
                            color: childActive ? 'var(--nav-child-active-color)' : 'var(--nav-child-inactive-color)',
                            fontWeight: childActive ? 500 : 400,
                          }}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Menu khusus OSP admin (brandId 3) — kontrol tema per brand */}
          {user?.brandId === 3 && (
            <Link
              to="/admin/theme"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors sidebar-nav-item"
              style={{
                backgroundColor: location.pathname === '/admin/theme' ? 'var(--nav-active-bg)' : 'transparent',
                color: location.pathname === '/admin/theme' ? 'var(--nav-active-color)' : 'var(--nav-inactive-color)',
              }}
            >
              <Palette className="w-[18px] h-[18px] flex-shrink-0" />
              Theme Settings
            </Link>
          )}
        </nav>
      </aside>
    </>
  );
}