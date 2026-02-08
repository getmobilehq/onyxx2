import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useDashboardStats } from '../features/dashboard/api/dashboard.api';
import { Building2, ClipboardCheck, AlertTriangle, TrendingUp } from 'lucide-react';
import StatusBadge from '../components/ui/StatusBadge';
import FCIBadge from '../components/ui/FCIBadge';
import LoadingSpinner from '../components/ui/LoadingSpinner';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

const DashboardPage = () => {
  const { user } = useAuth();
  const { data: stats, isLoading, error } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner size="lg" message="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card text-center py-12">
        <p className="text-red-600 font-medium">Failed to load dashboard data</p>
        <p className="text-sm text-slate-500 mt-1">Please check your connection and try again.</p>
      </div>
    );
  }

  const summary = stats?.summary;
  const recentAssessments = stats?.recentAssessments || [];

  const statCards = [
    {
      label: 'Total Buildings',
      value: formatNumber(summary?.totalBuildings || 0),
      icon: Building2,
      color: 'text-onyx-600',
      bgColor: 'bg-onyx-50',
    },
    {
      label: 'Total Assessments',
      value: formatNumber(summary?.totalAssessments || 0),
      icon: ClipboardCheck,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Open Deficiencies',
      value: formatNumber(summary?.totalDeficiencies || 0),
      icon: AlertTriangle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      label: 'Portfolio FCI',
      value: summary?.portfolioFCI != null ? `${(summary.portfolioFCI * 100).toFixed(1)}%` : 'N/A',
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-display-sm font-display text-slate-900 mb-2">
          Welcome back, {user?.firstName}
        </h1>
        <p className="text-slate-600">
          Here's an overview of your facility portfolio
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card card-hover">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Row */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <p className="text-sm text-slate-600 mb-1">Total Replacement Value</p>
            <p className="text-xl font-bold text-slate-900">
              {formatCurrency(summary.totalReplacementValue)}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-600 mb-1">Deferred Maintenance</p>
            <p className="text-xl font-bold text-slate-900">
              {formatCurrency(summary.totalDeferredMaintenance)}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-600 mb-1">Total Square Feet</p>
            <p className="text-xl font-bold text-slate-900">
              {formatNumber(summary.totalSquareFeet)}
            </p>
          </div>
        </div>
      )}

      {/* Recent Assessments */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Recent Assessments</h2>
          <Link to="/assessments" className="text-sm text-onyx-600 hover:text-onyx-700 font-medium">
            View all
          </Link>
        </div>
        {recentAssessments.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            No assessments yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600 uppercase">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600 uppercase">Building</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600 uppercase">FCI</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600 uppercase">Updated</th>
                </tr>
              </thead>
              <tbody>
                {recentAssessments.map((assessment) => (
                  <tr key={assessment.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">
                      {assessment.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {assessment.building?.name || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={assessment.status} />
                    </td>
                    <td className="px-4 py-3">
                      <FCIBadge value={assessment.calculatedFci} />
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {new Date(assessment.updatedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
