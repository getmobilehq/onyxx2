import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useBuilding, useCreateBuilding, useUpdateBuilding } from '../api/buildings.api';
import { useBranches } from '../../branches/api/branches.api';
import { buildingSchema, type BuildingSchemaType } from '../validations/building.schema';
import FormField from '../../../components/ui/FormField';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

export default function BuildingFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { data: building, isLoading: buildingLoading } = useBuilding(id || '');
  const { data: branchData } = useBranches();
  const createMutation = useCreateBuilding();
  const updateMutation = useUpdateBuilding();

  const branches = branchData?.data || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BuildingSchemaType>({
    resolver: zodResolver(buildingSchema),
    defaultValues: {
      name: '',
      branchId: '',
      code: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'USA',
      buildingType: '',
      description: '',
    },
  });

  // Populate form on edit
  useEffect(() => {
    if (isEdit && building) {
      reset({
        name: building.name || '',
        branchId: building.branchId || '',
        code: building.code || '',
        addressLine1: building.addressLine1 || '',
        addressLine2: building.addressLine2 || '',
        city: building.city || '',
        state: building.state || '',
        postalCode: building.postalCode || '',
        country: building.country || 'USA',
        buildingType: building.buildingType || '',
        yearBuilt: building.yearBuilt || ('' as any),
        numFloors: building.numFloors || ('' as any),
        grossSquareFeet: building.grossSquareFeet ? Number(building.grossSquareFeet) : ('' as any),
        currentReplacementValue: building.currentReplacementValue
          ? Number(building.currentReplacementValue)
          : ('' as any),
        description: building.description || '',
      });
    }
  }, [isEdit, building, reset]);

  const onSubmit = async (data: BuildingSchemaType) => {
    // Clean up empty strings to undefined
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value === '' || value === undefined) continue;
      cleaned[key] = value;
    }

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id, data: cleaned as any });
        toast.success('Building updated successfully');
        navigate(`/buildings/${id}`);
      } else {
        const result = await createMutation.mutateAsync(cleaned as any);
        toast.success('Building created successfully');
        navigate(`/buildings/${result.id}`);
      }
    } catch (err: any) {
      toast.error(err?.message || `Failed to ${isEdit ? 'update' : 'create'} building`);
    }
  };

  if (isEdit && buildingLoading) {
    return <LoadingSpinner size="lg" message="Loading building..." />;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-sm text-slate-500">
        <Link to="/dashboard" className="hover:text-slate-700">Dashboard</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/buildings" className="hover:text-slate-700">Buildings</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-900 font-medium">
          {isEdit ? 'Edit Building' : 'New Building'}
        </span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-display-sm font-display text-slate-900">
          {isEdit ? 'Edit Building' : 'New Building'}
        </h1>
        <p className="text-slate-600 mt-1">
          {isEdit ? 'Update building information' : 'Add a new building to your portfolio'}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Basic Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Building Name"
              required
              error={errors.name?.message}
              registration={register('name')}
              placeholder="e.g., Main Office Building"
            />
            <FormField label="Branch" required error={errors.branchId?.message}>
              <select
                {...register('branchId')}
                className={`input ${errors.branchId ? 'border-red-500' : ''}`}
              >
                <option value="">Select a branch...</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </FormField>
            <FormField
              label="Code"
              error={errors.code?.message}
              registration={register('code')}
              placeholder="e.g., BLDG-001"
            />
            <FormField
              label="Building Type"
              error={errors.buildingType?.message}
              registration={register('buildingType')}
              placeholder="e.g., Office, School, Hospital"
            />
          </div>
        </div>

        {/* Address */}
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Address</h2>
          <div className="grid grid-cols-1 gap-4">
            <FormField
              label="Address Line 1"
              error={errors.addressLine1?.message}
              registration={register('addressLine1')}
              placeholder="Street address"
            />
            <FormField
              label="Address Line 2"
              error={errors.addressLine2?.message}
              registration={register('addressLine2')}
              placeholder="Suite, floor, etc."
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <FormField
              label="City"
              error={errors.city?.message}
              registration={register('city')}
            />
            <FormField
              label="State"
              error={errors.state?.message}
              registration={register('state')}
            />
            <FormField
              label="Postal Code"
              error={errors.postalCode?.message}
              registration={register('postalCode')}
            />
            <FormField
              label="Country"
              error={errors.country?.message}
              registration={register('country')}
            />
          </div>
        </div>

        {/* Details */}
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Building Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Year Built"
              type="number"
              error={errors.yearBuilt?.message}
              registration={register('yearBuilt')}
              placeholder="e.g., 1995"
            />
            <FormField
              label="Number of Floors"
              type="number"
              error={errors.numFloors?.message}
              registration={register('numFloors')}
              placeholder="e.g., 3"
            />
            <FormField
              label="Gross Square Feet"
              type="number"
              error={errors.grossSquareFeet?.message}
              registration={register('grossSquareFeet')}
              placeholder="e.g., 50000"
            />
            <FormField
              label="Current Replacement Value ($)"
              type="number"
              error={errors.currentReplacementValue?.message}
              registration={register('currentReplacementValue')}
              placeholder="e.g., 5000000"
            />
          </div>
          <FormField label="Description" error={errors.description?.message}>
            <textarea
              {...register('description')}
              rows={3}
              className={`input h-auto ${errors.description ? 'border-red-500' : ''}`}
              placeholder="Optional description of the building..."
            />
          </FormField>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(isEdit ? `/buildings/${id}` : '/buildings')}
            className="btn btn-md btn-outline"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
            className="btn btn-md btn-primary"
          >
            {isSubmitting || createMutation.isPending || updateMutation.isPending
              ? (isEdit ? 'Updating...' : 'Creating...')
              : (isEdit ? 'Update Building' : 'Create Building')}
          </button>
        </div>
      </form>
    </div>
  );
}
