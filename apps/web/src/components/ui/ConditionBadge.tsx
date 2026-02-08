interface ConditionBadgeProps {
  rating: number | null | undefined;
}

function getConditionLevel(rating: number): { label: string; className: string } {
  if (rating >= 4) return { label: 'Excellent', className: 'badge bg-emerald-100 text-emerald-700' };
  if (rating >= 3) return { label: 'Good', className: 'badge bg-blue-100 text-blue-700' };
  if (rating >= 2) return { label: 'Fair', className: 'badge bg-amber-100 text-amber-700' };
  return { label: 'Poor', className: 'badge bg-red-100 text-red-700' };
}

export default function ConditionBadge({ rating }: ConditionBadgeProps) {
  if (rating == null) {
    return <span className="badge bg-slate-100 text-slate-500">Not Rated</span>;
  }
  const { label, className } = getConditionLevel(rating);
  return <span className={className}>{label} ({rating}/5)</span>;
}
