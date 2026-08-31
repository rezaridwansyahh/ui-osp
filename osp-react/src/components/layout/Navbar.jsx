import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Power, Maximize, User, KeyRound, ChevronRight, MapPin } from 'lucide-react';
import { BREADCRUMBS } from '../../utils/constants';
import { useAuth } from '../../hooks/useAuth';
import EditProfileModal from './EditProfileModal';
import ResetPasswordModal from './ResetPasswordModal';

export default function Navbar({ onToggleSidebar, sidebarCollapsed, onToggleSidebarCollapsed }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const crumbs = BREADCRUMBS[location.pathname] || [{ label: 'Home' }];

  const gymName = user?.gymName || user?.gymList?.[0]?.name;

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 shrink-0 shadow-sm">
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

      {/* Kanan: user info + action buttons */}
      <div className="flex items-center gap-3">
        {/* Gym & user badge — hidden di mobile biar gak sempit */}
        {gymName && (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 rounded-lg">
            <MapPin className="w-3.5 h-3.5 text-violet-500" />
            <span className="text-xs font-semibold text-violet-700">{gymName}</span>
          </div>
        )}

        <div className="hidden sm:block text-right mr-1">
          <p className="text-xs font-semibold text-gray-800 leading-tight">{user?.name || 'Guest'}</p>
          <p className="text-[10px] text-gray-400">{user?.role || 'User'}</p>
        </div>

        <div className="h-6 w-px bg-gray-200 hidden sm:block" />

        <div className="flex items-center gap-1">
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-red-50 transition-colors group"
            title="Logout"
          >
            <Power className="w-5 h-5 text-red-400 group-hover:text-red-600" />
          </button>
          <button
            onClick={onToggleSidebarCollapsed}
            aria-pressed={sidebarCollapsed}
            className={`p-2 rounded-lg border transition-colors group ${
              sidebarCollapsed
                ? 'border-violet-300 bg-violet-50'
                : 'border-transparent hover:bg-gray-100'
            }`}
            title={sidebarCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
          >
            <Maximize
              className={`w-5 h-5 ${
                sidebarCollapsed ? 'text-violet-600' : 'text-gray-400 group-hover:text-gray-600'
              }`}
            />
          </button>
          <button
            onClick={() => setShowEditProfile(true)}
            className="p-2 rounded-lg hover:bg-violet-50 transition-colors group"
            title="Edit Profile"
          >
            <User className="w-5 h-5 text-gray-400 group-hover:text-violet-600" />
          </button>
          <button
            onClick={() => setShowResetPassword(true)}
            className="p-2 rounded-lg hover:bg-violet-50 transition-colors group"
            title="Reset Password"
          >
            <KeyRound className="w-5 h-5 text-gray-400 group-hover:text-violet-600" />
          </button>
        </div>
      </div>

      <EditProfileModal
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        user={user}
      />
      <ResetPasswordModal
        isOpen={showResetPassword}
        onClose={() => setShowResetPassword(false)}
        user={user}
      />
    </header>
  );
}
