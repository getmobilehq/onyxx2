import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createColumnHelper } from '@tanstack/react-table';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAssessments, useDeleteAssessment } from '../api/assessments.api';
import { useBranches } from '../../branches/api/branches.api';
import DataTable from '../../../components/ui/DataTable';
import Pagination from '../../../components/ui/Pagination';
import Select from '../../../components/ui/Select';
import StatusBadge from '../../../components/ui/StatusBadge';
import FCIBadge from '../../../components/ui/FCIBadge';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import type { Assessment, AssessmentStatus } from '../../../types';

const columnHelper = createColumnHelper<Assessment>();

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'in_review', label: 'In Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

export default function AssessmentsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [branchId, setBranchId] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Assessment | null>(null);

  const filters = {
    page,
    limit: 20,
    ...(status && { status: status as AssessmentStatus }),
    ...(branchId && { branchId }),
  };

  const { data, isLoading } = useAssessments(filters);
  const { data: branchData } = useBranches();
  const deleteMutation = useDeleteAssessment();

  const assessments = data?.data || [];
  const meta = data?.meta;

  const branchOptions = (branchData?.data || []).map((b) => ({
    value: b.id,
    label: b.name,
  }));

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success(`"${deleteTarget.name}" deleted successfully`);
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete assessment');
    }
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    setPage(1);
  };

  const handleBranchChange = (value: string) => {
    setBranchId(value);
    setPage(1);
  };

  const columns = [
    columnHelper.accessor('name', {
      header: 'Name',
      cell: (info) => (
        <Link
          to={`/assessments/${info.row.original.id}`}
          className="font-medium text-onyx-600 hover:text-onyx-700"
        >
          {info.getValue()}
        </Link>
      ),
    }),
    columnHelper.accessor('building', {
      header: 'Building',
      cell: (info) => {
        const building = info.getValue();
        return building ? (
          <Link to={`/buildings/${building.id}`} className="text-slate-700 hover:text-onyx-600">
            {building.name}
          </Link>
        ) : '—';
      },
      enableSorting: false,
    }),
    columnHelper.accessor('branch', {
      header: 'Branch',
      cell: (info) => info.getValue()?.name || '—',
      enableSorting: false,
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => <StatusBadge status={info.getValue()} />,
    }),
    columnHelper.display({
      id: 'progress',
      header: 'Elements',
      cell: (info) => {
        const a = info.row.original;
        return (
          <span className="text-sm text-slate-600">
            {a.completedElements}/{a.totalElements}
          </span>
        );
      },
    }),
    columnHelper.accessor('calculatedFci', {
      header: 'FCI',
      cell: (info) => <FCIBadge value={info.getValue()} />,
    }),
    columnHelper.accessor('updatedAt', {
      header: 'Updated',
      cell: (info) => new Date(info.getValue()).toLocaleDateString(),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (info) => {
        const assessment = info.row.original;
        return (
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate(`/assessments/${assessment.id}`)}
              className="btn btn-ghost btn-sm p-1.5"
              title="View"
            >
              <Eye className="w-4 h-4" />
            </button>
            {assessment.status === 'draft' && (
              <button
                onClick={() => navigate(`/assessments/${assessment.id}/edit`)}
                className="btn btn-ghost btn-sm p-1.5"
                title="Edit"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
            {assessment.status !== 'approved' && (
              <button
                onClick={() => setDeleteTarget(assessment)}
                className="btn btn-ghost btn-sm p-1.5 text-red-600 hover:bg-red-50"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        );
      },
    }),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-display text-slate-900">Assessments</h1>
          <p className="text-slate-600 mt-1">
            {meta ? `${meta.total} assessment${meta.total !== 1 ? 's' : ''} total` : 'Manage facility condition assessments'}
          </p>
        </div>
        <Link to="/assessments/new" className="btn btn-md btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          New Assessment
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="w-full sm:w-48">
          <Select
            options={statusOptions}
            value={status}
            onChange={handleStatusChange}
            placeholder="All Statuses"
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            options={branchOptions}
            value={branchId}
            onChange={handleBranchChange}
            placeholder="All Branches"
          />
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={assessments}
        isLoading={isLoading}
        emptyMessage="No assessments found"
        emptyDescription={status || branchId ? 'Try adjusting your filters' : 'Create your first assessment to get started'}
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
        title="Delete Assessment"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
