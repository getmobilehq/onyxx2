/**
 * App Layout Component
 * Main authenticated app layout with sidebar and header
 */

import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import OfflineBanner from '../ui/OfflineBanner';
import { useUIStore } from '../../stores/ui.store';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

const AppLayout = () => {
  const { isSidebarOpen, isMobile, setMobile } = useUIStore();

  // Initialize network status listener
  useNetworkStatus();

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)');
    setMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setMobile(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [setMobile]);

  return (
    <div className="min-h-screen bg-slate-50">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-onyx-600 focus:text-white focus:rounded-md focus:shadow-lg"
      >
        Skip to main content
      </a>
      <Sidebar />

      <div
        className={`transition-all duration-300 ${
          isMobile ? 'ml-0' : isSidebarOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        <Header />
        <OfflineBanner />

        <main id="main-content" className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
