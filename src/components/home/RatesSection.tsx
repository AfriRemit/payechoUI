import React from 'react';
import { motion } from 'framer-motion';

const RatesSection: React.FC = () => {
  return (
    <section id="how-it-works" className="px-6 py-16 bg-primary">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Content - Steps card */}
        <div className="bg-secondary rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-bold text-primary mb-6">How Payecho works</h3>
          <ol className="space-y-4">
            <li className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-tertiary flex items-center justify-center text-sm font-semibold text-primary">
                1
              </div>
              <div>
                <div className="text-primary font-medium">Merchant shows a QR</div>
                <div className="text-sm text-secondary">QR encodes the merchant vault address and optional fixed amount.</div>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-tertiary flex items-center justify-center text-sm font-semibold text-primary">
                2
              </div>
              <div>
                <div className="text-primary font-medium">Customer pays USDC</div>
                <div className="text-sm text-secondary">Funds land on Base and the vault emits a verifiable event.</div>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-tertiary flex items-center justify-center text-sm font-semibold text-primary">
                3
              </div>
              <div>
                <div className="text-primary font-medium">AI voice confirms instantly</div>
                <div className="text-sm text-secondary">“Payment confirmed. You received X USDC.” No screenshot fraud.</div>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-tertiary flex items-center justify-center text-sm font-semibold text-primary">
                4
              </div>
              <div>
                <div className="text-primary font-medium">Revenue becomes identity</div>
                <div className="text-sm text-secondary">Onchain history powers credit scoring and embedded finance.</div>
              </div>
            </li>
          </ol>
        </div>

        {/* Right Content */}
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl lg:text-4xl font-semibold text-primary leading-tight tracking-tight">
            The onchain financial OS for informal merchants.
          </h2>
          <p className="text-lg text-secondary leading-relaxed">
            Payecho is built to eliminate payment fraud and financial invisibility by combining QR payments,
            real-time onchain events, and a revenue ledger that unlocks savings and revenue-based lending.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/15 bg-secondary/20 p-5">
              <div className="text-sm text-secondary">Settlement</div>
              <div className="text-xl font-semibold text-primary mt-1">Base (L2)</div>
            </div>
            <div className="rounded-2xl border border-white/15 bg-secondary/20 p-5">
              <div className="text-sm text-secondary">Primary token</div>
              <div className="text-xl font-semibold text-primary mt-1">USDC</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default RatesSection;
