import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface DataPoint {
  label: string;
  value: number;
  usdc: string;
}

interface RevenueChartProps {
  data?: DataPoint[];
  range: 'daily' | 'weekly' | 'monthly';
}

const DEMO_DAILY: DataPoint[] = [
  { label: 'Mon', value: 120, usdc: '120.00' },
  { label: 'Tue', value: 85, usdc: '85.00' },
  { label: 'Wed', value: 200, usdc: '200.00' },
  { label: 'Thu', value: 150, usdc: '150.00' },
  { label: 'Fri', value: 280, usdc: '280.00' },
  { label: 'Sat', value: 320, usdc: '320.00' },
  { label: 'Sun', value: 95, usdc: '95.00' },
];

const DEMO_WEEKLY: DataPoint[] = [
  { label: 'W1', value: 450, usdc: '450.00' },
  { label: 'W2', value: 620, usdc: '620.00' },
  { label: 'W3', value: 580, usdc: '580.00' },
  { label: 'W4', value: 780, usdc: '780.00' },
];

const DEMO_MONTHLY: DataPoint[] = [
  { label: 'Jan', value: 1200, usdc: '1,200.00' },
  { label: 'Feb', value: 1580, usdc: '1,580.00' },
  { label: 'Mar', value: 2100, usdc: '2,100.00' },
  { label: 'Apr', value: 1890, usdc: '1,890.00' },
  { label: 'May', value: 2450, usdc: '2,450.00' },
  { label: 'Jun', value: 2680, usdc: '2,680.00' },
];

const RANGE_DATA: Record<'daily' | 'weekly' | 'monthly', DataPoint[]> = {
  daily: DEMO_DAILY,
  weekly: DEMO_WEEKLY,
  monthly: DEMO_MONTHLY,
};

export function RevenueChart({ data, range }: RevenueChartProps) {
  const chartData = useMemo(() => data ?? RANGE_DATA[range], [data, range]);
  const maxVal = useMemo(() => Math.max(...chartData.map((d) => d.value), 1), [chartData]);

  return (
    <div className="w-full" style={{ minHeight: 180, height: 192 }}>
      <ResponsiveContainer width="100%" height="100%" minHeight={180}>
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-tertiary)" opacity={0.5} />
          <XAxis
            dataKey="label"
            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
            axisLine={{ stroke: 'var(--bg-tertiary)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v} USDC`}
            domain={[0, maxVal * 1.1]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
            }}
            labelStyle={{ color: 'var(--text-primary)' }}
            formatter={(value: number | undefined) => [`${(value ?? 0).toFixed(2)} USDC`, 'Revenue']}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={48}>
            {chartData.map((_, i) => (
              <Cell key={i} fill="var(--accent-green)" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
