import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface StatusPieChartProps {
  data: { status: string; count: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  draft: '#94a3b8',
  in_progress: '#3b82f6',
  submitted: '#f59e0b',
  in_review: '#a855f7',
  approved: '#22c55e',
  rejected: '#ef4444',
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  in_progress: 'In Progress',
  submitted: 'Submitted',
  in_review: 'In Review',
  approved: 'Approved',
  rejected: 'Rejected',
};

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold text-slate-900">{STATUS_LABELS[d.status] || d.status}</p>
      <p className="text-slate-600">
        Count: <span className="font-medium text-slate-900">{d.count}</span>
      </p>
    </div>
  );
}

export default function StatusPieChart({ data }: StatusPieChartProps) {
  if (!data.length) return null;

  const chartData = data.map((d) => ({
    ...d,
    name: STATUS_LABELS[d.status] || d.status,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="count"
          nameKey="name"
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={STATUS_COLORS[entry.status] || '#94a3b8'}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => (
            <span className="text-sm text-slate-600">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
