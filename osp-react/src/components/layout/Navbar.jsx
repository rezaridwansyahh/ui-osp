import { Link, useLocation } from 'react-router-dom';
import { Menu, Power, Maximize, UserCircle, KeyRound, ChevronRight } from 'lucide-react';
import { BREADCRUMBS } from '../../utils/constants';

export default function Navbar({ onToggleSidebar }) {
  const location = useLocation();
  const crumbs = BREADCRUMBS[location.pathname] || [{ label: 'Home' }];

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 flex-shrink-0 shadow-sm">
      {/* Kiri: toggle sidebar + breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>

        <div className="flex items-center text-sm gap-1.5">
          {crumbs.map((crumb, idx) => {
            const isLast = idx === crumbs.length - 1;
            return (
              <span key={idx} className="contents">
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-gray-300" />}
                {crumb.path && !isLast ? (
                  <Link
                    to={crumb.path}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : isLast ? (
                  <span className="text-gray-900 font-semibold">{crumb.label}</span>
                ) : (
                  <span className="text-gray-400">{crumb.label}</span>
                )}
              </span>
            );
          })}
        </div>
      </div>

      {/* Kanan: action buttons */}
      <div className="flex items-center gap-1">
        <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors group" title="Power">
          <Power className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
        </button>
        <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors group" title="Fullscreen">
          <Maximize className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
        </button>
        <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors group" title="Profile">
          <UserCircle className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
        </button>
        <button className="p-2 rounded-lg hover:bg-red-50 transition-colors group" title="Auth">
          <KeyRound className="w-5 h-5 text-red-400 group-hover:text-red-600" />
        </button>
      </div>
    </header>
  );
}
