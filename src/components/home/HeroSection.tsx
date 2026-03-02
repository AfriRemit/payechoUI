import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const VOICE_CONFIRMATIONS = [
  { amount: '25', total: '120' },
  { amount: '50', total: '200' },
  { amount: '15', total: '85' },
  { amount: '100', total: '340' },
  { amount: '40', total: '160' },
];

// Duplicate for seamless scroll loop
const SCROLL_ITEMS = [...VOICE_CONFIRMATIONS, ...VOICE_CONFIRMATIONS, ...VOICE_CONFIRMATIONS];

const HeroSection: React.FC = () => {
  return (
    <section className="relative px-6 py-16 bg-primary overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute top-80 right-0 md:top-0 w-48 h-48 md:w-96 md:h-96 bg-gradient-radial from-red-500/20 via-orange-500/20 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute top-96 right-20 md:top-20 w-32 h-32 md:w-64 md:h-64 bg-gradient-radial from-green-500/20 via-blue-500/20 to-transparent rounded-full blur-2xl"></div>
      

      <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10">
        {/* Left Content */}
        <motion.div 
          className="space-y-6 font-sans"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="space-y-3">
            <p className="text-sm text-accent-green font-medium">Base · USDC</p>
            <h1 className="text-5xl lg:text-6xl font-medium text-primary leading-tight">
              Payments that speak the truth.
            </h1>
            <p className="text-xl text-secondary leading-relaxed">
              Accept USDC. Hear confirmation. Build onchain identity.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center rounded-full bg-accent-green px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-green-hover transition-colors"
            >
             Become a merchant
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center rounded-full border border-white/20 bg-transparent px-5 py-2.5 text-sm font-medium text-primary hover:bg-white/5 transition-colors"
            >
              How it works
            </a>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <span className="rounded-full bg-secondary/80 border border-white/10 px-4 py-2 text-sm text-primary">QR → USDC</span>
            <span className="rounded-full bg-secondary/80 border border-white/10 px-4 py-2 text-sm text-primary">Revenue ledger</span>
            <span className="rounded-full bg-secondary/80 border border-white/10 px-4 py-2 text-sm text-primary">Savings & credit</span>
          </div>
        </motion.div>

        {/* Right Content - Simple feature card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center lg:justify-end"
        >
          <div className="w-full max-w-xl bg-secondary p-8 rounded-lg">
            <p className="text-xs font-medium uppercase tracking-wider text-accent-green mb-1">
              Merchant checkout · Base
            </p>
            <h2 className="text-2xl font-semibold text-primary mb-6">
              Pay via QR with USDC
            </h2>

            <div className="rounded-lg bg-tertiary p-5 mb-5 overflow-hidden">
              <p className="text-sm font-medium text-primary mb-3">Instant voice confirmation</p>
              <div className="h-24 overflow-hidden relative">
                <div
                  className="flex flex-col gap-2 absolute left-0 right-0 top-0 voice-confirmation-scroll"
                  style={{
                    animation: `voiceScroll 15s linear infinite`,
                  }}
                >
                  {SCROLL_ITEMS.map((item, i) => (
                    <div
                      key={`${i}-${item.amount}-${item.total}`}
                      className="text-primary text-sm leading-relaxed flex items-center justify-between gap-2 py-1.5 border-b border-white/5 last:border-0 shrink-0"
                    >
                      <span className="text-secondary">Payment confirmed.</span>
                      <span>
                        <span className="text-accent-green font-semibold">{item.amount} USDC</span>
                        <span className="text-secondary"> received · Today: </span>
                        <span className="text-accent-green font-semibold">{item.total} USDC</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <style>{`
                @keyframes voiceScroll {
                  0% { transform: translateY(0); }
                  100% { transform: translateY(-33.333%); }
                }
              `}</style>
            </div>

            <p className="text-sm text-secondary leading-relaxed mb-6">
              No screenshots, no SMS fraud. The chain is the source of truth. Available in Ghana and expanding across Africa.
            </p>

            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 text-sm font-medium text-accent-green hover:underline"
            >
              How it works
              <span aria-hidden>→</span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
