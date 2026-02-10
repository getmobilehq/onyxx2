import { useState } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { Pencil, UserX, RefreshCw, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../hooks/useAuth';
import { useUsers, useDeactivateUser, useResendInvite } from '../api/users.api';
import DataTable from '../../../components/ui/DataTable';
import Pagination from '../../../components/ui/Pagination';
import SearchInput from '../../../components/ui/SearchInput';
import Select from '../../../components/ui/Select';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import InviteUserDialog from '../components/InviteUserDialog';
import EditUserDialog from '../components/EditUserDialog';
import { formatDate } from '../../../lib/date-utils';
import type { User } from '../../../types';

const columnHelper = createColumnHelper<User>();

const ROLE_OPTIONS = [
  { value: 'org_admin', label: 'Org Admin' },
  { value: 'branch_manager', label: 'Branch Manager' },
  { value: 'assessor', label: 'Assessor' },
  { value: 'viewer', label: 'Viewer' },
];

const STATUS_OPTIONS = [
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];

function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, string> = {
    org_admin: 'bg-purple-100 text-purple-700',
    branch_manager: 'bg-blue-100 text-blue-700',
    assessor: 'bg-amber-100 text-amber-700',
    viewer: 'bg-slate-100 text-slate-600',
  };
  const labels: Record<string, string> = {
    org_admin: 'Org Admin',
    branch_manager: 'Branch Manager',
    assessor: 'Assessor',
    viewer: 'Viewer',
  };
  return (
    <span className={`badge ${colors[role] || 'bg-slate-100 text-slate-600'}`}>
      {labels[role] || role}
    </span>
  );
}

export default function UsersPage() {
  const { isOrgAdmin } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [isActive, setIsActive] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<User | null>(null);

  const filters = {
    page,
    limit: 20,
    ...(role && { role }),
    ...(isActive && { isActive: isActive === 'true' }),
  };

  const { data, isLoading } = useUsers(filters);
  const deactivateMutation = useDeactivateUser();
  const resendMutation = useResendInvite();

  const users = data?.data || [];
  const meta = data?.meta;

  // Client-side search filter (API doesn't support search param for users)
  const filteredUsers = search
    ? users.filter(
        (u) =>
          u.firstName?.toLowerCase().includes(search.toLowerCase()) ||
          u.lastName?.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase()),
      )
    : users;

  const handleDeactivate = async () => {
    if (!deactivateTarget) return;
    try {
      await deactivateMutation.mutateAsync(deactivateTarget.id);
      toast.success('User deactivated');
      setDeactivateTarget(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to deactivate user');
    }
  };

  const handleResendInvite = async (userId: string) => {
    try {
      await resendMutation.mutateAsync(userId);
      toast.success('Invitation resent');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to resend invitation');
    }
  };

  const columns = [
    columnHelper.accessor((row) => `${row.firstName || ''} ${row.lastName || ''}`.trim(), {
      id: 'name',
      header: 'Name',
      cell: (info) => (
        <div>
          <span className="font-medium text-slate-900">{info.getValue() || '—'}</span>
        </div>
      ),
    }),
    columnHelper.accessor('email', {
      header: 'Email',
      cell: (info) => <span className="text-sm text-slate-600">{info.getValue()}</span>,
    }),
    columnHelper.accessor('role', {
      header: 'Role',
      cell: (info) => <RoleBadge role={info.getValue()} />,
    }),
    columnHelper.accessor('isActive', {
      header: 'Status',
      cell: (info) => (
        <span className={`badge ${info.getValue() ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
          {info.getValue() ? 'Active' : 'Inactive'}
        </span>
      ),
    }),
    columnHelper.accessor('createdAt', {
      header: 'Created',
      cell: (info) => (
        <span className="text-sm text-slate-500">
          {formatDate(info.getValue())}
        </span>
      ),
    }),
    ...(isOrgAdmin()
      ? [
          columnHelper.display({
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setEditUser(row.original)}
                  className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-700"
                  title="Edit user"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                {row.original.isActive && (
                  <button
                    onClick={() => setDeactivateTarget(row.original)}
                    className="p-1.5 rounded hover:bg-red-50 text-slate-500 hover:text-red-600"
                    title="Deactivate user"
                  >
                    <UserX className="w-4 h-4" />
                  </button>
                )}
                {!row.original.isActive && (
                  <button
                    onClick={() => handleResendInvite(row.original.id)}
                    className="p-1.5 rounded hover:bg-blue-50 text-slate-500 hover:text-blue-600"
                    title="Resend invitation"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                )}
              </div>
            ),
          }),
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-display text-slate-900 mb-1">User Management</h1>
          <p className="text-slate-600">Manage your organization's team members.</p>
        </div>
        {isOrgAdmin() && (
          <button onClick={() => setShowInvite(true)} className="btn btn-md btn-primary flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Invite User
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="w-64">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by name or email..."
          />
        </div>
        <div className="w-48">
          <Select options={ROLE_OPTIONS} value={role} onChange={(v) => { setRole(v); setPage(1); }} placeholder="All Roles" />
        </div>
        <div className="w-40">
          <Select options={STATUS_OPTIONS} value={isActive} onChange={(v) => { setIsActive(v); setPage(1); }} placeholder="All Status" />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <LoadingSpinner size="lg" message="Loading users..." />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={filteredUsers}
            emptyMessage="No users found"
          />
          {meta && meta.totalPages > 1 && (
            <Pagination
              page={meta.page}
              totalPages={meta.totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      {/* Dialogs */}
      <InviteUserDialog isOpen={showInvite} onClose={() => setShowInvite(false)} />
      <EditUserDialog isOpen={!!editUser} onClose={() => setEditUser(null)} user={editUser} />
      <ConfirmDialog
        isOpen={!!deactivateTarget}
        onClose={() => setDeactivateTarget(null)}
        onConfirm={handleDeactivate}
        title="Deactivate User"
        message={`Are you sure you want to deactivate ${deactivateTarget?.firstName} ${deactivateTarget?.lastName} (${deactivateTarget?.email})?`}
        confirmLabel="Deactivate"
        isLoading={deactivateMutation.isPending}
      />
    </div>
  );
}
