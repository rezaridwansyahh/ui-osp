import { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import BottomDock from './BottomDock';
import Navbar from './Navbar';
import Toast from '../ui/Toast';
import DevMockPanel from '../ui/DevMockPanel';
import { useToast } from '../../hooks/useToast';
import { ToastContext } from '../../contexts/ToastContext';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // Eksplorasi poin 2 dari mentor: 'sidebar' (default, behavior lama) vs
  // 'topnav' (bar horizontal di bawah Navbar) vs 'bottomnav' (dock ngambang
  // ala macOS/iOS) — toggle 3-way-nya ada di Navbar, biar bisa dibandingin
  // langsung tanpa reload/ganti branch.
  const [layoutMode, setLayoutMode] = useState('sidebar');
  const { toast, showToast } = useToast();

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const toggleSidebarCollapsed = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      <div className="flex h-screen font-sans bg-gray-50 overflow-hidden">
        {layoutMode === 'sidebar' && (
          <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} collapsed={sidebarCollapsed} />
        )}

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Navbar
            onToggleSidebar={toggleSidebar}
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebarCollapsed={toggleSidebarCollapsed}
            layoutMode={layoutMode}
            onChangeLayoutMode={setLayoutMode}
          />
          {layoutMode === 'topnav' && <TopNav />}

          <main
            className={`flex-1 overflow-y-auto bg-gray-50 ${layoutMode === 'bottomnav' ? 'pb-24' : ''}`}
          >
            <Outlet />
          </main>

          {layoutMode === 'bottomnav' && <BottomDock />}
        </div>

        {toast && <Toast message={toast.message} type={toast.type} />}
        <DevMockPanel />
      </div>
    </ToastContext.Provider>
  );
}