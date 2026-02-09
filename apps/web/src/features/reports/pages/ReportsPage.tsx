import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  ClipboardCheck,
  AlertTriangle,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  DollarSign,
  FileText,
  Table,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { exportPortfolioPDF, exportPortfolioExcel } from '../../../lib/exports/portfolio.export';
import { exportAssessmentsPDF, exportAssessmentsExcel } from '../../../lib/exports/assessments.export';
import { exportDeficienciesPDF, exportDeficienciesExcel } from '../../../lib/exports/deficiencies.export';
import { exportForecastPDF, exportForecastExcel } from '../../../lib/exports/forecast.export';
import {
  usePortfolioReport,
  useAssessmentSummaryReport,
  useDeficiencySummaryReport,
  useCapitalForecastReport,
} from '../api/reports.api';
import { useBranches } from '../../branches/api/branches.api';
import { useBuildings } from '../../buildings/api/buildings.api';
import Select from '../../../components/ui/Select';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import EmptyState from '../../../components/ui/EmptyState';
import FCIBadge from '../../../components/ui/FCIBadge';
import StatusBadge from '../../../components/ui/StatusBadge';
import SeverityBadge from '../../../components/ui/SeverityBadge';
import PriorityBadge from '../../../components/ui/PriorityBadge';
import ForecastBarChart from '../components/ForecastBarChart';
import StatusPieChart from '../components/StatusPieChart';
import DeficiencyCharts from '../components/DeficiencyCharts';
import type { DeficiencyPriority, DeficiencySeverity } from '../../../types';

type Tab = 'portfolio' | 'assessments' | 'deficiencies' | 'forecast';

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

// ============================================
// TAB 1: PORTFOLIO
// ============================================

function PortfolioTab() {
  const [branchId, setBranchId] = useState('');
  const { data: branchesData } = useBranches();
  const { data, isLoading, error } = usePortfolioReport(
    branchId ? { branchId } : {},
  );

  const branches = branchesData?.data || [];
  const branchOptions = branches.map((b) => ({ value: b.id, label: b.name }));

  if (isLoading) return <LoadingSpinner size="lg" message="Loading portfolio report..." />;
  if (error) return <div className="text-red-600 text-sm">Failed to load portfolio report.</div>;
  if (!data) return null;

  const { buildings, summary } = data;

  const handleExport = (fn: () => void, label: string) => {
    try {
      fn();
      toast.success(`${label} downloaded`);
    } catch {
      toast.error(`Failed to export ${label}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="flex items-center gap-4">
        <div className="w-64">
          <Select
            options={branchOptions}
            value={branchId}
            onChange={setBranchId}
            placeholder="All Branches"
          />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => handleExport(() => exportPortfolioPDF(data), 'PDF')}
            className="btn btn-sm btn-outline flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4" /> PDF
          </button>
          <button
            onClick={() => handleExport(() => exportPortfolioExcel(data), 'Excel')}
            className="btn btn-sm btn-outline flex items-center gap-1.5"
          >
            <Table className="w-4 h-4" /> Excel
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Buildings"
          value={formatNumber(summary.totalBuildings)}
          icon={Building2}
          color="text-onyx-600"
          bgColor="bg-onyx-50"
        />
        <StatCard
          label="Total CRV"
          value={formatCurrency(summary.totalReplacementValue)}
          icon={DollarSign}
          color="text-emerald-600"
          bgColor="bg-emerald-50"
        />
        <StatCard
          label="Deferred Maintenance"
          value={formatCurrency(summary.totalDeferredMaintenance)}
          icon={AlertTriangle}
          color="text-amber-600"
          bgColor="bg-amber-50"
        />
        <StatCard
          label="Portfolio FCI"
          value={
            summary.portfolioFCI != null
              ? `${(summary.portfolioFCI * 100).toFixed(1)}%`
              : 'N/A'
          }
          icon={TrendingUp}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
      </div>

      {/* Buildings Table */}
      {buildings.length === 0 ? (
        <EmptyState title="No buildings found" description="No buildings match the selected filters." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Building</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Branch</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Sq Ft</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">CRV</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Deferred Maint.</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">FCI</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Assessments</th>
                </tr>
              </thead>
              <tbody>
                {buildings.map((b) => (
                  <tr key={b.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium">
                      <Link to={`/buildings/${b.id}`} className="text-onyx-600 hover:text-onyx-700">
                        {b.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{b.branch?.name || '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 text-right">
                      {b.grossSquareFeet ? formatNumber(b.grossSquareFeet) : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 text-right">
                      {b.currentReplacementValue != null ? formatCurrency(b.currentReplacementValue) : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 text-right">
                      {b.totalDeferredMaintenance != null ? formatCurrency(b.totalDeferredMaintenance) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <FCIBadge value={b.currentFci} />
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 text-right">
                      {b._count?.assessments ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// TAB 2: ASSESSMENTS
// ============================================

function AssessmentsTab() {
  const [status, setStatus] = useState('');
  const { data, isLoading, error } = useAssessmentSummaryReport(
    status ? { status } : {},
  );

  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'in_review', label: 'In Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
  ];

  if (isLoading) return <LoadingSpinner size="lg" message="Loading assessment report..." />;
  if (error) return <div className="text-red-600 text-sm">Failed to load assessment report.</div>;
  if (!data) return null;

  const { assessments, statusSummary } = data;

  const handleExport = (fn: () => void, label: string) => {
    try {
      fn();
      toast.success(`${label} downloaded`);
    } catch {
      toast.error(`Failed to export ${label}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="flex items-center gap-4">
        <div className="w-64">
          <Select
            options={statusOptions}
            value={status}
            onChange={setStatus}
            placeholder="All Statuses"
          />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => handleExport(() => exportAssessmentsPDF(data), 'PDF')}
            className="btn btn-sm btn-outline flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4" /> PDF
          </button>
          <button
            onClick={() => handleExport(() => exportAssessmentsExcel(data), 'Excel')}
            className="btn btn-sm btn-outline flex items-center gap-1.5"
          >
            <Table className="w-4 h-4" /> Excel
          </button>
        </div>
      </div>

      {/* Chart + Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Status Distribution</h3>
          {statusSummary.length > 0 ? (
            <StatusPieChart data={statusSummary} />
          ) : (
            <p className="text-sm text-slate-400 text-center py-8">No data available</p>
          )}
        </div>
        <div className="space-y-4">
          {statusSummary.map((s) => (
            <div key={s.status} className="card flex items-center justify-between">
              <StatusBadge status={s.status} />
              <span className="text-2xl font-bold text-slate-900">{s.count}</span>
            </div>
          ))}
          {statusSummary.length === 0 && (
            <div className="card text-center py-8 text-slate-400 text-sm">No status data</div>
          )}
        </div>
      </div>

      {/* Assessments Table */}
      {assessments.length === 0 ? (
        <EmptyState title="No assessments found" description="No assessments match the selected filters." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Building</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Branch</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Elements</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Created</th>
                </tr>
              </thead>
              <tbody>
                {assessments.map((a) => (
                  <tr key={a.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium">
                      <Link to={`/assessments/${a.id}`} className="text-onyx-600 hover:text-onyx-700">
                        {a.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{a.building?.name || '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{a.branch?.name || '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                    <td className="px-4 py-3 text-sm text-slate-600 text-right">{a._count?.elements ?? a.totalElements ?? 0}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{new Date(a.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// TAB 3: DEFICIENCIES
// ============================================

function DeficienciesTab() {
  const [buildingId, setBuildingId] = useState('');
  const [expandedPriority, setExpandedPriority] = useState<string | null>(null);
  const { data: buildingsData } = useBuildings({ limit: 100 });
  const { data, isLoading, error } = useDeficiencySummaryReport(
    buildingId ? { buildingId } : {},
  );

  const buildings = buildingsData?.data || [];
  const buildingOptions = buildings.map((b) => ({ value: b.id, label: b.name }));

  if (isLoading) return <LoadingSpinner size="lg" message="Loading deficiency report..." />;
  if (error) return <div className="text-red-600 text-sm">Failed to load deficiency report.</div>;
  if (!data) return null;

  const { summary, byPriority, bySeverity } = data;
  const priorityOrder = ['immediate', 'short_term', 'medium_term', 'long_term'];

  const handleExport = (fn: () => void, label: string) => {
    try {
      fn();
      toast.success(`${label} downloaded`);
    } catch {
      toast.error(`Failed to export ${label}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="flex items-center gap-4">
        <div className="w-64">
          <Select
            options={buildingOptions}
            value={buildingId}
            onChange={setBuildingId}
            placeholder="All Buildings"
          />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => handleExport(() => exportDeficienciesPDF(data), 'PDF')}
            className="btn btn-sm btn-outline flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4" /> PDF
          </button>
          <button
            onClick={() => handleExport(() => exportDeficienciesExcel(data), 'Excel')}
            className="btn btn-sm btn-outline flex items-center gap-1.5"
          >
            <Table className="w-4 h-4" /> Excel
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          label="Total Deficiencies"
          value={formatNumber(summary.totalDeficiencies)}
          icon={AlertTriangle}
          color="text-amber-600"
          bgColor="bg-amber-50"
        />
        <StatCard
          label="Total Cost"
          value={formatCurrency(summary.totalCost)}
          icon={DollarSign}
          color="text-red-600"
          bgColor="bg-red-50"
        />
      </div>

      {/* Charts */}
      <DeficiencyCharts bySeverity={bySeverity} byPriority={byPriority} />

      {/* Priority Groups */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-700">Deficiencies by Priority</h3>
        {priorityOrder.map((priority) => {
          const group = byPriority[priority];
          if (!group || group.count === 0) return null;
          const isExpanded = expandedPriority === priority;

          return (
            <div key={priority} className="card overflow-hidden">
              <button
                onClick={() => setExpandedPriority(isExpanded ? null : priority)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                  <PriorityBadge priority={priority as DeficiencyPriority} />
                  <span className="text-sm text-slate-600">
                    {group.count} {group.count === 1 ? 'deficiency' : 'deficiencies'}
                  </span>
                </div>
                <span className="text-sm font-semibold text-slate-900">
                  {formatCurrency(group.totalCost)}
                </span>
              </button>
              {isExpanded && group.deficiencies.length > 0 && (
                <div className="border-t border-slate-200">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600 uppercase">Title</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600 uppercase">Severity</th>
                        <th className="px-4 py-2 text-right text-xs font-semibold text-slate-600 uppercase">Cost</th>
                        <th className="px-4 py-2 text-right text-xs font-semibold text-slate-600 uppercase">Target Year</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.deficiencies.map((d) => (
                        <tr key={d.id} className="border-b border-slate-50 last:border-0">
                          <td className="px-4 py-2 text-sm text-slate-900">{d.title}</td>
                          <td className="px-4 py-2">
                            <SeverityBadge severity={d.severity as DeficiencySeverity} />
                          </td>
                          <td className="px-4 py-2 text-sm text-slate-600 text-right">
                            {d.totalCost != null ? formatCurrency(d.totalCost) : '—'}
                          </td>
                          <td className="px-4 py-2 text-sm text-slate-600 text-right">
                            {d.targetYear ?? '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
        {Object.keys(byPriority).length === 0 && (
          <EmptyState title="No deficiencies" description="No deficiency data available." />
        )}
      </div>
    </div>
  );
}

// ============================================
// TAB 4: CAPITAL FORECAST
// ============================================

function ForecastTab() {
  const [branchId, setBranchId] = useState('');
  const [expandedYear, setExpandedYear] = useState<number | null>(null);
  const { data: branchesData } = useBranches();
  const { data, isLoading, error } = useCapitalForecastReport(
    branchId ? { branchId } : {},
  );

  const branches = branchesData?.data || [];
  const branchOptions = branches.map((b) => ({ value: b.id, label: b.name }));

  if (isLoading) return <LoadingSpinner size="lg" message="Loading capital forecast..." />;
  if (error) return <div className="text-red-600 text-sm">Failed to load capital forecast.</div>;
  if (!data) return null;

  const { forecast, totalCost } = data;

  const handleExport = (fn: () => void, label: string) => {
    try {
      fn();
      toast.success(`${label} downloaded`);
    } catch {
      toast.error(`Failed to export ${label}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="flex items-center gap-4">
        <div className="w-64">
          <Select
            options={branchOptions}
            value={branchId}
            onChange={setBranchId}
            placeholder="All Branches"
          />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => handleExport(() => exportForecastPDF(data), 'PDF')}
            className="btn btn-sm btn-outline flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4" /> PDF
          </button>
          <button
            onClick={() => handleExport(() => exportForecastExcel(data), 'Excel')}
            className="btn btn-sm btn-outline flex items-center gap-1.5"
          >
            <Table className="w-4 h-4" /> Excel
          </button>
        </div>
      </div>

      {/* Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Total 10-Year Cost"
          value={formatCurrency(totalCost)}
          icon={TrendingUp}
          color="text-indigo-600"
          bgColor="bg-indigo-50"
        />
      </div>

      {/* Forecast Chart */}
      {forecast.length > 0 ? (
        <div className="card">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">10-Year Capital Forecast</h3>
          <ForecastBarChart data={forecast} />
        </div>
      ) : (
        <EmptyState title="No forecast data" description="No capital forecast data available." />
      )}

      {/* Year Details */}
      {forecast.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-700">Year-by-Year Breakdown</h3>
          {forecast.map((fy) => {
            const isExpanded = expandedYear === fy.year;
            return (
              <div key={fy.year} className="card overflow-hidden">
                <button
                  onClick={() => setExpandedYear(isExpanded ? null : fy.year)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                    <span className="text-sm font-semibold text-slate-900">{fy.year}</span>
                    <span className="text-sm text-slate-500">
                      {fy.count} {fy.count === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">
                    {formatCurrency(fy.totalCost)}
                  </span>
                </button>
                {isExpanded && fy.items.length > 0 && (
                  <div className="border-t border-slate-200">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600 uppercase">Title</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600 uppercase">Building</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600 uppercase">Priority</th>
                          <th className="px-4 py-2 text-right text-xs font-semibold text-slate-600 uppercase">Cost</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fy.items.map((item) => (
                          <tr key={item.id} className="border-b border-slate-50 last:border-0">
                            <td className="px-4 py-2 text-sm text-slate-900">{item.title}</td>
                            <td className="px-4 py-2 text-sm text-slate-600">{item.building}</td>
                            <td className="px-4 py-2">
                              <PriorityBadge priority={item.priority} />
                            </td>
                            <td className="px-4 py-2 text-sm text-slate-600 text-right">
                              {formatCurrency(item.cost)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================
// SHARED COMPONENTS
// ============================================

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bgColor,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-600 mb-1">{label}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${bgColor}`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN PAGE
// ============================================

const TABS: { key: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'portfolio', label: 'Portfolio', icon: Building2 },
  { key: 'assessments', label: 'Assessments', icon: ClipboardCheck },
  { key: 'deficiencies', label: 'Deficiencies', icon: AlertTriangle },
  { key: 'forecast', label: 'Capital Forecast', icon: TrendingUp },
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('portfolio');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-display-sm font-display text-slate-900 mb-2">
          Reports & Analytics
        </h1>
        <p className="text-slate-600">
          Portfolio insights, assessment progress, deficiency trends, and capital planning.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-6 -mb-px">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? 'border-onyx-600 text-onyx-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'portfolio' && <PortfolioTab />}
      {activeTab === 'assessments' && <AssessmentsTab />}
      {activeTab === 'deficiencies' && <DeficienciesTab />}
      {activeTab === 'forecast' && <ForecastTab />}
    </div>
  );
}
