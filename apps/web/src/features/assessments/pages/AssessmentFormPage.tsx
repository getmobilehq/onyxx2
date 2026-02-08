import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAssessment, useCreateAssessment, useUpdateAssessment } from '../api/assessments.api';
import { useBuildings } from '../../buildings/api/buildings.api';
import { assessmentSchema, type AssessmentSchemaType } from '../validations/assessment.schema';
import FormField from '../../../components/ui/FormField';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

export default function AssessmentFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { data: assessment, isLoading: assessmentLoading } = useAssessment(id || '');
  const { data: buildingData } = useBuildings({ limit: 100 });
  const createMutation = useCreateAssessment();
  const updateMutation = useUpdateAssessment();

  const buildings = buildingData?.data || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AssessmentSchemaType>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: {
      name: '',
      buildingId: '',
      description: '',
      targetCompletionDate: '',
    },
  });

  // Populate form on edit
  useEffect(() => {
    if (isEdit && assessment) {
      reset({
        name: assessment.name || '',
        buildingId: assessment.buildingId || '',
        description: assessment.description || '',
        targetCompletionDate: assessment.targetCompletionDate
          ? assessment.targetCompletionDate.slice(0, 10)
          : '',
      });
    }
  }, [isEdit, assessment, reset]);

  const onSubmit = async (data: AssessmentSchemaType) => {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value === '' || value === undefined) continue;
      cleaned[key] = value;
    }

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id, data: cleaned as any });
        toast.success('Assessment updated successfully');
        navigate(`/assessments/${id}`);
      } else {
        const result = await createMutation.mutateAsync(cleaned as any);
        toast.success('Assessment created successfully');
        navigate(`/assessments/${result.id}`);
      }
    } catch (err: any) {
      toast.error(err?.message || `Failed to ${isEdit ? 'update' : 'create'} assessment`);
    }
  };

  if (isEdit && assessmentLoading) {
    return <LoadingSpinner size="lg" message="Loading assessment..." />;
  }

  if (isEdit && assessment && assessment.status !== 'draft') {
    return (
      <div className="space-y-6 max-w-3xl">
        <nav className="flex items-center gap-1 text-sm text-slate-500">
          <Link to="/dashboard" className="hover:text-slate-700">Dashboard</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/assessments" className="hover:text-slate-700">Assessments</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-900 font-medium">Edit Assessment</span>
        </nav>
        <div className="card text-center py-12">
          <p className="text-slate-600">Only draft assessments can be edited.</p>
          <button
            onClick={() => navigate(`/assessments/${id}`)}
            className="btn btn-md btn-primary mt-4"
          >
            Back to Assessment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-sm text-slate-500">
        <Link to="/dashboard" className="hover:text-slate-700">Dashboard</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/assessments" className="hover:text-slate-700">Assessments</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-900 font-medium">
          {isEdit ? 'Edit Assessment' : 'New Assessment'}
        </span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-display-sm font-display text-slate-900">
          {isEdit ? 'Edit Assessment' : 'New Assessment'}
        </h1>
        <p className="text-slate-600 mt-1">
          {isEdit ? 'Update assessment details' : 'Create a new facility condition assessment'}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Assessment Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Assessment Name"
              required
              error={errors.name?.message}
              registration={register('name')}
              placeholder="e.g., Annual FCA 2025"
            />
            <FormField label="Building" required error={errors.buildingId?.message}>
              <select
                {...register('buildingId')}
                className={`input ${errors.buildingId ? 'border-red-500' : ''}`}
                disabled={isEdit}
              >
                <option value="">Select a building...</option>
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </FormField>
          </div>

          <FormField
            label="Target Completion Date"
            type="date"
            error={errors.targetCompletionDate?.message}
            registration={register('targetCompletionDate')}
          />

          <FormField label="Description" error={errors.description?.message}>
            <textarea
              {...register('description')}
              rows={3}
              className={`input h-auto ${errors.description ? 'border-red-500' : ''}`}
              placeholder="Optional description of the assessment scope and objectives..."
            />
          </FormField>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(isEdit ? `/assessments/${id}` : '/assessments')}
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
              : (isEdit ? 'Update Assessment' : 'Create Assessment')}
          </button>
        </div>
      </form>
    </div>
  );
}
