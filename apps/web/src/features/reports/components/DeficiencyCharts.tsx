import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ChartEntry {
  count: number;
  totalCost: number;
}

interface DeficiencyChartsProps {
  bySeverity: Record<string, ChartEntry>;
  byPriority: Record<string, ChartEntry>;
}

const SEVERITY_COLORS: Record<string, string> = {
  minor: '#3b82f6',
  moderate: '#f59e0b',
  major: '#f97316',
  critical: '#ef4444',
};

const PRIORITY_COLORS: Record<string, string> = {
  immediate: '#ef4444',
  short_term: '#f97316',
  medium_term: '#f59e0b',
  long_term: '#3b82f6',
};

const SEVERITY_LABELS: Record<string, string> = {
  minor: 'Minor',
  moderate: 'Moderate',
  major: 'Major',
  critical: 'Critical',
};

const PRIORITY_LABELS: Record<string, string> = {
  immediate: 'Immediate',
  short_term: 'Short Term',
  medium_term: 'Medium Term',
  long_term: 'Long Term',
};

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold text-slate-900">{label}</p>
      <p className="text-slate-600">
        Count: <span className="font-medium text-slate-900">{d.count}</span>
      </p>
      <p className="text-slate-600">
        Cost: <span className="font-medium text-slate-900">{formatCurrency(d.totalCost)}</span>
      </p>
    </div>
  );
}

function toChartData(
  data: Record<string, ChartEntry>,
  labels: Record<string, string>,
  colors: Record<string, string>,
  keyOrder: string[],
) {
  return keyOrder
    .filter((key) => data[key])
    .map((key) => ({
      name: labels[key] || key,
      count: data[key].count,
      totalCost: data[key].totalCost,
      fill: colors[key] || '#94a3b8',
    }));
}

function HorizontalBarChart({ data, title }: { data: ReturnType<typeof toChartData>; title: string }) {
  if (!data.length) return null;

  return (
    <div>
      <h4 className="text-sm font-semibold text-slate-700 mb-3">{title}</h4>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
          <XAxis
            type="number"
            tickFormatter={formatCurrency}
            tick={{ fontSize: 11, fill: '#64748b' }}
            tickLine={false}
            axisLine={{ stroke: '#e2e8f0' }}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 12, fill: '#64748b' }}
            tickLine={false}
            axisLine={{ stroke: '#e2e8f0' }}
            width={90}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="totalCost" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <rect key={index} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function DeficiencyCharts({ bySeverity, byPriority }: DeficiencyChartsProps) {
  const severityData = toChartData(
    bySeverity,
    SEVERITY_LABELS,
    SEVERITY_COLORS,
    ['minor', 'moderate', 'major', 'critical'],
  );

  const priorityData = toChartData(
    byPriority,
    PRIORITY_LABELS,
    PRIORITY_COLORS,
    ['immediate', 'short_term', 'medium_term', 'long_term'],
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card">
        <HorizontalBarChart data={severityData} title="By Severity (Cost)" />
      </div>
      <div className="card">
        <HorizontalBarChart data={priorityData} title="By Priority (Cost)" />
      </div>
    </div>
  );
}
