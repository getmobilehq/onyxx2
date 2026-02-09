import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createColumnHelper } from '@tanstack/react-table';
import { Eye, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDeficiencies, useDeleteDeficiency } from '../../assessments/api/deficiencies.api';
import DataTable from '../../../components/ui/DataTable';
import Pagination from '../../../components/ui/Pagination';
import SearchInput from '../../../components/ui/SearchInput';
import Select from '../../../components/ui/Select';
import SeverityBadge from '../../../components/ui/SeverityBadge';
import PriorityBadge from '../../../components/ui/PriorityBadge';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import type { Deficiency } from '../../../types';

const columnHelper = createColumnHelper<Deficiency>();

const severityOptions = [
  { value: 'minor', label: 'Minor' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'major', label: 'Major' },
  { value: 'critical', label: 'Critical' },
];

const priorityOptions = [
  { value: 'immediate', label: 'Immediate' },
  { value: 'short_term', label: 'Short Term' },
  { value: 'medium_term', label: 'Medium Term' },
  { value: 'long_term', label: 'Long Term' },
];

function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export default function DeficienciesPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('');
  const [priority, setPriority] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Deficiency | null>(null);

  const filters = {
    page,
    limit: 20,
    ...(search && { search }),
    ...(severity && { severity }),
    ...(priority && { priority }),
  };

  const { data, isLoading } = useDeficiencies(filters);
  const deleteMutation = useDeleteDeficiency();

  const deficiencies = data?.data || [];
  const meta = data?.meta;

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success(`"${deleteTarget.title}" deleted successfully`);
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete deficiency');
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleSeverityChange = (value: string) => {
    setSeverity(value);
    setPage(1);
  };

  const handlePriorityChange = (value: string) => {
    setPriority(value);
    setPage(1);
  };

  const columns = [
    columnHelper.accessor('title', {
      header: 'Title',
      cell: (info) => (
        <Link
          to={`/deficiencies/${info.row.original.id}`}
          className="font-medium text-onyx-600 hover:text-onyx-700"
        >
          {info.getValue()}
        </Link>
      ),
    }),
    columnHelper.display({
      id: 'building',
      header: 'Building',
      cell: (info) => {
        const building = info.row.original.assessmentElement?.assessment?.building;
        return building ? (
          <Link to={`/buildings/${building.id}`} className="text-slate-700 hover:text-onyx-600">
            {building.name}
          </Link>
        ) : '—';
      },
    }),
    columnHelper.accessor('severity', {
      header: 'Severity',
      cell: (info) => <SeverityBadge severity={info.getValue()} />,
    }),
    columnHelper.accessor('priority', {
      header: 'Priority',
      cell: (info) => <PriorityBadge priority={info.getValue()} />,
    }),
    columnHelper.accessor('totalCost', {
      header: 'Cost',
      cell: (info) => (
        <span className="text-sm font-medium text-slate-700">
          {formatCurrency(info.getValue())}
        </span>
      ),
    }),
    columnHelper.accessor('targetYear', {
      header: 'Target Year',
      cell: (info) => info.getValue() || '—',
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (info) => {
        const deficiency = info.row.original;
        return (
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate(`/deficiencies/${deficiency.id}`)}
              className="btn btn-ghost btn-sm p-1.5"
              title="View"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDeleteTarget(deficiency)}
              className="btn btn-ghost btn-sm p-1.5 text-red-600 hover:bg-red-50"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      },
    }),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-display-sm font-display text-slate-900">Deficiencies</h1>
        <p className="text-slate-600 mt-1">
          {meta ? `${meta.total} deficienc${meta.total !== 1 ? 'ies' : 'y'} total` : 'View all deficiencies across assessments'}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="w-full sm:w-64">
          <SearchInput
            value={search}
            onChange={handleSearchChange}
            placeholder="Search deficiencies..."
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            options={severityOptions}
            value={severity}
            onChange={handleSeverityChange}
            placeholder="All Severities"
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            options={priorityOptions}
            value={priority}
            onChange={handlePriorityChange}
            placeholder="All Priorities"
          />
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={deficiencies}
        isLoading={isLoading}
        emptyMessage="No deficiencies found"
        emptyDescription={search || severity || priority ? 'Try adjusting your filters' : 'Deficiencies are created within assessment elements'}
      />

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={setPage} />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Deficiency"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
