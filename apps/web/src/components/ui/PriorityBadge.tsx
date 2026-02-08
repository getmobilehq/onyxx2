import type { DeficiencyPriority } from '../../types';

const priorityConfig: Record<DeficiencyPriority, { label: string; className: string }> = {
  immediate: { label: 'Immediate', className: 'badge bg-red-100 text-red-700' },
  short_term: { label: 'Short Term', className: 'badge bg-orange-100 text-orange-700' },
  medium_term: { label: 'Medium Term', className: 'badge bg-amber-100 text-amber-700' },
  long_term: { label: 'Long Term', className: 'badge bg-blue-100 text-blue-700' },
};

export default function PriorityBadge({ priority }: { priority: DeficiencyPriority }) {
  const config = priorityConfig[priority];
  return <span className={config.className}>{config.label}</span>;
}
