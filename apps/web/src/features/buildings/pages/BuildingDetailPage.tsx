import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronRight,
  Pencil,
  Trash2,
  MapPin,
  Calendar,
  Layers,
  Ruler,
  DollarSign,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useBuilding, useBuildingStats, useBuildingAssessments, useDeleteBuilding } from '../api/buildings.api';
import { useBuildingPhotos, useDeletePhoto } from '../../photos/api/photos.api';
import { useAuth } from '../../../hooks/useAuth';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import FCIBadge from '../../../components/ui/FCIBadge';
import StatusBadge from '../../../components/ui/StatusBadge';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import PhotoUploader from '../../../components/ui/PhotoUploader';
import PhotoGallery from '../../../components/ui/PhotoGallery';

type Tab = 'overview' | 'assessments' | 'photos';

function formatCurrency(value: number | null | undefined): string {
  if (value == null) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export default function BuildingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [showDelete, setShowDelete] = useState(false);

  const { canEditAssessments } = useAuth();
  const { data: building, isLoading, error } = useBuilding(id!);
  const { data: stats } = useBuildingStats(id!);
  const { data: assessmentsData } = useBuildingAssessments(id!);
  const { data: photos } = useBuildingPhotos(id!);
  const deleteMutation = useDeleteBuilding();
  const deletePhotoMutation = useDeletePhoto();

  const assessments = assessmentsData?.data || [];

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(id!);
      toast.success('Building deleted');
      navigate('/buildings');
    } catch {
      toast.error('Failed to delete building');
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" message="Loading building..." />;
  }

  if (error || !building) {
    return (
      <div className="card text-center py-12">
        <p className="text-red-600 font-medium">Building not found</p>
        <Link to="/buildings" className="text-sm text-onyx-600 hover:underline mt-2 inline-block">
          Back to buildings
        </Link>
      </div>
    );
  }

  const address = [building.addressLine1, building.city, building.state, building.postalCode]
    .filter(Boolean)
    .join(', ');

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'assessments', label: `Assessments (${building._count?.assessments ?? 0})` },
    { key: 'photos', label: `Photos (${photos?.length ?? 0})` },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-sm text-slate-500">
        <Link to="/dashboard" className="hover:text-slate-700">Dashboard</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/buildings" className="hover:text-slate-700">Buildings</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-900 font-medium">{building.name}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-display-sm font-display text-slate-900">{building.name}</h1>
          <div className="flex items-center gap-3 mt-2 text-sm text-slate-600">
            {building.code && <span className="badge badge-primary">{building.code}</span>}
            {building.branch && <span>{building.branch.name}</span>}
            <FCIBadge value={building.currentFci} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to={`/buildings/${id}/edit`} className="btn btn-md btn-outline">
            <Pencil className="w-4 h-4 mr-2" />
            Edit
          </Link>
          <button onClick={() => setShowDelete(true)} className="btn btn-md btn-danger">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-onyx-600 text-onyx-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Building Info */}
          <div className="lg:col-span-2 card">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Building Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-500">Address</p>
                    <p className="text-sm font-medium text-slate-900">{address}</p>
                  </div>
                </div>
              )}
              {building.buildingType && (
                <div className="flex items-start gap-3">
                  <Layers className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-500">Building Type</p>
                    <p className="text-sm font-medium text-slate-900">{building.buildingType}</p>
                  </div>
                </div>
              )}
              {building.yearBuilt && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-500">Year Built</p>
                    <p className="text-sm font-medium text-slate-900">{building.yearBuilt}</p>
                  </div>
                </div>
              )}
              {building.numFloors && (
                <div className="flex items-start gap-3">
                  <Layers className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-500">Floors</p>
                    <p className="text-sm font-medium text-slate-900">{building.numFloors}</p>
                  </div>
                </div>
              )}
              {building.grossSquareFeet && (
                <div className="flex items-start gap-3">
                  <Ruler className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-500">Gross Square Feet</p>
                    <p className="text-sm font-medium text-slate-900">
                      {Number(building.grossSquareFeet).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
              {building.currentReplacementValue && (
                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-500">Replacement Value</p>
                    <p className="text-sm font-medium text-slate-900">
                      {formatCurrency(building.currentReplacementValue)}
                    </p>
                  </div>
                </div>
              )}
            </div>
            {building.description && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-sm text-slate-500 mb-1">Description</p>
                <p className="text-sm text-slate-700">{building.description}</p>
              </div>
            )}
          </div>

          {/* Key Metrics */}
          <div className="space-y-4">
            <div className="card">
              <h3 className="text-sm font-semibold text-slate-500 uppercase mb-3">Condition</h3>
              <div className="text-center">
                <div className="text-4xl font-bold text-slate-900 mb-2">
                  {building.currentFci != null
                    ? `${(Number(building.currentFci) * 100).toFixed(1)}%`
                    : 'N/A'}
                </div>
                <FCIBadge value={building.currentFci} />
              </div>
            </div>
            <div className="card">
              <h3 className="text-sm font-semibold text-slate-500 uppercase mb-3">Deferred Maintenance</h3>
              <p className="text-2xl font-bold text-slate-900">
                {formatCurrency(building.totalDeferredMaintenance)}
              </p>
            </div>
            {stats && (
              <div className="card">
                <h3 className="text-sm font-semibold text-slate-500 uppercase mb-3">Assessment Stats</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Total</span>
                    <span className="font-medium">{stats.totalAssessments}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Completed</span>
                    <span className="font-medium">{stats.completedAssessments}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Avg Condition</span>
                    <span className="font-medium">
                      {stats.averageConditionRating ? stats.averageConditionRating.toFixed(1) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'assessments' && (
        <div className="card">
          {assessments.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              No assessments for this building
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600 uppercase">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600 uppercase">FCI</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600 uppercase">Elements</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600 uppercase">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {assessments.map((a) => (
                    <tr key={a.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{a.name}</td>
                      <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                      <td className="px-4 py-3"><FCIBadge value={a.calculatedFci} /></td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {a.completedElements}/{a.totalElements}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {new Date(a.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'photos' && (
        <div className="space-y-4">
          {canEditAssessments() && (
            <PhotoUploader parentType="building" parentId={id!} />
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
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete Building"
        message={`Are you sure you want to delete "${building.name}"? This action cannot be undone.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
