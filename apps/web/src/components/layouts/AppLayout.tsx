/**
 * App Layout Component
 * Main authenticated app layout with sidebar and header
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useUIStore } from '../../stores/ui.store';

const AppLayout = () => {
  const { isSidebarOpen } = useUIStore();

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <div
        className={`transition-all duration-300 ${
          isSidebarOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        <Header />

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
