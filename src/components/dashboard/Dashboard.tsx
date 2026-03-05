import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BalanceCard } from '../merchant/BalanceCard';
import { PaymentFeed } from '../merchant/PaymentFeed';
import { CreditScoreCard } from '../merchant/CreditScoreCard';
import { RevenueChart } from '../merchant/RevenueChart';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

export default function Dashboard() {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 pb-8">
      {/* Hero section */}
      <motion.div
        variants={item}
        className="relative overflow-hidden rounded-2xl hero-gradient border border-white/[0.06] p-6 md:p-8"
      >
        <div className="absolute top-4 right-4 z-20">
          <Link
            to="/dashboard/qr"
            className="inline-flex items-center gap-2 rounded-xl bg-accent-green px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-green-hover transition-all duration-200 shadow-lg shadow-accent-green/20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            Create QR code
          </Link>
        </div>
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-green/10 px-3 py-1 text-xs font-semibold text-accent-green border border-accent-green/20">
              Base
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-secondary border border-white/10">
              USDC
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-primary tracking-tight mb-2">
            Your onchain revenue home
          </h1>
          <p className="text-secondary text-base md:text-lg max-w-2xl mb-1">
            Balance, live payment feed, and credit score. Every payment builds your ledger.
          </p>
          <p className="text-accent-green/90 text-sm font-medium italic">
            "When money speaks, identity grows."
          </p>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-accent-green/5 via-transparent to-transparent pointer-events-none" />
      </motion.div>

      {/* Balance cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={item}>
          <BalanceCard
            label="Liquid USDC"
            amount="0.00"
            onRefresh={handleRefresh}
            isLoading={refreshing}
          />
        </motion.div>
        <motion.div variants={item}>
          <BalanceCard
            label="Savings"
            amount="0.00"
            variant="accent"
            onRefresh={handleRefresh}
            isLoading={refreshing}
          />
        </motion.div>
        <motion.div variants={item}>
          <BalanceCard
            label="Locked in loan"
            amount="0.00"
            onRefresh={handleRefresh}
            isLoading={refreshing}
          />
        </motion.div>
        <motion.div variants={item}>
          <CreditScoreCard score={null} />
        </motion.div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={item}>
          <PaymentFeed onSoundToggle={() => {}} />
        </motion.div>
        <motion.div variants={item}>
          <div className="bg-secondary rounded-xl border border-white/10 p-5 h-full">
            <h2 className="text-lg font-semibold text-primary mb-4">Revenue</h2>
            <RevenueChart range="weekly" />
          </div>
        </motion.div>
      </div>

      {/* CTA */}
      <motion.div
        variants={item}
        className="rounded-2xl border border-white/10 bg-secondary/80 backdrop-blur-sm p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h2 className="text-lg font-semibold text-primary">New merchant?</h2>
          <p className="text-sm text-secondary">Connect wallet, create profile, and get your QR.</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/register"
            className="rounded-xl bg-accent-green px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-green-hover transition-colors"
          >
            Register
          </Link>
          <Link
            to="/dashboard/qr"
            className="rounded-xl border border-white/15 px-5 py-2.5 text-sm font-semibold text-primary hover:bg-white/5 transition-colors"
          >
            Get QR
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}
