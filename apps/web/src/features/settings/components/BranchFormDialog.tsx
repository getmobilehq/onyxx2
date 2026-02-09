import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { branchSchema, type BranchSchemaType } from '../validations/branch.schema';
import { useCreateBranch, useUpdateBranch } from '../api/branches.api';
import FormField from '../../../components/ui/FormField';
import type { Branch } from '../../../types';

interface BranchFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  branch?: Branch | null;
}

export default function BranchFormDialog({ isOpen, onClose, branch }: BranchFormDialogProps) {
  const isEdit = !!branch;
  const createMutation = useCreateBranch();
  const updateMutation = useUpdateBranch();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BranchSchemaType>({
    resolver: zodResolver(branchSchema),
  });

  useEffect(() => {
    if (branch) {
      reset({
        name: branch.name,
        code: branch.code || '',
        addressLine1: branch.addressLine1 || '',
        addressLine2: branch.addressLine2 || '',
        city: branch.city || '',
        state: branch.state || '',
        postalCode: branch.postalCode || '',
        country: branch.country || '',
      });
    } else {
      reset({
        name: '',
        code: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
      });
    }
  }, [branch, reset]);

  if (!isOpen) return null;

  const onSubmit = async (formData: BranchSchemaType) => {
    try {
      const cleaned: Record<string, unknown> = { name: formData.name };
      if (formData.code) cleaned.code = formData.code;
      if (formData.addressLine1) cleaned.addressLine1 = formData.addressLine1;
      if (formData.addressLine2) cleaned.addressLine2 = formData.addressLine2;
      if (formData.city) cleaned.city = formData.city;
      if (formData.state) cleaned.state = formData.state;
      if (formData.postalCode) cleaned.postalCode = formData.postalCode;
      if (formData.country) cleaned.country = formData.country;

      if (isEdit) {
        await updateMutation.mutateAsync({ id: branch!.id, data: cleaned as any });
        toast.success('Branch updated successfully');
      } else {
        await createMutation.mutateAsync(cleaned as any);
        toast.success('Branch created successfully');
      }
      onClose();
    } catch (err: any) {
      toast.error(err?.message || `Failed to ${isEdit ? 'update' : 'create'} branch`);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {isEdit ? 'Edit Branch' : 'New Branch'}
          </h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-100">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Branch Name" error={errors.name?.message} required>
            <input {...register('name')} className="input" placeholder="e.g. Downtown Campus" />
          </FormField>

          <FormField label="Code" error={errors.code?.message}>
            <input {...register('code')} className="input" placeholder="e.g. DT-01" />
          </FormField>

          <FormField label="Address Line 1" error={errors.addressLine1?.message}>
            <input {...register('addressLine1')} className="input" placeholder="Street address" />
          </FormField>

          <FormField label="Address Line 2" error={errors.addressLine2?.message}>
            <input {...register('addressLine2')} className="input" placeholder="Suite, unit, etc." />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="City" error={errors.city?.message}>
              <input {...register('city')} className="input" />
            </FormField>
            <FormField label="State / Province" error={errors.state?.message}>
              <input {...register('state')} className="input" />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Postal Code" error={errors.postalCode?.message}>
              <input {...register('postalCode')} className="input" />
            </FormField>
            <FormField label="Country" error={errors.country?.message}>
              <input {...register('country')} className="input" placeholder="e.g. US" />
            </FormField>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button type="button" onClick={onClose} className="btn btn-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" disabled={isPending} className="btn btn-md btn-primary">
              {isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Branch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
