import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CreditScoreGauge } from '../../components/merchant/CreditScoreGauge';
import { ScoreFactors } from '../../components/merchant/ScoreFactors';
import { MerchantNFT } from '../../components/merchant/MerchantNFT';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { apiGetJson } from '../../lib/api';

const NEXT_TIER_SCORE: Record<string, number> = {
  Seed: 300,
  Bronze: 500,
  Silver: 700,
  Gold: 850,
  Platinum: 1000,
};

interface DashboardData {
  score: number;
  tier: string;
  scoreUpdatedAt?: string;
  factors?: Record<string, number>;
}

export default function Identity() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { address, getToken } = useAuth();

  const loadData = useCallback(async () => {
    if (!address) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await apiGetJson<DashboardData>(
        `/api/merchants/${address.toLowerCase()}/dashboard`,
        { token },
      );
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load identity data');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [address, getToken]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const score = data?.score ?? 0;
  const tier = data?.tier ?? 'Seed';
  const factorsRecord = data?.factors ?? {};
  const factorsList = Object.entries(factorsRecord).map(([key, value]) => ({
    key,
    value: typeof value === 'number' ? value : 0,
  }));
  const nextTierScore = NEXT_TIER_SCORE[tier] ?? 300;

  const scoreHistory = [
    { day: 'D1', score: 0 },
    { day: 'D30', score: Math.round(score * 0.3) },
    { day: 'D60', score: Math.round(score * 0.6) },
    { day: 'D90', score: score },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-primary">Identity</h1>
        <p className="text-secondary text-sm mt-1">
          Credit score 0–1000, tier badge, factor breakdown. NFT and SBT when available.
        </p>
      </div>

      {error && <p className="text-sm text-amber-500/90">{error}</p>}

      {loading ? (
        <div className="bg-secondary rounded-xl border border-white/10 p-8 text-center text-secondary text-sm">
          Loading…
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-secondary rounded-xl border border-white/10 p-6">
              <h2 className="text-lg font-semibold text-primary mb-4">Credit score</h2>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <CreditScoreGauge score={score} size={140} showTier />
              </div>
              <p className="text-xs text-secondary mt-4">
                Score updates every 24h from onchain revenue data.
              </p>
            </div>
            <div className="bg-secondary rounded-xl border border-white/10 p-6">
              <h2 className="text-lg font-semibold text-primary mb-4">Score factors</h2>
              <ScoreFactors factors={factorsList} />
            </div>
          </div>

          <div className="bg-secondary rounded-xl border border-white/10 p-6">
            <h2 className="text-lg font-semibold text-primary mb-4">90-day score trend</h2>
            <div className="w-full min-w-0" style={{ minHeight: 160, height: 160 }}>
              <ResponsiveContainer width="100%" height={160} minHeight={160}>
                <LineChart data={scoreHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-tertiary)" opacity={0.5} />
                  <XAxis dataKey="day" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                  <YAxis domain={[0, 1000]} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="var(--accent-green)"
                    strokeWidth={2}
                    dot={{ fill: 'var(--accent-green)' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-secondary mt-2">
              Simulated trend (D90 = current score). Full history when oracle history is available.
            </p>
          </div>

          <MerchantNFT tier={tier} score={score} nextTierScore={nextTierScore} />
        </>
      )}
    </motion.div>
  );
}
