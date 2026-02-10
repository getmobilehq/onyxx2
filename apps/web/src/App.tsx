/**
 * App Component
 * Root application component with routing
 */

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { Toaster } from 'react-hot-toast';
import { queryClient } from './lib/query-client';
import { dexiePersister } from './lib/offline/query-persister';
import { startSyncWatcher } from './lib/offline/sync-processor';
import ErrorBoundary from './components/ErrorBoundary';
import UpdatePrompt from './components/ui/UpdatePrompt';

// Layouts
import AppLayout from './components/layouts/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LoginPage from './features/auth/pages/LoginPage';
import AcceptInvitePage from './features/auth/pages/AcceptInvitePage';
import ForgotPasswordPage from './features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from './features/auth/pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';

// Buildings
import BuildingsPage from './features/buildings/pages/BuildingsPage';
import BuildingDetailPage from './features/buildings/pages/BuildingDetailPage';
import BuildingFormPage from './features/buildings/pages/BuildingFormPage';

// Assessments
import AssessmentsPage from './features/assessments/pages/AssessmentsPage';
import AssessmentDetailPage from './features/assessments/pages/AssessmentDetailPage';
import AssessmentFormPage from './features/assessments/pages/AssessmentFormPage';
import ElementDetailPage from './features/assessments/pages/ElementDetailPage';
import ConductAssessmentPage from './features/assessments/pages/ConductAssessmentPage';

// Deficiencies
import DeficienciesPage from './features/deficiencies/pages/DeficienciesPage';
import DeficiencyDetailPage from './features/deficiencies/pages/DeficiencyDetailPage';

// Reports
import ReportsPage from './features/reports/pages/ReportsPage';

// Users & Settings
import UsersPage from './features/users/pages/UsersPage';
import SettingsPage from './features/settings/pages/SettingsPage';

const persistOptions = {
  persister: dexiePersister,
  maxAge: 1000 * 60 * 60 * 24, // 24 hours
};

function App() {
  useEffect(() => {
    startSyncWatcher();
  }, []);

  return (
    <ErrorBoundary>
      <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        <UpdatePrompt />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/accept-invite/:token" element={<AcceptInvitePage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />

                {/* Buildings */}
                <Route path="/buildings" element={<BuildingsPage />} />
                <Route element={<ProtectedRoute allowedRoles={['org_admin', 'branch_manager']} />}>
                  <Route path="/buildings/new" element={<BuildingFormPage />} />
                  <Route path="/buildings/:id/edit" element={<BuildingFormPage />} />
                </Route>
                <Route path="/buildings/:id" element={<BuildingDetailPage />} />

                {/* Assessments */}
                <Route path="/assessments" element={<AssessmentsPage />} />
                <Route element={<ProtectedRoute allowedRoles={['org_admin', 'branch_manager', 'assessor']} />}>
                  <Route path="/assessments/new" element={<AssessmentFormPage />} />
                  <Route path="/assessments/:id/conduct" element={<ConductAssessmentPage />} />
                </Route>
                <Route element={<ProtectedRoute allowedRoles={['org_admin', 'branch_manager']} />}>
                  <Route path="/assessments/:id/edit" element={<AssessmentFormPage />} />
                </Route>
                <Route path="/assessments/:id" element={<AssessmentDetailPage />} />
                <Route path="/assessments/:assessmentId/elements/:elementId" element={<ElementDetailPage />} />

                {/* Deficiencies */}
                <Route path="/deficiencies" element={<DeficienciesPage />} />
                <Route path="/deficiencies/:id" element={<DeficiencyDetailPage />} />

                <Route path="/reports" element={<ReportsPage />} />
                <Route element={<ProtectedRoute allowedRoles={['org_admin', 'branch_manager']} />}>
                  <Route path="/users" element={<UsersPage />} />
                </Route>
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Route>

            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </PersistQueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
