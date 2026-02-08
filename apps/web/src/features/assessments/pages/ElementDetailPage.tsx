import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Plus, Pencil, Trash2, Layers } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAssessment } from '../api/assessments.api';
import { useAssessmentElements } from '../api/elements.api';
import {
  useElementDeficiencies,
  useCreateDeficiency,
  useUpdateDeficiency,
  useDeleteDeficiency,
} from '../api/deficiencies.api';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import ConditionBadge from '../../../components/ui/ConditionBadge';
import SeverityBadge from '../../../components/ui/SeverityBadge';
import PriorityBadge from '../../../components/ui/PriorityBadge';
import StatusBadge from '../../../components/ui/StatusBadge';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import DeficiencyFormDialog from '../../../components/ui/DeficiencyFormDialog';
import type { Deficiency, DeficiencyFormData } from '../../../types';

function formatCurrency(value: number | null | undefined): string {
  if (value == null) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export default function ElementDetailPage() {
  const { assessmentId, elementId } = useParams<{
    assessmentId: string;
    elementId: string;
  }>();
  const [showDeficiencyForm, setShowDeficiencyForm] = useState(false);
  const [selectedDeficiency, setSelectedDeficiency] = useState<Deficiency | null>(null);
  const [deficiencyToDelete, setDeficiencyToDelete] = useState<Deficiency | null>(null);

  // Fetch assessment for breadcrumbs
  const { data: assessment } = useAssessment(assessmentId!);

  // Fetch element from the assessment's element list (no individual GET endpoint)
  const { data: elementsData, isLoading: elementsLoading } = useAssessmentElements(assessmentId!, {
    limit: 200,
  });

  const element = useMemo(() => {
    return elementsData?.data.find((e) => e.id === elementId) || null;
  }, [elementsData, elementId]);

  // Fetch deficiencies for this element
  const { data: deficiencies, isLoading: deficienciesLoading } =
    useElementDeficiencies(elementId!);

  const createMutation = useCreateDeficiency();
  const updateMutation = useUpdateDeficiency();
  const deleteMutation = useDeleteDeficiency();

  const handleCreateDeficiency = async (data: DeficiencyFormData) => {
    try {
      await createMutation.mutateAsync({ elementId: elementId!, data });
      toast.success('Deficiency created');
      setShowDeficiencyForm(false);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create deficiency');
    }
  };

  const handleUpdateDeficiency = async (data: DeficiencyFormData) => {
    if (!selectedDeficiency) return;
    try {
      await updateMutation.mutateAsync({ id: selectedDeficiency.id, data });
      toast.success('Deficiency updated');
      setShowDeficiencyForm(false);
      setSelectedDeficiency(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update deficiency');
    }
  };

  const handleDeleteDeficiency = async () => {
    if (!deficiencyToDelete) return;
    try {
      await deleteMutation.mutateAsync(deficiencyToDelete.id);
      toast.success('Deficiency deleted');
      setDeficiencyToDelete(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete deficiency');
    }
  };

  const openEdit = (deficiency: Deficiency) => {
    setSelectedDeficiency(deficiency);
    setShowDeficiencyForm(true);
  };

  const closeForm = () => {
    setShowDeficiencyForm(false);
    setSelectedDeficiency(null);
  };

  if (elementsLoading) {
    return <LoadingSpinner size="lg" message="Loading element..." />;
  }

  if (!element) {
    return (
      <div className="card text-center py-12">
        <p className="text-red-600 font-medium">Element not found</p>
        <Link
          to={`/assessments/${assessmentId}`}
          className="text-sm text-onyx-600 hover:underline mt-2 inline-block"
        >
          Back to assessment
        </Link>
      </div>
    );
  }

  const canEdit = assessment?.status !== 'approved';

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-sm text-slate-500">
        <Link to="/dashboard" className="hover:text-slate-700">
          Dashboard
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/assessments" className="hover:text-slate-700">
          Assessments
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link to={`/assessments/${assessmentId}`} className="hover:text-slate-700">
          {assessment?.name || 'Assessment'}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-900 font-medium">{element.uniformatCode}</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-display-sm font-display text-slate-900">
          {element.uniformatCode}
          {element.uniformatElement?.name && (
            <span className="text-slate-500 font-normal"> — {element.uniformatElement.name}</span>
          )}
        </h1>
        <div className="flex items-center gap-3 mt-2">
          <ConditionBadge rating={element.conditionRating} />
          <StatusBadge status={element.status} />
          <span className="text-sm text-slate-500">{element.systemGroup}</span>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Identity & Lifecycle */}
        <div className="card">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
            Identity & Lifecycle
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-400">Uniformat Code</p>
              <p className="text-sm font-mono font-medium text-slate-900">{element.uniformatCode}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">System Group</p>
              <p className="text-sm font-medium text-slate-900">{element.systemGroup}</p>
            </div>
            {element.systemName && (
              <div>
                <p className="text-xs text-slate-400">System Name</p>
                <p className="text-sm font-medium text-slate-900">{element.systemName}</p>
              </div>
            )}
            {element.lifetimeYears != null && (
              <div>
                <p className="text-xs text-slate-400">Expected Lifetime</p>
                <p className="text-sm font-medium text-slate-900">{element.lifetimeYears} years</p>
              </div>
            )}
            {element.yearInstalled != null && (
              <div>
                <p className="text-xs text-slate-400">Year Installed</p>
                <p className="text-sm font-medium text-slate-900">{element.yearInstalled}</p>
              </div>
            )}
            {element.remainingUsefulLife != null && (
              <div>
                <p className="text-xs text-slate-400">Remaining Useful Life</p>
                <p className="text-sm font-medium text-slate-900">
                  {element.remainingUsefulLife} years
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="card">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
            Location
          </h2>
          <div className="space-y-3">
            {element.locationDescription && (
              <div>
                <p className="text-xs text-slate-400">Description</p>
                <p className="text-sm font-medium text-slate-900">{element.locationDescription}</p>
              </div>
            )}
            {element.floor && (
              <div>
                <p className="text-xs text-slate-400">Floor</p>
                <p className="text-sm font-medium text-slate-900">{element.floor}</p>
              </div>
            )}
            {element.room && (
              <div>
                <p className="text-xs text-slate-400">Room</p>
                <p className="text-sm font-medium text-slate-900">{element.room}</p>
              </div>
            )}
            {!element.locationDescription && !element.floor && !element.room && (
              <p className="text-sm text-slate-400 italic">No location details recorded</p>
            )}
          </div>
        </div>

        {/* Financial */}
        <div className="card">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
            Financial
          </h2>
          <div className="space-y-3">
            {element.quantity != null && (
              <div>
                <p className="text-xs text-slate-400">Quantity</p>
                <p className="text-sm font-medium text-slate-900">
                  {Number(element.quantity).toLocaleString()} {element.unitOfMeasure || ''}
                </p>
              </div>
            )}
            {element.costPerUnit != null && (
              <div>
                <p className="text-xs text-slate-400">Cost per Unit</p>
                <p className="text-sm font-medium text-slate-900">
                  {formatCurrency(element.costPerUnit)}
                </p>
              </div>
            )}
            {element.totalReplacementCost != null && (
              <div>
                <p className="text-xs text-slate-400">Total Replacement Cost</p>
                <p className="text-sm font-medium text-slate-900">
                  {formatCurrency(element.totalReplacementCost)}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs text-slate-400">Renewal Factor</p>
              <p className="text-sm font-medium text-slate-900">{element.renewalFactor}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Condition Notes */}
      {element.conditionNotes && (
        <div className="card">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Condition Notes
          </h2>
          <p className="text-sm text-slate-700">{element.conditionNotes}</p>
        </div>
      )}

      {/* Deficiencies */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Deficiencies ({deficiencies?.length || 0})
          </h2>
          {canEdit && (
            <button
              onClick={() => setShowDeficiencyForm(true)}
              className="btn btn-md btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Deficiency
            </button>
          )}
        </div>

        {deficienciesLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : !deficiencies || deficiencies.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Layers className="w-8 h-8 mx-auto mb-2" />
            <p>No deficiencies recorded</p>
            {canEdit && (
              <p className="text-xs mt-1">
                Click "Add Deficiency" to record an issue with this element
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {deficiencies.map((deficiency) => (
              <div
                key={deficiency.id}
                className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900">{deficiency.title}</h3>
                    {deficiency.description && (
                      <p className="text-sm text-slate-600 mt-1">{deficiency.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <SeverityBadge severity={deficiency.severity} />
                      <PriorityBadge priority={deficiency.priority} />
                      {deficiency.totalCost != null && (
                        <span className="text-sm font-medium text-slate-700">
                          {formatCurrency(deficiency.totalCost)}
                        </span>
                      )}
                      {deficiency.targetYear && (
                        <span className="text-xs text-slate-500">
                          Target: {deficiency.targetYear}
                        </span>
                      )}
                    </div>
                    {deficiency.recommendedAction && (
                      <p className="text-xs text-slate-500 mt-2">
                        <span className="font-medium">Recommended:</span>{' '}
                        {deficiency.recommendedAction}
                      </p>
                    )}
                  </div>
                  {canEdit && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => openEdit(deficiency)}
                        className="btn btn-ghost btn-sm p-1.5"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4 text-slate-500" />
                      </button>
                      <button
                        onClick={() => setDeficiencyToDelete(deficiency)}
                        className="btn btn-ghost btn-sm p-1.5 text-red-600 hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Deficiency Form Dialog */}
      <DeficiencyFormDialog
        isOpen={showDeficiencyForm}
        onClose={closeForm}
        onSubmit={selectedDeficiency ? handleUpdateDeficiency : handleCreateDeficiency}
        deficiency={selectedDeficiency}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deficiencyToDelete}
        onClose={() => setDeficiencyToDelete(null)}
        onConfirm={handleDeleteDeficiency}
        title="Delete Deficiency"
        message={`Are you sure you want to delete "${deficiencyToDelete?.title}"? This action cannot be undone.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
