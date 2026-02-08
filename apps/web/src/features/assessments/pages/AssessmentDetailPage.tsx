import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronRight,
  Pencil,
  Trash2,
  Play,
  Send,
  CheckCircle,
  XCircle,
  Building2,
  Calendar,
  Users,
  Layers,
  AlertTriangle,
  UserPlus,
  Plus,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../hooks/useAuth';
import {
  useAssessment,
  useAssessmentAssignees,
  useDeleteAssessment,
  useStartAssessment,
  useSubmitAssessment,
  useApproveAssessment,
  useRejectAssessment,
  useAddAssignee,
  useRemoveAssignee,
} from '../api/assessments.api';
import { useAssessmentElements, useBulkAddElements } from '../api/elements.api';
import { useUsers } from '../../users/api/users.api';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import StatusBadge from '../../../components/ui/StatusBadge';
import FCIBadge from '../../../components/ui/FCIBadge';
import ConditionBadge from '../../../components/ui/ConditionBadge';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import RejectDialog from '../../../components/ui/RejectDialog';
import UniformatPicker from '../../../components/ui/UniformatPicker';

type Tab = 'overview' | 'assignees' | 'elements';

function formatCurrency(value: number | null | undefined): string {
  if (value == null) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export default function AssessmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { canApproveAssessments } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [showDelete, setShowDelete] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [addingAssignee, setAddingAssignee] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [showUniformatPicker, setShowUniformatPicker] = useState(false);

  const { data: assessment, isLoading, error } = useAssessment(id!);
  const { data: assignees } = useAssessmentAssignees(id!);
  const { data: elementsData, isLoading: elementsLoading } = useAssessmentElements(id!, { limit: 200 });
  const { data: usersData } = useUsers({ isActive: true, limit: 100 });

  const deleteMutation = useDeleteAssessment();
  const startMutation = useStartAssessment();
  const submitMutation = useSubmitAssessment();
  const approveMutation = useApproveAssessment();
  const rejectMutation = useRejectAssessment();
  const addAssigneeMutation = useAddAssignee();
  const removeAssigneeMutation = useRemoveAssignee();
  const bulkAddMutation = useBulkAddElements();

  const assigneesList = assignees || assessment?.assignees || [];
  const assignedUserIds = new Set(assigneesList.map((a) => a.userId || a.user?.id));
  const availableUsers = (usersData?.data || []).filter((u) => !assignedUserIds.has(u.id));

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(id!);
      toast.success('Assessment deleted');
      navigate('/assessments');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete assessment');
    }
  };

  const handleStart = async () => {
    try {
      await startMutation.mutateAsync(id!);
      toast.success('Assessment started');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to start assessment');
    }
  };

  const handleSubmit = async () => {
    try {
      await submitMutation.mutateAsync(id!);
      toast.success('Assessment submitted for review');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit assessment');
    }
  };

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync(id!);
      toast.success('Assessment approved');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to approve assessment');
    }
  };

  const handleReject = async (reason: string) => {
    try {
      await rejectMutation.mutateAsync({ id: id!, reason });
      toast.success('Assessment rejected');
      setShowReject(false);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to reject assessment');
    }
  };

  const handleAddAssignee = async () => {
    if (!selectedUserId) return;
    try {
      await addAssigneeMutation.mutateAsync({ assessmentId: id!, userId: selectedUserId });
      toast.success('Assignee added');
      setSelectedUserId('');
      setAddingAssignee(false);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add assignee');
    }
  };

  const handleAddElements = async (selectedCodes: string[]) => {
    try {
      const result = await bulkAddMutation.mutateAsync({ assessmentId: id!, uniformatCodes: selectedCodes });
      toast.success(`${result.added} element(s) added${result.skipped ? `, ${result.skipped} already existed` : ''}`);
      setShowUniformatPicker(false);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add elements');
    }
  };

  const handleRemoveAssignee = async (userId: string) => {
    try {
      await removeAssigneeMutation.mutateAsync({ assessmentId: id!, userId });
      toast.success('Assignee removed');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to remove assignee');
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" message="Loading assessment..." />;
  }

  if (error || !assessment) {
    return (
      <div className="card text-center py-12">
        <p className="text-red-600 font-medium">Assessment not found</p>
        <Link to="/assessments" className="text-sm text-onyx-600 hover:underline mt-2 inline-block">
          Back to assessments
        </Link>
      </div>
    );
  }

  const isManager = canApproveAssessments();
  const canEdit = assessment.status === 'draft';
  const canDelete = assessment.status !== 'approved';

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'assignees', label: `Assignees (${assigneesList.length})` },
    { key: 'elements', label: `Elements (${assessment.totalElements})` },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-sm text-slate-500">
        <Link to="/dashboard" className="hover:text-slate-700">Dashboard</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/assessments" className="hover:text-slate-700">Assessments</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-900 font-medium">{assessment.name}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-display-sm font-display text-slate-900">{assessment.name}</h1>
          <div className="flex items-center gap-3 mt-2 text-sm text-slate-600">
            <StatusBadge status={assessment.status} />
            {assessment.building && (
              <Link to={`/buildings/${assessment.building.id}`} className="hover:text-onyx-600">
                {assessment.building.name}
              </Link>
            )}
            {assessment.branch && <span>{assessment.branch.name}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Workflow buttons */}
          {assessment.status === 'draft' && (
            <button
              onClick={handleStart}
              disabled={startMutation.isPending}
              className="btn btn-md btn-primary"
            >
              <Play className="w-4 h-4 mr-2" />
              {startMutation.isPending ? 'Starting...' : 'Start Assessment'}
            </button>
          )}
          {assessment.status === 'in_progress' && (
            <button
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
              className="btn btn-md btn-primary"
            >
              <Send className="w-4 h-4 mr-2" />
              {submitMutation.isPending ? 'Submitting...' : 'Submit for Review'}
            </button>
          )}
          {assessment.status === 'submitted' && isManager && (
            <>
              <button
                onClick={handleApprove}
                disabled={approveMutation.isPending}
                className="btn btn-md bg-emerald-600 text-white hover:bg-emerald-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {approveMutation.isPending ? 'Approving...' : 'Approve'}
              </button>
              <button
                onClick={() => setShowReject(true)}
                className="btn btn-md btn-danger"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </button>
            </>
          )}

          {/* Edit / Delete */}
          {canEdit && (
            <Link to={`/assessments/${id}/edit`} className="btn btn-md btn-outline">
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </Link>
          )}
          {canDelete && (
            <button onClick={() => setShowDelete(true)} className="btn btn-md btn-danger">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Rejection reason banner */}
      {assessment.status === 'rejected' && assessment.rejectionReason && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Assessment Rejected</p>
            <p className="text-sm text-red-700 mt-1">{assessment.rejectionReason}</p>
          </div>
        </div>
      )}

      {/* Approved banner */}
      {assessment.status === 'approved' && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-emerald-800">Assessment Approved</p>
            {assessment.approvedAt && (
              <p className="text-sm text-emerald-700 mt-1">
                Approved on {new Date(assessment.approvedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      )}

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
          {/* Info Card */}
          <div className="lg:col-span-2 card">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Assessment Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500">Building</p>
                  <p className="text-sm font-medium text-slate-900">
                    {assessment.building?.name || '—'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Layers className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500">Branch</p>
                  <p className="text-sm font-medium text-slate-900">
                    {assessment.branch?.name || '—'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500">Created</p>
                  <p className="text-sm font-medium text-slate-900">
                    {new Date(assessment.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {assessment.targetCompletionDate && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-500">Target Completion</p>
                    <p className="text-sm font-medium text-slate-900">
                      {new Date(assessment.targetCompletionDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
              {assessment.startedAt && (
                <div className="flex items-start gap-3">
                  <Play className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-500">Started</p>
                    <p className="text-sm font-medium text-slate-900">
                      {new Date(assessment.startedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
              {assessment.submittedAt && (
                <div className="flex items-start gap-3">
                  <Send className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-500">Submitted</p>
                    <p className="text-sm font-medium text-slate-900">
                      {new Date(assessment.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
            {assessment.description && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-sm text-slate-500 mb-1">Description</p>
                <p className="text-sm text-slate-700">{assessment.description}</p>
              </div>
            )}
          </div>

          {/* Metrics Sidebar */}
          <div className="space-y-4">
            <div className="card">
              <h3 className="text-sm font-semibold text-slate-500 uppercase mb-3">FCI</h3>
              <div className="text-center">
                <div className="text-4xl font-bold text-slate-900 mb-2">
                  {assessment.calculatedFci != null
                    ? `${(Number(assessment.calculatedFci) * 100).toFixed(1)}%`
                    : 'N/A'}
                </div>
                <FCIBadge value={assessment.calculatedFci} />
              </div>
            </div>
            <div className="card">
              <h3 className="text-sm font-semibold text-slate-500 uppercase mb-3">Progress</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Elements</span>
                  <span className="font-medium">
                    {assessment.completedElements}/{assessment.totalElements}
                  </span>
                </div>
                {assessment.totalElements > 0 && (
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-onyx-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.round((assessment.completedElements / assessment.totalElements) * 100)}%`,
                      }}
                    />
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Deficiencies</span>
                  <span className="font-medium">{assessment.totalDeficiencies}</span>
                </div>
              </div>
            </div>
            <div className="card">
              <h3 className="text-sm font-semibold text-slate-500 uppercase mb-3">Deferred Maintenance</h3>
              <p className="text-2xl font-bold text-slate-900">
                {formatCurrency(assessment.totalDeferredMaintenance)}
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'assignees' && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Assignees</h2>
            {isManager && (
              <button
                onClick={() => setAddingAssignee(!addingAssignee)}
                className="btn btn-sm btn-outline"
              >
                <UserPlus className="w-4 h-4 mr-1" />
                Add Assignee
              </button>
            )}
          </div>

          {/* Add Assignee Form */}
          {addingAssignee && (
            <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50 rounded-lg">
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="input flex-1"
              >
                <option value="">Select a user...</option>
                {availableUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.firstName} {u.lastName} ({u.email})
                  </option>
                ))}
              </select>
              <button
                onClick={handleAddAssignee}
                disabled={!selectedUserId || addAssigneeMutation.isPending}
                className="btn btn-sm btn-primary"
              >
                {addAssigneeMutation.isPending ? 'Adding...' : 'Add'}
              </button>
              <button
                onClick={() => { setAddingAssignee(false); setSelectedUserId(''); }}
                className="btn btn-sm btn-ghost"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Assignees List */}
          {assigneesList.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Users className="w-8 h-8 mx-auto mb-2" />
              No assignees yet
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {assigneesList.map((assignee) => {
                const user = assignee.user;
                if (!user) return null;
                return (
                  <div key={assignee.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-onyx-100 flex items-center justify-center text-onyx-700 font-semibold text-sm">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                    {isManager && (
                      <button
                        onClick={() => handleRemoveAssignee(user.id)}
                        className="btn btn-ghost btn-sm p-1.5 text-red-600 hover:bg-red-50"
                        title="Remove assignee"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'elements' && (
        <>
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Assessment Elements</h2>
              {assessment.status !== 'approved' && (
                <button
                  onClick={() => setShowUniformatPicker(true)}
                  className="btn btn-md btn-primary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Elements
                </button>
              )}
            </div>

            {elementsLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : !elementsData || elementsData.data.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Layers className="w-8 h-8 mx-auto mb-2" />
                <p>No elements added yet</p>
                <p className="text-xs mt-1">Click "Add Elements" to select from the Uniformat library</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-6">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Code</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">System</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Condition</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Deficiencies</th>
                    </tr>
                  </thead>
                  <tbody>
                    {elementsData.data.map((element) => (
                      <tr
                        key={element.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-3">
                          <Link
                            to={`/assessments/${id}/elements/${element.id}`}
                            className="text-sm font-mono font-medium text-onyx-600 hover:text-onyx-700 hover:underline"
                          >
                            {element.uniformatCode}
                          </Link>
                        </td>
                        <td className="px-6 py-3 text-sm text-slate-700">
                          {element.uniformatElement?.name || element.systemName || '—'}
                        </td>
                        <td className="px-6 py-3 text-sm text-slate-500">
                          {element.systemGroup}
                        </td>
                        <td className="px-6 py-3">
                          <ConditionBadge rating={element.conditionRating} />
                        </td>
                        <td className="px-6 py-3">
                          <StatusBadge status={element.status} />
                        </td>
                        <td className="px-6 py-3 text-sm text-slate-700 text-right">
                          {element._count?.deficiencies || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <UniformatPicker
            isOpen={showUniformatPicker}
            onClose={() => setShowUniformatPicker(false)}
            onConfirm={handleAddElements}
            isLoading={bulkAddMutation.isPending}
            existingCodes={elementsData?.data.map((e) => e.uniformatCode) || []}
          />
        </>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete Assessment"
        message={`Are you sure you want to delete "${assessment.name}"? This action cannot be undone.`}
        isLoading={deleteMutation.isPending}
      />

      {/* Reject Dialog */}
      <RejectDialog
        isOpen={showReject}
        onClose={() => setShowReject(false)}
        onConfirm={handleReject}
        isLoading={rejectMutation.isPending}
      />
    </div>
  );
}
