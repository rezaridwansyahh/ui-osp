import { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Toast from '../ui/Toast';
import { useToast } from '../../hooks/useToast';
import { ToastContext } from '../../contexts/ToastContext';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast, showToast } = useToast();

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      <div className="flex h-screen font-sans bg-gray-50 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Navbar onToggleSidebar={toggleSidebar} />

          <main className="flex-1 overflow-y-auto bg-gray-50">
            <Outlet />
          </main>
        </div>

        {toast && <Toast message={toast.message} type={toast.type} />}
      </div>
    </ToastContext.Provider>
  );
}
