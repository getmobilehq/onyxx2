import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { updateUserSchema, type UpdateUserSchemaType } from '../validations/user.schema';
import { useUpdateUser, useUserBranches, useAssignUserBranch, useRemoveUserBranch } from '../api/users.api';
import { useBranches } from '../../branches/api/branches.api';
import FormField from '../../../components/ui/FormField';
import type { User } from '../../../types';
import { useState } from 'react';

interface EditUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

const ROLE_OPTIONS = [
  { value: 'viewer', label: 'Viewer' },
  { value: 'assessor', label: 'Assessor' },
  { value: 'branch_manager', label: 'Branch Manager' },
  { value: 'org_admin', label: 'Org Admin' },
];

export default function EditUserDialog({ isOpen, onClose, user }: EditUserDialogProps) {
  const updateMutation = useUpdateUser();
  const assignBranchMutation = useAssignUserBranch();
  const removeBranchMutation = useRemoveUserBranch();
  const { data: userBranches } = useUserBranches(user?.id || '');
  const { data: branchesData } = useBranches();
  const allBranches = branchesData?.data || [];
  const [addBranchId, setAddBranchId] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateUserSchemaType>({
    resolver: zodResolver(updateUserSchema),
  });

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        role: user.role,
        phone: '',
      });
    }
  }, [user, reset]);

  if (!isOpen || !user) return null;

  const branchList = Array.isArray(userBranches) ? userBranches : [];
  const assignedBranchIds = new Set(branchList.map((b: { id: string }) => b.id));
  const availableBranches = allBranches.filter((b) => !assignedBranchIds.has(b.id));

  const onSubmit = async (formData: UpdateUserSchemaType) => {
    try {
      const cleaned: Record<string, unknown> = {};
      if (formData.firstName) cleaned.firstName = formData.firstName;
      if (formData.lastName) cleaned.lastName = formData.lastName;
      if (formData.role) cleaned.role = formData.role;
      if (formData.phone) cleaned.phone = formData.phone;

      await updateMutation.mutateAsync({ id: user.id, data: cleaned as any });
      toast.success('User updated successfully');
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update user');
    }
  };

  const handleAssignBranch = async () => {
    if (!addBranchId) return;
    try {
      await assignBranchMutation.mutateAsync({ userId: user.id, branchId: addBranchId });
      setAddBranchId('');
      toast.success('Branch assigned');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to assign branch');
    }
  };

  const handleRemoveBranch = async (branchId: string) => {
    try {
      await removeBranchMutation.mutateAsync({ userId: user.id, branchId });
      toast.success('Branch removed');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to remove branch');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-user-dialog-title"
        className="relative bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="edit-user-dialog-title" className="text-lg font-semibold text-slate-900">Edit User</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-100" aria-label="Close dialog">
            <X className="w-5 h-5 text-slate-500" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="text-sm text-slate-500 mb-2">{user.email}</div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="First Name" error={errors.firstName?.message}>
              <input {...register('firstName')} className="input" />
            </FormField>
            <FormField label="Last Name" error={errors.lastName?.message}>
              <input {...register('lastName')} className="input" />
            </FormField>
          </div>

          <FormField label="Role" error={errors.role?.message}>
            <select {...register('role')} className="input">
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Phone" error={errors.phone?.message}>
            <input {...register('phone')} className="input" />
          </FormField>

          {/* Branch Assignments */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Branches</label>
            {branchList.length > 0 ? (
              <div className="space-y-1 mb-2">
                {branchList.map((branch: { id: string; name: string }) => (
                  <div key={branch.id} className="flex items-center justify-between bg-slate-50 rounded px-3 py-1.5">
                    <span className="text-sm text-slate-700">{branch.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveBranch(branch.id)}
                      className="p-1 text-slate-400 hover:text-red-500"
                      aria-label={`Remove branch ${branch.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 mb-2">No branches assigned</p>
            )}

            {availableBranches.length > 0 && (
              <div className="flex gap-2">
                <select
                  value={addBranchId}
                  onChange={(e) => setAddBranchId(e.target.value)}
                  className="input flex-1 text-sm"
                >
                  <option value="">Select branch...</option>
                  {availableBranches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAssignBranch}
                  disabled={!addBranchId || assignBranchMutation.isPending}
                  className="btn btn-sm btn-primary"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button type="button" onClick={onClose} className="btn btn-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" disabled={updateMutation.isPending} className="btn btn-md btn-primary">
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
