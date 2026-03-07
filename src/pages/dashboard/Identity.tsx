import { useState } from 'react';
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

const SCORE_HISTORY = [
  { day: 'D1', score: 0 },
  { day: 'D30', score: 150 },
  { day: 'D60', score: 220 },
  { day: 'D90', score: 280 },
];

export default function Identity() {
  const [score] = useState(0);
  const tier = 'Seed';

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-secondary rounded-xl border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-primary mb-4">Credit score</h2>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <CreditScoreGauge score={score} size={140} showTier />
          </div>
          <p className="text-xs text-secondary mt-4">Score updates every 24h from onchain revenue data.</p>
        </div>
        <div className="bg-secondary rounded-xl border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-primary mb-4">Score factors</h2>
          <ScoreFactors />
        </div>
      </div>

      <div className="bg-secondary rounded-xl border border-white/10 p-6">
        <h2 className="text-lg font-semibold text-primary mb-4">90-day score trend</h2>
        <div className="w-full" style={{ minHeight: 160, height: 160 }}>
          <ResponsiveContainer width="100%" height="100%" minHeight={160}>
            <LineChart data={SCORE_HISTORY}>
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
      </div>

      <MerchantNFT tier={tier} score={score} nextTierScore={300} />
    </motion.div>
  );
}
