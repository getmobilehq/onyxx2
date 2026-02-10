import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createColumnHelper } from '@tanstack/react-table';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../hooks/useAuth';
import { useBuildings, useDeleteBuilding } from '../api/buildings.api';
import { useBranches } from '../../branches/api/branches.api';
import DataTable from '../../../components/ui/DataTable';
import Pagination from '../../../components/ui/Pagination';
import SearchInput from '../../../components/ui/SearchInput';
import Select from '../../../components/ui/Select';
import FCIBadge from '../../../components/ui/FCIBadge';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import { formatDate } from '../../../lib/date-utils';
import type { Building } from '../../../types';

const columnHelper = createColumnHelper<Building>();

export default function BuildingsPage() {
  const navigate = useNavigate();
  const { canManageBuildings, isOrgAdmin } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [branchId, setBranchId] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Building | null>(null);

  const filters = {
    page,
    limit: 20,
    ...(search && { search }),
    ...(branchId && { branchId }),
  };

  const { data, isLoading } = useBuildings(filters);
  const { data: branchData } = useBranches();
  const deleteMutation = useDeleteBuilding();

  const buildings = data?.data || [];
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
    } catch {
      toast.error('Failed to delete building');
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
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
          to={`/buildings/${info.row.original.id}`}
          className="font-medium text-onyx-600 hover:text-onyx-700"
        >
          {info.getValue()}
        </Link>
      ),
    }),
    columnHelper.accessor('code', {
      header: 'Code',
      cell: (info) => info.getValue() || '—',
    }),
    columnHelper.accessor('branch', {
      header: 'Branch',
      cell: (info) => info.getValue()?.name || '—',
      enableSorting: false,
    }),
    columnHelper.accessor('buildingType', {
      header: 'Type',
      cell: (info) => info.getValue() || '—',
    }),
    columnHelper.accessor('grossSquareFeet', {
      header: 'Sq Ft',
      cell: (info) => {
        const val = info.getValue();
        return val ? Number(val).toLocaleString() : '—';
      },
    }),
    columnHelper.accessor('currentFci', {
      header: 'FCI',
      cell: (info) => <FCIBadge value={info.getValue()} />,
    }),
    columnHelper.accessor('lastAssessmentDate', {
      header: 'Last Assessment',
      cell: (info) => {
        const val = info.getValue();
        return val ? formatDate(val) : 'Never';
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (info) => {
        const building = info.row.original;
        return (
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate(`/buildings/${building.id}`)}
              className="btn btn-ghost btn-sm p-1.5"
              title="View"
            >
              <Eye className="w-4 h-4" />
            </button>
            {canManageBuildings() && (
              <button
                onClick={() => navigate(`/buildings/${building.id}/edit`)}
                className="btn btn-ghost btn-sm p-1.5"
                title="Edit"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
            {isOrgAdmin() && (
              <button
                onClick={() => setDeleteTarget(building)}
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
          <h1 className="text-display-sm font-display text-slate-900">Buildings</h1>
          <p className="text-slate-600 mt-1">
            {meta ? `${meta.total} building${meta.total !== 1 ? 's' : ''} total` : 'Manage your facility portfolio'}
          </p>
        </div>
        {canManageBuildings() && (
          <Link to="/buildings/new" className="btn btn-md btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            New Building
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 max-w-sm">
          <SearchInput
            value={search}
            onChange={handleSearchChange}
            placeholder="Search buildings..."
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
        data={buildings}
        isLoading={isLoading}
        emptyMessage="No buildings found"
        emptyDescription={search || branchId ? 'Try adjusting your filters' : 'Add your first building to start tracking facility conditions.'}
        emptyAction={!search && !branchId && canManageBuildings() ? (
          <Link to="/buildings/new" className="btn btn-sm btn-primary">
            <Plus className="w-4 h-4 mr-1" />
            Add Building
          </Link>
        ) : undefined}
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
        title="Delete Building"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
