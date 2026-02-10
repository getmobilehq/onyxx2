import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ChevronRight,
  CheckCircle2,
  Circle,
  MinusCircle,
  Clock,
  Search,
  Plus,
  SkipForward,
  Save,
  ArrowRight,
  Send,
  AlertTriangle,
  Trash2,
  Pencil,
  Camera,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAssessment, useSubmitAssessment } from '../api/assessments.api';
import { useAssessmentElements, useUpdateElement } from '../api/elements.api';
import {
  useElementDeficiencies,
  useCreateDeficiency,
  useUpdateDeficiency,
  useDeleteDeficiency,
} from '../api/deficiencies.api';
import { useElementPhotos, useDeletePhoto } from '../../photos/api/photos.api';
import {
  elementAssessmentSchema,
  type ElementAssessmentSchemaType,
} from '../validations/element-assessment.schema';
import FormField from '../../../components/ui/FormField';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import DeficiencyFormDialog from '../../../components/ui/DeficiencyFormDialog';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import PhotoUploader from '../../../components/ui/PhotoUploader';
import PhotoGallery from '../../../components/ui/PhotoGallery';
import SeverityBadge from '../../../components/ui/SeverityBadge';
import PriorityBadge from '../../../components/ui/PriorityBadge';
import { useNetworkStore } from '../../../stores/network.store';
import type { AssessmentElement, Deficiency, DeficiencySeverity, DeficiencyPriority } from '../../../types';
import type { DeficiencySchemaType } from '../validations/deficiency.schema';

// ============================================
// HELPERS
// ============================================

function getFormDefaults(element: AssessmentElement | null): ElementAssessmentSchemaType {
  if (!element) {
    return {
      conditionRating: undefined,
      conditionNotes: '',
      quantity: undefined,
      unitOfMeasure: '',
      costPerUnit: undefined,
      yearInstalled: undefined,
      lifetimeYears: undefined,
      locationDescription: '',
      floor: '',
      room: '',
      manufacturer: '',
      model: '',
      serialNumber: '',
      assetId: '',
    };
  }
  return {
    conditionRating: element.conditionRating ?? undefined,
    conditionNotes: element.conditionNotes || '',
    quantity: element.quantity ? Number(element.quantity) : undefined,
    unitOfMeasure: element.unitOfMeasure || '',
    costPerUnit: element.costPerUnit ? Number(element.costPerUnit) : undefined,
    yearInstalled: element.yearInstalled ?? undefined,
    lifetimeYears: element.lifetimeYears ?? undefined,
    locationDescription: element.locationDescription || '',
    floor: element.floor || '',
    room: element.room || '',
    manufacturer: element.manufacturer || '',
    model: element.model || '',
    serialNumber: element.serialNumber || '',
    assetId: element.assetId || '',
  };
}

function getRatingColor(rating: number): string {
  switch (rating) {
    case 5: return 'border-emerald-500 bg-emerald-50 text-emerald-700';
    case 4: return 'border-blue-500 bg-blue-50 text-blue-700';
    case 3: return 'border-amber-500 bg-amber-50 text-amber-700';
    case 2: return 'border-orange-500 bg-orange-50 text-orange-700';
    case 1: return 'border-red-500 bg-red-50 text-red-700';
    default: return 'border-slate-200 text-slate-400';
  }
}

const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />;
    case 'in_progress':
      return <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />;
    case 'skipped':
      return <MinusCircle className="w-4 h-4 text-slate-400 flex-shrink-0" />;
    default:
      return <Circle className="w-4 h-4 text-slate-300 flex-shrink-0" />;
  }
}

// ============================================
// MAIN PAGE
// ============================================

export default function ConductAssessmentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { isOnline } = useNetworkStore();
  const { data: assessment, isLoading: assessmentLoading } = useAssessment(id!);
  const { data: elementsData, isLoading: elementsLoading } = useAssessmentElements(id!, { limit: 500 });
  const updateElementMutation = useUpdateElement();
  const submitMutation = useSubmitAssessment();

  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [sidebarFilter, setSidebarFilter] = useState('');
  const [showDeficiencyForm, setShowDeficiencyForm] = useState(false);
  const [editingDeficiency, setEditingDeficiency] = useState<Deficiency | null>(null);
  const [deletingDeficiency, setDeletingDeficiency] = useState<Deficiency | null>(null);

  const elements: AssessmentElement[] = (elementsData as any)?.data || elementsData || [];
  const selectedElement = elements.find((e) => e.id === selectedElementId) || null;

  // Form
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<ElementAssessmentSchemaType>({
    resolver: zodResolver(elementAssessmentSchema),
    defaultValues: getFormDefaults(null),
  });

  const conditionRating = watch('conditionRating');

  // Deficiency & Photo hooks for selected element
  const { data: deficiencies = [] } = useElementDeficiencies(selectedElementId || '');
  const { data: elementPhotos = [] } = useElementPhotos(selectedElementId || '');
  const createDeficiency = useCreateDeficiency();
  const updateDeficiency = useUpdateDeficiency();
  const deleteDeficiency = useDeleteDeficiency();
  const deletePhoto = useDeletePhoto();

  // Redirect if assessment is not in_progress
  useEffect(() => {
    if (assessment && assessment.status !== 'in_progress') {
      toast.error('Assessment must be in progress to conduct');
      navigate(`/assessments/${id}`);
    }
  }, [assessment, id, navigate]);

  // Auto-select first element
  useEffect(() => {
    if (elements.length > 0 && !selectedElementId) {
      const firstPending = elements.find((e) => e.status === 'pending' || e.status === 'in_progress');
      setSelectedElementId(firstPending?.id || elements[0].id);
    }
  }, [elements, selectedElementId]);

  // Reset form when selected element changes
  useEffect(() => {
    if (selectedElement) {
      reset(getFormDefaults(selectedElement));
    }
  }, [selectedElementId, selectedElement, reset]);

  // Filter elements
  const filteredElements = elements.filter((e) => {
    if (!sidebarFilter) return true;
    const search = sidebarFilter.toLowerCase();
    return (
      e.uniformatCode.toLowerCase().includes(search) ||
      (e.uniformatElement?.name || '').toLowerCase().includes(search) ||
      (e.systemGroup || '').toLowerCase().includes(search)
    );
  });

  // Progress
  const completedCount = elements.filter((e) => e.status === 'completed').length;
  const skippedCount = elements.filter((e) => e.status === 'skipped').length;
  const totalCount = elements.length;
  const allDone = totalCount > 0 && completedCount + skippedCount === totalCount;
  const progressPercent = totalCount > 0 ? Math.round(((completedCount + skippedCount) / totalCount) * 100) : 0;

  // Find next pending element
  const findNextElement = useCallback(() => {
    if (!selectedElementId) return null;
    const currentIndex = elements.findIndex((e) => e.id === selectedElementId);
    // Look after current
    for (let i = currentIndex + 1; i < elements.length; i++) {
      if (elements[i].status === 'pending' || elements[i].status === 'in_progress') return elements[i];
    }
    // Wrap around
    for (let i = 0; i < currentIndex; i++) {
      if (elements[i].status === 'pending' || elements[i].status === 'in_progress') return elements[i];
    }
    return null;
  }, [elements, selectedElementId]);

  // Switch element with unsaved check
  const handleSelectElement = (elementId: string) => {
    if (elementId === selectedElementId) return;
    if (isDirty) {
      const confirmed = window.confirm('You have unsaved changes. Discard and switch elements?');
      if (!confirmed) return;
    }
    setSelectedElementId(elementId);
  };

  // Clean form data (remove empty strings)
  const cleanData = (data: ElementAssessmentSchemaType) => {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== '' && value !== undefined) {
        cleaned[key] = value;
      }
    }
    return cleaned;
  };

  // Save & Complete
  const handleSaveAndNext = handleSubmit(async (data) => {
    if (!selectedElementId || !id) return;
    const rating = data.conditionRating;
    if (!rating || rating < 1 || rating > 5) {
      toast.error('Condition rating is required to complete an element');
      return;
    }
    try {
      await updateElementMutation.mutateAsync({
        assessmentId: id,
        elementId: selectedElementId,
        data: { ...cleanData(data), status: 'completed' },
      });
      toast.success('Element saved');
      const next = findNextElement();
      if (next) {
        setSelectedElementId(next.id);
      } else {
        toast.success('All elements have been assessed!');
      }
    } catch {
      toast.error('Failed to save element');
    }
  });

  // Save Draft
  const handleSaveDraft = handleSubmit(async (data) => {
    if (!selectedElementId || !id) return;
    try {
      await updateElementMutation.mutateAsync({
        assessmentId: id,
        elementId: selectedElementId,
        data: { ...cleanData(data), status: 'in_progress' },
      });
      toast.success('Draft saved');
    } catch {
      toast.error('Failed to save draft');
    }
  });

  // Skip
  const handleSkip = async () => {
    if (!selectedElementId || !id) return;
    try {
      await updateElementMutation.mutateAsync({
        assessmentId: id,
        elementId: selectedElementId,
        data: { status: 'skipped' },
      });
      toast.success('Element skipped');
      const next = findNextElement();
      if (next) {
        setSelectedElementId(next.id);
      }
    } catch {
      toast.error('Failed to skip element');
    }
  };

  // Submit assessment
  const handleSubmitAssessment = async () => {
    if (!id) return;
    if (totalCount === 0) {
      toast.error('Cannot submit: no elements have been added to this assessment.');
      return;
    }
    if (completedCount === 0) {
      const confirmed = window.confirm(
        'No elements have been completed yet. Are you sure you want to submit for review?'
      );
      if (!confirmed) return;
    }
    try {
      await submitMutation.mutateAsync(id);
      toast.success('Assessment submitted for review');
      navigate(`/assessments/${id}`);
    } catch {
      toast.error('Failed to submit assessment');
    }
  };

  // Deficiency handlers
  const handleCreateDeficiency = async (data: DeficiencySchemaType) => {
    if (!selectedElementId) return;
    await createDeficiency.mutateAsync({ elementId: selectedElementId, data: data as any });
    toast.success('Deficiency added');
    setShowDeficiencyForm(false);
    setEditingDeficiency(null);
  };

  const handleUpdateDeficiency = async (data: DeficiencySchemaType) => {
    if (!editingDeficiency) return;
    await updateDeficiency.mutateAsync({ id: editingDeficiency.id, data: data as any });
    toast.success('Deficiency updated');
    setShowDeficiencyForm(false);
    setEditingDeficiency(null);
  };

  const handleDeleteDeficiency = async () => {
    if (!deletingDeficiency) return;
    await deleteDeficiency.mutateAsync(deletingDeficiency.id);
    toast.success('Deficiency deleted');
    setDeletingDeficiency(null);
  };

  // Loading states
  if (assessmentLoading || elementsLoading) {
    return <LoadingSpinner size="lg" message="Loading assessment..." />;
  }

  if (!assessment) {
    return <div className="text-red-600 text-sm">Assessment not found.</div>;
  }

  return (
    <div className="space-y-4">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-sm text-slate-500">
        <Link to="/" className="hover:text-slate-700">Dashboard</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/assessments" className="hover:text-slate-700">Assessments</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to={`/assessments/${id}`} className="hover:text-slate-700">{assessment.name}</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-900 font-medium">Conduct</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-display text-slate-900">
            {assessment.name}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {assessment.building?.name} &mdash; {completedCount} of {totalCount} elements completed
          </p>
        </div>
        {allDone && (
          <button
            onClick={handleSubmitAssessment}
            disabled={submitMutation.isPending || !isOnline}
            className="btn btn-md btn-primary flex items-center gap-2"
            title={!isOnline ? 'Requires internet connection' : undefined}
          >
            <Send className="w-4 h-4" />
            {submitMutation.isPending ? 'Submitting...' : 'Submit for Review'}
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-200 rounded-full h-2">
        <div
          className="bg-onyx-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Split panel */}
      {elements.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-slate-500 mb-4">No elements have been added to this assessment yet.</p>
          <Link to={`/assessments/${id}`} className="btn btn-md btn-primary">
            Go to Assessment to Add Elements
          </Link>
        </div>
      ) : (
        <div className="flex border border-slate-200 rounded-lg overflow-hidden bg-white" style={{ height: 'calc(100vh - 16rem)' }}>
          {/* Left sidebar */}
          <div className="w-80 flex-shrink-0 border-r border-slate-200 flex flex-col">
            {/* Search */}
            <div className="p-3 border-b border-slate-200">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search elements..."
                  value={sidebarFilter}
                  onChange={(e) => setSidebarFilter(e.target.value)}
                  className="input pl-9 text-sm w-full"
                />
              </div>
            </div>

            {/* Element list */}
            <div className="flex-1 overflow-y-auto">
              {filteredElements.map((el) => {
                const isActive = el.id === selectedElementId;
                return (
                  <button
                    key={el.id}
                    onClick={() => handleSelectElement(el.id)}
                    className={`w-full text-left px-3 py-2.5 border-b border-slate-100 transition-colors ${
                      isActive
                        ? 'bg-onyx-50 border-l-2 border-l-onyx-600'
                        : 'hover:bg-slate-50 border-l-2 border-l-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <StatusIcon status={el.status} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-semibold text-slate-700">{el.uniformatCode}</span>
                          {el._count && el._count.deficiencies > 0 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                              {el._count.deficiencies}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate">
                          {el.uniformatElement?.name || el.systemGroup}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Sidebar footer */}
            <div className="p-3 border-t border-slate-200 text-xs text-slate-500 text-center">
              {completedCount} completed &middot; {skippedCount} skipped &middot; {totalCount - completedCount - skippedCount} remaining
            </div>
          </div>

          {/* Right panel */}
          <div className="flex-1 overflow-y-auto">
            {selectedElement ? (
              <div className="p-6 space-y-6">
                {/* Element header */}
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm font-mono font-bold text-onyx-600">{selectedElement.uniformatCode}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600">{selectedElement.systemGroup}</span>
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {selectedElement.uniformatElement?.name || selectedElement.systemGroup}
                  </h2>
                </div>

                {/* Condition Rating */}
                <div className="card">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Condition Rating *</h3>
                  <div className="flex items-center gap-3">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setValue('conditionRating', rating, { shouldDirty: true })}
                        className={`w-14 h-14 rounded-lg border-2 text-lg font-bold transition-all ${
                          conditionRating === rating
                            ? getRatingColor(rating)
                            : 'border-slate-200 text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-slate-400 px-1">
                    {RATING_LABELS.slice(1).map((label) => (
                      <span key={label} className="w-14 text-center">{label}</span>
                    ))}
                  </div>
                  {errors.conditionRating && (
                    <p className="mt-1 text-xs text-red-600">{errors.conditionRating.message}</p>
                  )}
                </div>

                {/* Condition Notes */}
                <div className="card">
                  <FormField label="Condition Notes" error={errors.conditionNotes?.message}>
                    <textarea
                      {...register('conditionNotes')}
                      rows={3}
                      className={`input h-auto w-full ${errors.conditionNotes ? 'border-red-500' : ''}`}
                      placeholder="Observations about the element's condition..."
                    />
                  </FormField>
                </div>

                {/* Quantity & Financial */}
                <div className="card">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Quantity & Financial</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FormField
                      label="Quantity"
                      error={errors.quantity?.message}
                      type="number"
                      registration={register('quantity', { valueAsNumber: true })}
                      placeholder="0"
                    />
                    <FormField
                      label="Unit of Measure"
                      error={errors.unitOfMeasure?.message}
                      registration={register('unitOfMeasure')}
                      placeholder="e.g., SF, EA"
                    />
                    <FormField
                      label="Cost per Unit ($)"
                      error={errors.costPerUnit?.message}
                      type="number"
                      registration={register('costPerUnit', { valueAsNumber: true })}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Lifecycle */}
                <div className="card">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Lifecycle</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      label="Year Installed"
                      error={errors.yearInstalled?.message}
                      type="number"
                      registration={register('yearInstalled', { valueAsNumber: true })}
                      placeholder="2010"
                    />
                    <FormField
                      label="Expected Lifetime (years)"
                      error={errors.lifetimeYears?.message}
                      type="number"
                      registration={register('lifetimeYears', { valueAsNumber: true })}
                      placeholder="25"
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="card">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Location</h3>
                  <div className="space-y-4">
                    <FormField
                      label="Location Description"
                      error={errors.locationDescription?.message}
                      registration={register('locationDescription')}
                      placeholder="e.g., Main lobby, east wing"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        label="Floor"
                        error={errors.floor?.message}
                        registration={register('floor')}
                        placeholder="e.g., 1st, Basement"
                      />
                      <FormField
                        label="Room"
                        error={errors.room?.message}
                        registration={register('room')}
                        placeholder="e.g., Room 101"
                      />
                    </div>
                  </div>
                </div>

                {/* Equipment */}
                <div className="card">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Equipment Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      label="Manufacturer"
                      error={errors.manufacturer?.message}
                      registration={register('manufacturer')}
                      placeholder="e.g., Carrier"
                    />
                    <FormField
                      label="Model"
                      error={errors.model?.message}
                      registration={register('model')}
                      placeholder="e.g., 50XC"
                    />
                    <FormField
                      label="Serial Number"
                      error={errors.serialNumber?.message}
                      registration={register('serialNumber')}
                      placeholder=""
                    />
                    <FormField
                      label="Asset ID"
                      error={errors.assetId?.message}
                      registration={register('assetId')}
                      placeholder=""
                    />
                  </div>
                </div>

                {/* Photos */}
                <div className="card">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      Photos
                      {(elementPhotos as any[]).length > 0 && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {(elementPhotos as any[]).length}
                        </span>
                      )}
                    </h3>
                  </div>
                  {!isOnline && (
                    <p className="text-xs text-amber-600 mb-2">Photos require connectivity</p>
                  )}
                  <PhotoUploader
                    parentType="element"
                    parentId={selectedElementId!}
                    disabled={!isOnline}
                  />
                  {(elementPhotos as any[]).length > 0 && (
                    <div className="mt-4">
                      <PhotoGallery
                        photos={elementPhotos as any[]}
                        canEdit
                        onDelete={(photoId) => deletePhoto.mutate(photoId)}
                        isDeleting={deletePhoto.isPending}
                      />
                    </div>
                  )}
                </div>

                {/* Deficiencies */}
                <div className="card">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Deficiencies
                      {(deficiencies as any[]).length > 0 && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                          {(deficiencies as any[]).length}
                        </span>
                      )}
                    </h3>
                    <button
                      onClick={() => { setEditingDeficiency(null); setShowDeficiencyForm(true); }}
                      className="btn btn-sm btn-outline flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Deficiency
                    </button>
                  </div>

                  {(deficiencies as any[]).length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-4">No deficiencies recorded for this element.</p>
                  ) : (
                    <div className="space-y-3">
                      {(deficiencies as Deficiency[]).map((d) => (
                        <div key={d.id} className="border border-slate-200 rounded-lg p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-slate-900">{d.title}</p>
                              {d.description && (
                                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{d.description}</p>
                              )}
                              <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <SeverityBadge severity={d.severity as DeficiencySeverity} />
                                <PriorityBadge priority={d.priority as DeficiencyPriority} />
                                {d.totalCost != null && (
                                  <span className="text-xs text-slate-600 font-medium">{formatCurrency(d.totalCost)}</span>
                                )}
                                {d.targetYear && (
                                  <span className="text-xs text-slate-500">Target: {d.targetYear}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                onClick={() => { setEditingDeficiency(d); setShowDeficiencyForm(true); }}
                                className="p-1.5 hover:bg-slate-100 rounded"
                                title="Edit"
                              >
                                <Pencil className="w-3.5 h-3.5 text-slate-400" />
                              </button>
                              <button
                                onClick={() => setDeletingDeficiency(d)}
                                className="p-1.5 hover:bg-red-50 rounded"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-between pt-2 pb-4 border-t border-slate-200">
                  <button
                    onClick={handleSkip}
                    disabled={updateElementMutation.isPending}
                    className="btn btn-md btn-ghost flex items-center gap-2 text-slate-500"
                  >
                    <SkipForward className="w-4 h-4" /> Skip
                  </button>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleSaveDraft}
                      disabled={updateElementMutation.isPending}
                      className="btn btn-md btn-outline flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {updateElementMutation.isPending ? 'Saving...' : 'Save Draft'}
                    </button>
                    <button
                      onClick={handleSaveAndNext}
                      disabled={updateElementMutation.isPending}
                      className="btn btn-md btn-primary flex items-center gap-2"
                    >
                      {updateElementMutation.isPending ? 'Saving...' : isOnline ? 'Save & Next' : 'Save Offline & Next'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                Select an element from the sidebar to begin assessment.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Submit footer when all done */}
      {allDone && (
        <div className="card flex items-center justify-between">
          <p className="text-sm text-emerald-600 font-medium">
            All {totalCount} elements have been assessed. {isOnline ? 'Ready to submit!' : 'Connect to internet to submit.'}
          </p>
          <button
            onClick={handleSubmitAssessment}
            disabled={submitMutation.isPending || !isOnline}
            className="btn btn-md btn-primary flex items-center gap-2"
            title={!isOnline ? 'Requires internet connection' : undefined}
          >
            <Send className="w-4 h-4" />
            {submitMutation.isPending ? 'Submitting...' : 'Submit for Review'}
          </button>
        </div>
      )}

      {/* Deficiency Form Dialog */}
      <DeficiencyFormDialog
        isOpen={showDeficiencyForm}
        onClose={() => { setShowDeficiencyForm(false); setEditingDeficiency(null); }}
        onSubmit={editingDeficiency ? handleUpdateDeficiency : handleCreateDeficiency}
        deficiency={editingDeficiency}
        isLoading={createDeficiency.isPending || updateDeficiency.isPending}
      />

      {/* Delete Deficiency Confirm */}
      <ConfirmDialog
        isOpen={!!deletingDeficiency}
        onClose={() => setDeletingDeficiency(null)}
        onConfirm={handleDeleteDeficiency}
        title="Delete Deficiency"
        message={`Are you sure you want to delete "${deletingDeficiency?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isLoading={deleteDeficiency.isPending}
      />
    </div>
  );
}
