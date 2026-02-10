/**
 * Sidebar Component
 * Main navigation sidebar with role-based menu items
 * Desktop: collapsible fixed sidebar (w-64 / w-20)
 * Mobile: overlay drawer with backdrop
 */

import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useUIStore } from '../../stores/ui.store';
import { OnyxMark } from '../brand/OnyxIcons';
import {
  LayoutDashboard,
  Building2,
  ClipboardCheck,
  AlertTriangle,
  BarChart3,
  Settings,
  Users,
  ChevronLeft,
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  const { isSidebarOpen, toggleSidebar, isMobile, isMobileMenuOpen, setMobileMenuOpen } = useUIStore();

  const menuItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      roles: ['org_admin', 'branch_manager', 'assessor', 'viewer'],
    },
    {
      label: 'Buildings',
      icon: Building2,
      path: '/buildings',
      roles: ['org_admin', 'branch_manager', 'assessor', 'viewer'],
    },
    {
      label: 'Assessments',
      icon: ClipboardCheck,
      path: '/assessments',
      roles: ['org_admin', 'branch_manager', 'assessor', 'viewer'],
    },
    {
      label: 'Deficiencies',
      icon: AlertTriangle,
      path: '/deficiencies',
      roles: ['org_admin', 'branch_manager', 'assessor', 'viewer'],
    },
    {
      label: 'Reports',
      icon: BarChart3,
      path: '/reports',
      roles: ['org_admin', 'branch_manager', 'viewer'],
    },
    {
      label: 'Users',
      icon: Users,
      path: '/users',
      roles: ['org_admin', 'branch_manager'],
    },
    {
      label: 'Settings',
      icon: Settings,
      path: '/settings',
      roles: ['org_admin', 'branch_manager', 'assessor', 'viewer'],
    },
  ];

  const visibleMenuItems = menuItems.filter((item) =>
    item.roles.includes(user?.role || 'viewer')
  );

  // On mobile: full-width drawer that slides in/out
  // On desktop: collapsible sidebar (w-64 / w-20)
  const sidebarClasses = isMobile
    ? `fixed left-0 top-0 z-modal h-screen bg-white border-r border-slate-200 w-64 transition-transform duration-300 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`
    : `fixed left-0 top-0 z-sticky h-screen bg-white border-r border-slate-200 transition-all duration-300 ${
        isSidebarOpen ? 'w-64' : 'w-20'
      }`;

  const showLabels = isMobile || isSidebarOpen;

  return (
    <>
      {/* Backdrop overlay for mobile */}
      {isMobile && isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-fixed bg-black/50 transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside className={sidebarClasses}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200">
          {showLabels ? (
            <div className="flex items-center gap-3">
              <OnyxMark size={40} variant="color" />
              <span className="font-display font-bold text-lg text-slate-900">
                Onyx Report
              </span>
            </div>
          ) : (
            <OnyxMark size={40} variant="color" className="mx-auto" />
          )}
          {!isMobile && (
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md hover:bg-slate-100 transition-colors"
              aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <ChevronLeft
                className={`w-5 h-5 text-slate-600 transition-transform ${
                  !isSidebarOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => isMobile && setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                    isActive
                      ? 'bg-onyx-50 text-onyx-700 font-medium'
                      : 'text-slate-700 hover:bg-slate-50'
                  } ${!showLabels ? 'justify-center' : ''}`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {showLabels && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* User Info (bottom) */}
        {showLabels && user && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-onyx-100 flex items-center justify-center text-onyx-700 font-semibold">
                {user.firstName?.[0]}
                {user.lastName?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-slate-500 truncate capitalize">
                  {user.role.replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
