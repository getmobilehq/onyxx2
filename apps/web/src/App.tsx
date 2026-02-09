/**
 * App Component
 * Root application component with routing
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { queryClient } from './lib/query-client';
import ErrorBoundary from './components/ErrorBoundary';

// Layouts
import AppLayout from './components/layouts/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LoginPage from './features/auth/pages/LoginPage';
import AcceptInvitePage from './features/auth/pages/AcceptInvitePage';
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

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/accept-invite/:token" element={<AcceptInvitePage />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />

                {/* Buildings */}
                <Route path="/buildings" element={<BuildingsPage />} />
                <Route path="/buildings/new" element={<BuildingFormPage />} />
                <Route path="/buildings/:id" element={<BuildingDetailPage />} />
                <Route path="/buildings/:id/edit" element={<BuildingFormPage />} />

                {/* Assessments */}
                <Route path="/assessments" element={<AssessmentsPage />} />
                <Route path="/assessments/new" element={<AssessmentFormPage />} />
                <Route path="/assessments/:id" element={<AssessmentDetailPage />} />
                <Route path="/assessments/:id/edit" element={<AssessmentFormPage />} />
                <Route path="/assessments/:id/conduct" element={<ConductAssessmentPage />} />
                <Route path="/assessments/:assessmentId/elements/:elementId" element={<ElementDetailPage />} />

                {/* Deficiencies */}
                <Route path="/deficiencies" element={<DeficienciesPage />} />
                <Route path="/deficiencies/:id" element={<DeficiencyDetailPage />} />

                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Route>

            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
