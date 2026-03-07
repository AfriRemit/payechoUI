import { useState, useEffect, useCallback } from 'react';
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
import { useAuth } from '../../contexts/AuthContext';
import { apiGetJson } from '../../lib/api';
import { shortenAddress } from '../../lib/utils';

interface DataPoint {
  label: string;
  value: number;
  usdc: string;
}

interface DashboardResponse {
  revenue: {
    daily: DataPoint[];
    weekly: DataPoint[];
    monthly: DataPoint[];
  };
  peakHours: number[][];
  topPayers: Array<{ address: string; payments: number }>;
}

export default function Analytics() {
  const [range, setRange] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { address, getToken } = useAuth();

  const loadAnalytics = useCallback(async () => {
    if (!address) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await apiGetJson<DashboardResponse>(
        `/api/merchants/${address.toLowerCase()}/dashboard`,
        { token },
      );
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load analytics');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [address, getToken]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const revenueData = data?.revenue?.[range];
  const volumeData = revenueData?.map((d) => ({ label: d.label, value: d.value })) ?? [];
  const peakHours = data?.peakHours ?? undefined;
  const topPayers = data?.topPayers ?? [];

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

      {error && <p className="text-sm text-amber-500/90">{error}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-secondary rounded-xl border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-primary mb-4">Revenue</h2>
          {loading ? (
            <div className="h-48 flex items-center justify-center text-secondary text-sm">Loading…</div>
          ) : (
            <RevenueChart data={revenueData} range={range} />
          )}
        </div>
        <div className="bg-secondary rounded-xl border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-primary mb-4">Volume trend</h2>
          {loading ? (
            <div className="h-48 flex items-center justify-center text-secondary text-sm">Loading…</div>
          ) : (
            <div className="w-full min-w-0" style={{ minHeight: 180, height: 192 }}>
              <ResponsiveContainer width="100%" height={192} minHeight={180}>
                <LineChart data={volumeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-tertiary)" opacity={0.5} />
                  <XAxis dataKey="label" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                  <YAxis
                    tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                    tickFormatter={(v) => `${v} USDC`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number | undefined) => [`${(value ?? 0).toFixed(2)} USDC`, 'Volume']}
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
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-secondary rounded-xl border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-primary mb-4">Peak hours</h2>
          {loading ? (
            <div className="h-48 flex items-center justify-center text-secondary text-sm">Loading…</div>
          ) : (
            <PeakHoursHeatmap data={peakHours} />
          )}
        </div>
        <div className="bg-secondary rounded-xl border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-primary mb-4">Top payers</h2>
          {loading ? (
            <div className="py-8 text-center text-secondary text-sm">Loading…</div>
          ) : topPayers.length === 0 ? (
            <p className="text-secondary text-sm py-4">No payers yet. Data appears when customers pay you.</p>
          ) : (
            <ul className="space-y-3">
              {topPayers.map((p) => (
                <li
                  key={p.address}
                  className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                >
                  <span className="font-mono text-sm text-primary">
                    {shortenAddress(p.address, 4)}
                  </span>
                  <span className="text-accent-green font-medium">
                    {p.payments} payment{p.payments !== 1 ? 's' : ''}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </motion.div>
  );
}
