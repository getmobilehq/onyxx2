import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createColumnHelper } from '@tanstack/react-table';
import {
  UserCircle,
  GitBranch,
  Building2,
  Pencil,
  Trash2,
  Plus,
  Shield,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../hooks/useAuth';
import { useAuthStore } from '../../../stores/auth.store';
import { useUpdateUser } from '../../users/api/users.api';
import { useChangePassword } from '../../auth/api/auth.api';
import { useBranches } from '../../branches/api/branches.api';
import { useDeleteBranch } from '../api/branches.api';
import { useOrganization, useOrganizationStats, useUpdateOrganization } from '../api/organizations.api';
import { useAuditLogs, type AuditLogFilters } from '../api/audit-logs.api';
import { organizationSchema, type OrganizationSchemaType } from '../validations/organization.schema';
import DataTable from '../../../components/ui/DataTable';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import FormField from '../../../components/ui/FormField';
import Pagination from '../../../components/ui/Pagination';
import BranchFormDialog from '../components/BranchFormDialog';
import type { Branch, AuditLog } from '../../../types';

type Tab = 'profile' | 'branches' | 'organization' | 'audit';

// ============================================
// TAB 1: PROFILE
// ============================================

function ProfileTab() {
  const { user } = useAuth();
  const updateUser = useAuthStore((s) => s.updateUser);
  const updateMutation = useUpdateUser();
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const data: Record<string, string> = {};
      if (firstName !== user.firstName) data.firstName = firstName;
      if (lastName !== user.lastName) data.lastName = lastName;
      if (phone) data.phone = phone;

      if (Object.keys(data).length === 0) {
        toast('No changes to save');
        setIsSaving(false);
        return;
      }

      await updateMutation.mutateAsync({ id: user.id, data });
      updateUser({ firstName, lastName });
      toast.success('Profile updated');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const ROLE_LABELS: Record<string, string> = {
    org_admin: 'Org Admin',
    branch_manager: 'Branch Manager',
    assessor: 'Assessor',
    viewer: 'Viewer',
  };

  return (
    <div className="max-w-xl space-y-6">
      <div className="card">
        <h3 className="text-base font-semibold text-slate-900 mb-4">Your Profile</h3>

        <div className="mb-6 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500 w-20">Email:</span>
            <span className="text-slate-900 font-medium">{user.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500 w-20">Role:</span>
            <span className="badge bg-purple-100 text-purple-700">
              {ROLE_LABELS[user.role] || user.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="First Name">
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="input"
              />
            </FormField>
            <FormField label="Last Name">
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="input"
              />
            </FormField>
          </div>

          <FormField label="Phone">
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input"
              placeholder="+1 (555) 000-0000"
            />
          </FormField>

          <div className="flex justify-end pt-4 border-t border-slate-200">
            <button type="submit" disabled={isSaving} className="btn btn-md btn-primary">
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      <ChangePasswordSection />
    </div>
  );
}

// ============================================
// CHANGE PASSWORD SECTION
// ============================================

function ChangePasswordSection() {
  const changePassword = useChangePassword();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      await changePassword.mutateAsync({ newPassword });
      toast.success('Password changed successfully');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err?.message || 'Failed to change password');
    }
  };

  return (
    <div className="card">
      <h3 className="text-base font-semibold text-slate-900 mb-4">Change Password</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <FormField label="New Password">
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="input"
            required
            minLength={8}
            placeholder="Min. 8 characters"
            autoComplete="new-password"
          />
        </FormField>

        <FormField label="Confirm New Password">
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="input"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </FormField>

        <div className="flex justify-end pt-4 border-t border-slate-200">
          <button type="submit" disabled={changePassword.isPending} className="btn btn-md btn-primary">
            {changePassword.isPending ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ============================================
// TAB 2: BRANCHES (org_admin only)
// ============================================

const branchColumnHelper = createColumnHelper<Branch>();

function BranchesTab() {
  const { data: branchesData, isLoading } = useBranches();
  const deleteMutation = useDeleteBranch();
  const [showForm, setShowForm] = useState(false);
  const [editBranch, setEditBranch] = useState<Branch | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Branch | null>(null);

  const branches = branchesData?.data || [];

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success('Branch deleted');
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete branch');
    }
  };

  const columns = [
    branchColumnHelper.accessor('name', {
      header: 'Name',
      cell: (info) => <span className="font-medium text-slate-900">{info.getValue()}</span>,
    }),
    branchColumnHelper.accessor('code', {
      header: 'Code',
      cell: (info) => (
        <span className="text-sm text-slate-600">{info.getValue() || '—'}</span>
      ),
    }),
    branchColumnHelper.accessor((row) => [row.city, row.state].filter(Boolean).join(', '), {
      id: 'location',
      header: 'Location',
      cell: (info) => (
        <span className="text-sm text-slate-600">{info.getValue() || '—'}</span>
      ),
    }),
    branchColumnHelper.accessor((row) => row._count?.buildings ?? 0, {
      id: 'buildings',
      header: 'Buildings',
      cell: (info) => <span className="text-sm text-slate-600">{info.getValue()}</span>,
    }),
    branchColumnHelper.accessor((row) => row._count?.users ?? 0, {
      id: 'users',
      header: 'Users',
      cell: (info) => <span className="text-sm text-slate-600">{info.getValue()}</span>,
    }),
    branchColumnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => { setEditBranch(row.original); setShowForm(true); }}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-700"
            title="Edit branch"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteTarget(row.original)}
            className="p-1.5 rounded hover:bg-red-50 text-slate-500 hover:text-red-600"
            title="Delete branch"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    }),
  ];

  if (isLoading) return <LoadingSpinner size="lg" message="Loading branches..." />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          {branches.length} {branches.length === 1 ? 'branch' : 'branches'}
        </p>
        <button
          onClick={() => { setEditBranch(null); setShowForm(true); }}
          className="btn btn-md btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Branch
        </button>
      </div>

      <DataTable columns={columns} data={branches} emptyMessage="No branches yet" />

      <BranchFormDialog
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditBranch(null); }}
        branch={editBranch}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Branch"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

// ============================================
// TAB 3: ORGANIZATION (org_admin only)
// ============================================

function OrganizationTab() {
  const { user } = useAuth();
  const orgId = user?.organizationId || '';
  const { data: org, isLoading: orgLoading } = useOrganization(orgId);
  const { data: stats, isLoading: statsLoading } = useOrganizationStats(orgId);
  const updateMutation = useUpdateOrganization();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrganizationSchemaType>({
    resolver: zodResolver(organizationSchema),
    values: org ? { name: org.name } : undefined,
  });

  if (orgLoading || statsLoading) {
    return <LoadingSpinner size="lg" message="Loading organization..." />;
  }

  if (!org) return null;

  const onSubmit = async (formData: OrganizationSchemaType) => {
    try {
      await updateMutation.mutateAsync({ id: orgId, data: { name: formData.name } });
      toast.success('Organization updated');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update organization');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Org Info Card */}
      <div className="card">
        <h3 className="text-base font-semibold text-slate-900 mb-4">Organization Details</h3>
        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500 w-24">Slug:</span>
            <span className="text-slate-900 font-mono text-sm">{org.slug}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Organization Name" error={errors.name?.message} required>
            <input {...register('name')} className="input" />
          </FormField>

          <div className="flex justify-end pt-4 border-t border-slate-200">
            <button type="submit" disabled={updateMutation.isPending} className="btn btn-md btn-primary">
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard label="Buildings" value={stats.totalBuildings} />
          <StatCard label="Branches" value={stats.totalBranches} />
          <StatCard label="Users" value={stats.totalUsers} />
          <StatCard label="Assessments" value={stats.totalAssessments} />
          <StatCard label="Avg FCI" value={stats.averageFci != null ? `${(stats.averageFci * 100).toFixed(1)}%` : '—'} />
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card text-center">
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  );
}

// ============================================
// TAB 4: AUDIT LOG (org_admin only)
// ============================================

const ACTION_OPTIONS = [
  { value: '', label: 'All Actions' },
  { value: 'auth.login', label: 'Login' },
  { value: 'auth.login_failed', label: 'Login Failed' },
  { value: 'auth.password_changed', label: 'Password Changed' },
  { value: 'auth.password_reset_requested', label: 'Password Reset' },
  { value: 'building.create', label: 'Building Created' },
  { value: 'building.update', label: 'Building Updated' },
  { value: 'building.delete', label: 'Building Deleted' },
  { value: 'assessment.create', label: 'Assessment Created' },
  { value: 'assessment.update', label: 'Assessment Updated' },
  { value: 'user.create', label: 'User Created' },
  { value: 'user.update', label: 'User Updated' },
  { value: 'deficiency.create', label: 'Deficiency Created' },
  { value: 'deficiency.update', label: 'Deficiency Updated' },
];

const ENTITY_TYPE_OPTIONS = [
  { value: '', label: 'All Entities' },
  { value: 'building', label: 'Building' },
  { value: 'assessment', label: 'Assessment' },
  { value: 'user', label: 'User' },
  { value: 'branch', label: 'Branch' },
  { value: 'deficiency', label: 'Deficiency' },
  { value: 'photo', label: 'Photo' },
];

const auditColumnHelper = createColumnHelper<AuditLog>();

function actionBadgeColor(action: string): string {
  if (action.includes('login_failed')) return 'bg-red-100 text-red-700';
  if (action.includes('login')) return 'bg-green-100 text-green-700';
  if (action.includes('delete')) return 'bg-red-100 text-red-700';
  if (action.includes('create')) return 'bg-blue-100 text-blue-700';
  if (action.includes('update')) return 'bg-amber-100 text-amber-700';
  if (action.includes('password')) return 'bg-purple-100 text-purple-700';
  return 'bg-slate-100 text-slate-700';
}

function AuditLogTab() {
  const [filters, setFilters] = useState<AuditLogFilters>({ page: 1, limit: 20 });
  const { data, isLoading } = useAuditLogs(filters);

  const logs = data?.data || [];
  const meta = data?.meta;

  const columns = [
    auditColumnHelper.accessor('createdAt', {
      header: 'Timestamp',
      cell: (info) => (
        <span className="text-sm text-slate-600 whitespace-nowrap">
          {new Date(info.getValue()).toLocaleString()}
        </span>
      ),
    }),
    auditColumnHelper.accessor((row) => {
      if (!row.user) return '—';
      return [row.user.firstName, row.user.lastName].filter(Boolean).join(' ') || row.user.email;
    }, {
      id: 'user',
      header: 'User',
      cell: (info) => <span className="text-sm text-slate-900">{info.getValue()}</span>,
    }),
    auditColumnHelper.accessor('action', {
      header: 'Action',
      cell: (info) => (
        <span className={`badge text-xs ${actionBadgeColor(info.getValue())}`}>
          {info.getValue()}
        </span>
      ),
    }),
    auditColumnHelper.accessor((row) => {
      if (!row.entityType) return '—';
      return row.entityId ? `${row.entityType}:${row.entityId.substring(0, 8)}...` : row.entityType;
    }, {
      id: 'entity',
      header: 'Entity',
      cell: (info) => <span className="text-sm text-slate-600 font-mono">{info.getValue()}</span>,
    }),
    auditColumnHelper.accessor('ipAddress', {
      header: 'IP Address',
      cell: (info) => (
        <span className="text-sm text-slate-500 font-mono">{info.getValue() || '—'}</span>
      ),
    }),
  ];

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="card">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Action</label>
            <select
              className="input"
              value={filters.action || ''}
              onChange={(e) => setFilters((f) => ({ ...f, action: e.target.value || undefined, page: 1 }))}
            >
              {ACTION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Entity Type</label>
            <select
              className="input"
              value={filters.entityType || ''}
              onChange={(e) => setFilters((f) => ({ ...f, entityType: e.target.value || undefined, page: 1 }))}
            >
              {ENTITY_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Start Date</label>
            <input
              type="date"
              className="input"
              value={filters.startDate || ''}
              onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value || undefined, page: 1 }))}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">End Date</label>
            <input
              type="date"
              className="input"
              value={filters.endDate || ''}
              onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value || undefined, page: 1 }))}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner size="lg" message="Loading audit logs..." />
      ) : (
        <>
          <DataTable columns={columns} data={logs} emptyMessage="No audit logs found" />
          {meta && meta.totalPages > 1 && (
            <Pagination
              page={meta.page}
              totalPages={meta.totalPages}
              onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
            />
          )}
        </>
      )}
    </div>
  );
}

// ============================================
// MAIN PAGE
// ============================================

const ALL_TABS: { key: Tab; label: string; icon: React.ComponentType<{ className?: string }>; adminOnly?: boolean }[] = [
  { key: 'profile', label: 'Profile', icon: UserCircle },
  { key: 'branches', label: 'Branches', icon: GitBranch, adminOnly: true },
  { key: 'organization', label: 'Organization', icon: Building2, adminOnly: true },
  { key: 'audit', label: 'Audit Log', icon: Shield, adminOnly: true },
];

export default function SettingsPage() {
  const { isOrgAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const tabs = ALL_TABS.filter((t) => !t.adminOnly || isOrgAdmin());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-display-sm font-display text-slate-900 mb-1">Settings</h1>
        <p className="text-slate-600">Manage your profile and organization settings.</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-6 -mb-px overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-1 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
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
      {activeTab === 'profile' && <ProfileTab />}
      {activeTab === 'branches' && isOrgAdmin() && <BranchesTab />}
      {activeTab === 'organization' && isOrgAdmin() && <OrganizationTab />}
      {activeTab === 'audit' && isOrgAdmin() && <AuditLogTab />}
    </div>
  );
}
