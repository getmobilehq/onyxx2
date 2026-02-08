import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, AlertTriangle } from 'lucide-react';
import {
  deficiencySchema,
  type DeficiencySchemaType,
} from '../../features/assessments/validations/deficiency.schema';
import FormField from './FormField';
import type { Deficiency } from '../../types';

interface DeficiencyFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DeficiencySchemaType) => Promise<void>;
  deficiency?: Deficiency | null;
  isLoading?: boolean;
}

export default function DeficiencyFormDialog({
  isOpen,
  onClose,
  onSubmit,
  deficiency,
  isLoading,
}: DeficiencyFormDialogProps) {
  const isEdit = !!deficiency;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DeficiencySchemaType>({
    resolver: zodResolver(deficiencySchema),
    defaultValues: {
      title: '',
      description: '',
      severity: 'moderate',
      priority: 'medium_term',
      estimatedCost: undefined,
      quantity: undefined,
      unitOfMeasure: '',
      targetYear: undefined,
      recommendedAction: '',
    },
  });

  useEffect(() => {
    if (isEdit && deficiency) {
      reset({
        title: deficiency.title || '',
        description: deficiency.description || '',
        severity: deficiency.severity,
        priority: deficiency.priority,
        estimatedCost: deficiency.estimatedCost ?? undefined,
        quantity: deficiency.quantity ?? undefined,
        unitOfMeasure: deficiency.unitOfMeasure || '',
        targetYear: deficiency.targetYear ?? undefined,
        recommendedAction: deficiency.recommendedAction || '',
      });
    } else if (!isEdit) {
      reset({
        title: '',
        description: '',
        severity: 'moderate',
        priority: 'medium_term',
        estimatedCost: undefined,
        quantity: undefined,
        unitOfMeasure: '',
        targetYear: undefined,
        recommendedAction: '',
      });
    }
  }, [isEdit, deficiency, reset]);

  const handleFormSubmit = async (data: DeficiencySchemaType) => {
    await onSubmit(data);
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-amber-100">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">
              {isEdit ? 'Edit Deficiency' : 'Add Deficiency'}
            </h3>
          </div>
          <button onClick={handleClose} className="p-1 hover:bg-slate-100 rounded" disabled={isLoading}>
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            <FormField
              label="Title"
              error={errors.title?.message}
              required
              registration={register('title')}
              placeholder="Brief description of the deficiency"
            />

            <FormField label="Description" error={errors.description?.message}>
              <textarea
                {...register('description')}
                rows={2}
                className={`input h-auto w-full ${errors.description ? 'border-red-500' : ''}`}
                placeholder="Detailed description..."
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Severity" error={errors.severity?.message} required>
                <select {...register('severity')} className="input w-full">
                  <option value="minor">Minor</option>
                  <option value="moderate">Moderate</option>
                  <option value="major">Major</option>
                  <option value="critical">Critical</option>
                </select>
              </FormField>

              <FormField label="Priority" error={errors.priority?.message} required>
                <select {...register('priority')} className="input w-full">
                  <option value="immediate">Immediate (0-1 yr)</option>
                  <option value="short_term">Short Term (1-3 yr)</option>
                  <option value="medium_term">Medium Term (3-5 yr)</option>
                  <option value="long_term">Long Term (5-10 yr)</option>
                </select>
              </FormField>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                label="Estimated Cost ($)"
                error={errors.estimatedCost?.message}
                type="number"
                registration={register('estimatedCost', { valueAsNumber: true })}
                placeholder="0.00"
              />

              <FormField
                label="Quantity"
                error={errors.quantity?.message}
                type="number"
                registration={register('quantity', { valueAsNumber: true })}
                placeholder="1"
              />

              <FormField
                label="Unit"
                error={errors.unitOfMeasure?.message}
                registration={register('unitOfMeasure')}
                placeholder="e.g., SF, EA"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Target Year"
                error={errors.targetYear?.message}
                type="number"
                registration={register('targetYear', { valueAsNumber: true })}
                placeholder="2026"
              />
              <div />
            </div>

            <FormField label="Recommended Action" error={errors.recommendedAction?.message}>
              <textarea
                {...register('recommendedAction')}
                rows={2}
                className={`input h-auto w-full ${errors.recommendedAction ? 'border-red-500' : ''}`}
                placeholder="Recommended repair or replacement action..."
              />
            </FormField>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-slate-200">
          <button onClick={handleClose} className="btn btn-md btn-outline" disabled={isLoading}>
            Cancel
          </button>
          <button
            onClick={handleSubmit(handleFormSubmit)}
            className="btn btn-md btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : isEdit ? 'Update Deficiency' : 'Add Deficiency'}
          </button>
        </div>
      </div>
    </div>
  );
}
