/**
 * App Component
 * Root application component with routing
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { queryClient } from './lib/query-client';

// Layouts
import AppLayout from './components/layouts/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LoginPage from './features/auth/pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

// Buildings
import BuildingsPage from './features/buildings/pages/BuildingsPage';
import BuildingDetailPage from './features/buildings/pages/BuildingDetailPage';
import BuildingFormPage from './features/buildings/pages/BuildingFormPage';

// Assessments
import AssessmentsPage from './features/assessments/pages/AssessmentsPage';
import AssessmentDetailPage from './features/assessments/pages/AssessmentDetailPage';
import AssessmentFormPage from './features/assessments/pages/AssessmentFormPage';
import ElementDetailPage from './features/assessments/pages/ElementDetailPage';

// Reports
import ReportsPage from './features/reports/pages/ReportsPage';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />

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
              <Route path="/assessments/:assessmentId/elements/:elementId" element={<ElementDetailPage />} />

              {/* Placeholder routes */}
              <Route path="/deficiencies" element={
                <div className="card max-w-2xl mx-auto text-center py-12">
                  <h2 className="text-xl font-semibold text-slate-900 mb-2">Deficiency Management</h2>
                  <p className="text-slate-600 mb-4">
                    Deficiencies are managed within assessment elements. Navigate to an assessment, open the Elements tab, and click an element to view and manage its deficiencies.
                  </p>
                  <a href="/assessments" className="btn btn-md btn-primary">Go to Assessments</a>
                </div>
              } />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/users" element={<div className="card">Users - Coming Soon</div>} />
              <Route path="/settings" element={<div className="card">Settings - Coming Soon</div>} />
            </Route>
          </Route>

          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 404 */}
          <Route path="*" element={<div className="min-h-screen flex items-center justify-center">404 - Page Not Found</div>} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
