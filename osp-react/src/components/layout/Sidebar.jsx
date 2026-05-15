import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Store, Package, BarChart3, ChevronDown, User } from 'lucide-react';
import { SIDEBAR_NAV } from '../../utils/constants';
import { useAuth } from '../../contexts/AuthContext';

const ICON_MAP = { Home, Store, Package, BarChart3 };

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const { user } = useAuth();
  const [openMenus, setOpenMenus] = useState({});

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
        className={`fixed top-0 left-0 h-full w-64 bg-slate-800 z-50 transform transition-transform duration-300 ease-in-out flex flex-col flex-shrink-0 lg:translate-x-0 lg:static lg:z-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-700 flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-violet-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">O</span>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">OSP</span>
        </div>

        {/* User info */}
        <div className="mx-3 mt-4 mb-2 p-3 bg-slate-700/50 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-400 rounded-full flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="text-white text-sm font-semibold truncate">{user?.name || 'Guest'}</div>
            <div className="text-slate-400 text-xs uppercase tracking-wider">{user?.role || 'USER'}</div>
            {(user?.gymName || user?.gymList?.[0]?.name) && (
              <div className="text-slate-500 text-[10px] truncate mt-0.5">
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
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'bg-white/10 text-white'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
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
                  className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    menuOpen
                      ? 'text-white bg-white/5'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                    {item.label}
                  </span>
                  <ChevronDown className={`w-4 h-4 arrow-icon ${menuOpen ? 'arrow-open' : ''}`} />
                </button>

                <div className={`menu-sub ${menuOpen ? 'open' : ''}`}>
                  <div className="ml-[30px] pl-3 border-l border-slate-600 mt-1 space-y-0.5">
                    {item.children.map((child) => (
                      <Link
                        key={child.path}
                        to={child.path}
                        onClick={onClose}
                        className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                          isChildActive(child.path)
                            ? 'text-white bg-white/5 font-medium'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
