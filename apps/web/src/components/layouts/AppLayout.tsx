/**
 * App Layout Component
 * Main authenticated app layout with sidebar and header
 */

import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useUIStore } from '../../stores/ui.store';

const AppLayout = () => {
  const { isSidebarOpen, isMobile, setMobile } = useUIStore();

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)');
    setMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setMobile(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [setMobile]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <div
        className={`transition-all duration-300 ${
          isMobile ? 'ml-0' : isSidebarOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        <Header />

        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
