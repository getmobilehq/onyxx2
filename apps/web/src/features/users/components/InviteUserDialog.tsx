import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { inviteUserSchema, type InviteUserSchemaType } from '../validations/user.schema';
import { useInviteUser } from '../api/users.api';
import { useBranches } from '../../branches/api/branches.api';
import FormField from '../../../components/ui/FormField';

interface InviteUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const ROLE_OPTIONS = [
  { value: 'viewer', label: 'Viewer' },
  { value: 'assessor', label: 'Assessor' },
  { value: 'branch_manager', label: 'Branch Manager' },
  { value: 'org_admin', label: 'Org Admin' },
];

export default function InviteUserDialog({ isOpen, onClose }: InviteUserDialogProps) {
  const inviteMutation = useInviteUser();
  const { data: branchesData } = useBranches();
  const branches = branchesData?.data || [];
  const [selectedBranchIds, setSelectedBranchIds] = useState<Set<string>>(new Set());

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteUserSchemaType>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: { role: 'viewer' },
  });

  if (!isOpen) return null;

  const toggleBranch = (branchId: string) => {
    setSelectedBranchIds((prev) => {
      const next = new Set(prev);
      if (next.has(branchId)) {
        next.delete(branchId);
      } else {
        next.add(branchId);
      }
      return next;
    });
  };

  const onSubmit = async (formData: InviteUserSchemaType) => {
    try {
      const branchIds = Array.from(selectedBranchIds);

      const cleaned: Record<string, unknown> = { email: formData.email, role: formData.role };
      if (formData.firstName) cleaned.firstName = formData.firstName;
      if (formData.lastName) cleaned.lastName = formData.lastName;
      if (formData.phone) cleaned.phone = formData.phone;
      if (branchIds.length) cleaned.branchIds = branchIds;

      await inviteMutation.mutateAsync(cleaned as any);
      toast.success('User invited successfully');
      reset();
      setSelectedBranchIds(new Set());
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to invite user';
      toast.error(message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-dialog-title"
        className="relative bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="invite-dialog-title" className="text-lg font-semibold text-slate-900">Invite User</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-100" aria-label="Close dialog">
            <X className="w-5 h-5 text-slate-500" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Email" error={errors.email?.message} required>
            <input {...register('email')} type="email" className="input" placeholder="user@example.com" />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="First Name" error={errors.firstName?.message}>
              <input {...register('firstName')} className="input" placeholder="John" />
            </FormField>
            <FormField label="Last Name" error={errors.lastName?.message}>
              <input {...register('lastName')} className="input" placeholder="Doe" />
            </FormField>
          </div>

          <FormField label="Role" error={errors.role?.message} required>
            <select {...register('role')} className="input">
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Phone" error={errors.phone?.message}>
            <input {...register('phone')} className="input" placeholder="+1 (555) 000-0000" />
          </FormField>

          {branches.length > 0 && (
            <fieldset>
              <legend className="block text-sm font-medium text-slate-700 mb-2">
                Assign to Branches
              </legend>
              <div className="space-y-2 max-h-32 overflow-y-auto border border-slate-200 rounded-md p-3">
                {branches.map((branch) => (
                  <label key={branch.id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedBranchIds.has(branch.id)}
                      onChange={() => toggleBranch(branch.id)}
                      className="rounded"
                    />
                    <span className="text-slate-700">{branch.name}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button type="button" onClick={onClose} className="btn btn-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" disabled={inviteMutation.isPending} className="btn btn-md btn-primary">
              {inviteMutation.isPending ? 'Inviting...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
