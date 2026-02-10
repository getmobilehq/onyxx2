import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronRight, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../hooks/useAuth';
import {
  useDeficiency,
  useUpdateDeficiency,
  useDeleteDeficiency,
} from '../../assessments/api/deficiencies.api';
import { useDeficiencyPhotos, useDeletePhoto } from '../../photos/api/photos.api';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import SeverityBadge from '../../../components/ui/SeverityBadge';
import PriorityBadge from '../../../components/ui/PriorityBadge';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import DeficiencyFormDialog from '../../../components/ui/DeficiencyFormDialog';
import PhotoUploader from '../../../components/ui/PhotoUploader';
import PhotoGallery from '../../../components/ui/PhotoGallery';
import { formatDate } from '../../../lib/date-utils';
import type { DeficiencyFormData } from '../../../types';

function formatCurrency(value: number | null | undefined): string {
  if (value == null) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export default function DeficiencyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isViewer, canEditAssessments } = useAuth();
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: deficiency, isLoading } = useDeficiency(id!);
  const { data: photos } = useDeficiencyPhotos(id!);
  const updateMutation = useUpdateDeficiency();
  const deleteMutation = useDeleteDeficiency();
  const deletePhotoMutation = useDeletePhoto();

  const handleUpdate = async (data: DeficiencyFormData) => {
    try {
      await updateMutation.mutateAsync({ id: id!, data });
      toast.success('Deficiency updated');
      setShowEditForm(false);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update deficiency');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(id!);
      toast.success('Deficiency deleted');
      navigate('/deficiencies');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete deficiency');
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" message="Loading deficiency..." />;
  }

  if (!deficiency) {
    return (
      <div className="card text-center py-12">
        <p className="text-red-600 font-medium">Deficiency not found</p>
        <Link
          to="/deficiencies"
          className="text-sm text-onyx-600 hover:underline mt-2 inline-block"
        >
          Back to deficiencies
        </Link>
      </div>
    );
  }

  const assessment = deficiency.assessmentElement?.assessment;
  const building = (assessment as any)?.building;
  const element = deficiency.assessmentElement;

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-sm text-slate-500">
        <Link to="/dashboard" className="hover:text-slate-700">
          Dashboard
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/deficiencies" className="hover:text-slate-700">
          Deficiencies
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-900 font-medium">{deficiency.title}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-display-sm font-display text-slate-900">{deficiency.title}</h1>
          <div className="flex items-center gap-3 mt-2">
            <SeverityBadge severity={deficiency.severity} />
            <PriorityBadge priority={deficiency.priority} />
          </div>
        </div>
        {!isViewer() && (
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button onClick={() => setShowEditForm(true)} className="btn btn-md btn-secondary">
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="btn btn-md bg-red-50 text-red-600 hover:bg-red-100"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Context Card */}
          <div className="card">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
              Context
            </h2>
            <div className="space-y-3">
              {building && (
                <div>
                  <p className="text-xs text-slate-400">Building</p>
                  <Link
                    to={`/buildings/${building.id}`}
                    className="text-sm font-medium text-onyx-600 hover:text-onyx-700"
                  >
                    {building.name}
                  </Link>
                </div>
              )}
              {assessment && (
                <div>
                  <p className="text-xs text-slate-400">Assessment</p>
                  <Link
                    to={`/assessments/${assessment.id}`}
                    className="text-sm font-medium text-onyx-600 hover:text-onyx-700"
                  >
                    {assessment.name}
                  </Link>
                </div>
              )}
              {element && (
                <div>
                  <p className="text-xs text-slate-400">Element</p>
                  {assessment ? (
                    <Link
                      to={`/assessments/${assessment.id}/elements/${element.id}`}
                      className="text-sm font-medium text-onyx-600 hover:text-onyx-700"
                    >
                      {element.uniformatCode}
                      {element.uniformatElement?.name && ` — ${element.uniformatElement.name}`}
                    </Link>
                  ) : (
                    <p className="text-sm font-medium text-slate-900">
                      {element.uniformatCode}
                      {element.uniformatElement?.name && ` — ${element.uniformatElement.name}`}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {deficiency.description && (
            <div className="card">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Description
              </h2>
              <p className="text-sm text-slate-700">{deficiency.description}</p>
            </div>
          )}

          {/* Recommended Action */}
          {deficiency.recommendedAction && (
            <div className="card">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Recommended Action
              </h2>
              <p className="text-sm text-slate-700">{deficiency.recommendedAction}</p>
            </div>
          )}
        </div>

        {/* Right Column - 1/3 */}
        <div className="space-y-6">
          {/* Cost Card */}
          <div className="card">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
              Cost
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-400">Estimated Cost</p>
                <p className="text-sm font-medium text-slate-900">
                  {formatCurrency(deficiency.estimatedCost)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Quantity</p>
                <p className="text-sm font-medium text-slate-900">
                  {deficiency.quantity ?? 1}
                  {deficiency.unitOfMeasure && ` ${deficiency.unitOfMeasure}`}
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs text-slate-400">Total Cost</p>
                <p className="text-lg font-semibold text-slate-900">
                  {formatCurrency(deficiency.totalCost)}
                </p>
              </div>
            </div>
          </div>

          {/* Timeline Card */}
          <div className="card">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
              Timeline
            </h2>
            <div className="space-y-3">
              {deficiency.targetYear && (
                <div>
                  <p className="text-xs text-slate-400">Target Year</p>
                  <p className="text-sm font-medium text-slate-900">{deficiency.targetYear}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-slate-400">Created</p>
                <p className="text-sm font-medium text-slate-900">
                  {formatDate(deficiency.createdAt)}
                </p>
              </div>
              {deficiency.createdBy && (
                <div>
                  <p className="text-xs text-slate-400">Created By</p>
                  <p className="text-sm font-medium text-slate-900">
                    {deficiency.createdBy.firstName} {deficiency.createdBy.lastName}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Photos */}
      <div className="card">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Photos ({photos?.length || 0})
        </h2>
        {canEditAssessments() && (
          <div className="mb-4">
            <PhotoUploader parentType="deficiency" parentId={id!} />
          </div>
        )}
        <PhotoGallery
          photos={photos || []}
          canEdit={canEditAssessments()}
          onDelete={async (photoId) => {
            try {
              await deletePhotoMutation.mutateAsync(photoId);
              toast.success('Photo deleted');
            } catch {
              toast.error('Failed to delete photo');
            }
          }}
          isDeleting={deletePhotoMutation.isPending}
        />
      </div>

      {/* Edit Dialog */}
      <DeficiencyFormDialog
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        onSubmit={handleUpdate}
        deficiency={deficiency}
        isLoading={updateMutation.isPending}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Deficiency"
        message={`Are you sure you want to delete "${deficiency.title}"? This action cannot be undone.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
