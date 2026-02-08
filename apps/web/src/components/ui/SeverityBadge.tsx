import type { DeficiencySeverity } from '../../types';

const severityConfig: Record<DeficiencySeverity, { label: string; className: string }> = {
  minor: { label: 'Minor', className: 'badge bg-blue-100 text-blue-700' },
  moderate: { label: 'Moderate', className: 'badge bg-amber-100 text-amber-700' },
  major: { label: 'Major', className: 'badge bg-orange-100 text-orange-700' },
  critical: { label: 'Critical', className: 'badge bg-red-100 text-red-700' },
};

export default function SeverityBadge({ severity }: { severity: DeficiencySeverity }) {
  const config = severityConfig[severity];
  return <span className={config.className}>{config.label}</span>;
}
