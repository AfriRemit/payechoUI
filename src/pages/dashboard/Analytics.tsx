import { useState } from 'react';
import { motion } from 'framer-motion';
import { RevenueChart } from '../../components/merchant/RevenueChart';
import { PeakHoursHeatmap } from '../../components/merchant/PeakHoursHeatmap';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

const DEMO_DATA = [
  { label: 'W1', value: 450 },
  { label: 'W2', value: 620 },
  { label: 'W3', value: 580 },
  { label: 'W4', value: 780 },
];

const TOP_PAYERS = [
  { address: '0x2A01...9EA9', payments: 12 },
  { address: '0xDc04...d3a1', payments: 8 },
  { address: '0xae2F...aE13', payments: 5 },
];

export default function Analytics() {
  const [range, setRange] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-primary">Analytics</h1>
        <p className="text-secondary text-sm mt-1">
          Revenue bar chart, volume trend line, peak hours heatmap, top payers.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['daily', 'weekly', 'monthly'] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRange(r)}
            className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition-colors ${
              range === r ? 'bg-accent-green text-white' : 'bg-tertiary text-secondary hover:text-primary'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-secondary rounded-xl border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-primary mb-4">Revenue</h2>
          <RevenueChart range={range} />
        </div>
        <div className="bg-secondary rounded-xl border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-primary mb-4">Volume trend</h2>
          <div className="w-full" style={{ minHeight: 180, height: 192 }}>
            <ResponsiveContainer width="100%" height="100%" minHeight={180}>
              <LineChart data={DEMO_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-tertiary)" opacity={0.5} />
                <XAxis dataKey="label" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="var(--accent-green)"
                  strokeWidth={2}
                  dot={{ fill: 'var(--accent-green)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-secondary rounded-xl border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-primary mb-4">Peak hours</h2>
          <PeakHoursHeatmap />
        </div>
        <div className="bg-secondary rounded-xl border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-primary mb-4">Top payers</h2>
          <ul className="space-y-3">
            {TOP_PAYERS.map((p) => (
              <li
                key={p.address}
                className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
              >
                <span className="font-mono text-sm text-primary">{p.address}</span>
                <span className="text-accent-green font-medium">{p.payments} payments</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
