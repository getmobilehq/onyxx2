import React from 'react';

interface StatusBadgeProps {
  status: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'status-draft' },
  in_progress: { label: 'In Progress', className: 'status-in-progress' },
  submitted: { label: 'Submitted', className: 'status-submitted' },
  in_review: { label: 'In Review', className: 'badge bg-purple-100 text-purple-700' },
  approved: { label: 'Approved', className: 'status-approved' },
  rejected: { label: 'Rejected', className: 'status-rejected' },
  pending: { label: 'Pending', className: 'badge bg-slate-100 text-slate-600' },
  completed: { label: 'Completed', className: 'status-approved' },
  skipped: { label: 'Skipped', className: 'badge bg-slate-100 text-slate-500' },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: 'status-draft' };
  return <span className={config.className}>{config.label}</span>;
}
