/**
 * App Component
 * Root application component with routing
 */

import { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { Toaster } from 'react-hot-toast';
import { queryClient } from './lib/query-client';
import { dexiePersister } from './lib/offline/query-persister';
import { startSyncWatcher } from './lib/offline/sync-processor';
import { supabase } from './lib/supabase';
import { useAuthStore } from './stores/auth.store';
import apiClient from './lib/api-client';
import ErrorBoundary from './components/ErrorBoundary';
import UpdatePrompt from './components/ui/UpdatePrompt';
import LoadingSpinner from './components/ui/LoadingSpinner';

// Layouts (eagerly loaded — needed for shell)
import AppLayout from './components/layouts/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy-loaded pages
const LoginPage = lazy(() => import('./features/auth/pages/LoginPage'));
const AuthCallbackPage = lazy(() => import('./features/auth/pages/AuthCallbackPage'));
const ForgotPasswordPage = lazy(() => import('./features/auth/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./features/auth/pages/ResetPasswordPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const BuildingsPage = lazy(() => import('./features/buildings/pages/BuildingsPage'));
const BuildingDetailPage = lazy(() => import('./features/buildings/pages/BuildingDetailPage'));
const BuildingFormPage = lazy(() => import('./features/buildings/pages/BuildingFormPage'));
const AssessmentsPage = lazy(() => import('./features/assessments/pages/AssessmentsPage'));
const AssessmentDetailPage = lazy(() => import('./features/assessments/pages/AssessmentDetailPage'));
const AssessmentFormPage = lazy(() => import('./features/assessments/pages/AssessmentFormPage'));
const ElementDetailPage = lazy(() => import('./features/assessments/pages/ElementDetailPage'));
const ConductAssessmentPage = lazy(() => import('./features/assessments/pages/ConductAssessmentPage'));
const DeficienciesPage = lazy(() => import('./features/deficiencies/pages/DeficienciesPage'));
const DeficiencyDetailPage = lazy(() => import('./features/deficiencies/pages/DeficiencyDetailPage'));
const ReportsPage = lazy(() => import('./features/reports/pages/ReportsPage'));
const UsersPage = lazy(() => import('./features/users/pages/UsersPage'));
const SettingsPage = lazy(() => import('./features/settings/pages/SettingsPage'));

const persistOptions = {
  persister: dexiePersister,
  maxAge: 1000 * 60 * 60 * 24, // 24 hours
};

function App() {
  const { setAuth, clearAuth } = useAuthStore();
  const [authReady, setAuthReady] = useState(false);

  // On mount, check for existing Supabase session
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        try {
          // Fetch internal user data from our API
          const { data } = await apiClient.get('/auth/me');
          setAuth(data);
        } catch {
          clearAuth();
          await supabase.auth.signOut();
        }
      } else {
        clearAuth();
      }
      setAuthReady(true);
    });

    // Listen for auth state changes (sign out, token refresh, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          clearAuth();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    startSyncWatcher();
  }, []);

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" message="Restoring session..." />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            ariaProps: { role: 'status', 'aria-live': 'polite' },
          }}
        />
        <UpdatePrompt />
        <BrowserRouter>
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
              <LoadingSpinner size="lg" message="Loading..." />
            </div>
          }>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

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
          </Suspense>
        </BrowserRouter>
      </PersistQueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
