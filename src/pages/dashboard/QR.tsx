import { useState } from 'react';
import { motion } from 'framer-motion';
import { QRDisplay } from '../../components/merchant/QRDisplay';
import { BASE_SEPOLIA_CHAIN_ID } from '../../lib/base-rpc';
import { getMerchantVaultAddress } from '../../lib/contracts';

export default function QR() {
  const [mode, setMode] = useState<'open' | 'fixed'>('open');
  const [fixedAmount, setFixedAmount] = useState('');

  const vaultAddress = getMerchantVaultAddress(BASE_SEPOLIA_CHAIN_ID);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-primary">Create QR code</h1>
        <p className="text-secondary text-sm mt-1">
          Customers scan to pay USDC on Base. Open or fixed amount.
        </p>
      </div>

      <div className="bg-secondary rounded-xl border border-white/10 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          <div className="p-5 order-2 lg:order-1 flex min-h-0">
            <QRDisplay mode={mode} fixedAmount={fixedAmount} vaultAddress={vaultAddress} />
          </div>
          <div className="p-5 order-1 lg:order-2 border-t lg:border-t-0 lg:border-l border-white/10">
            <h2 className="text-base font-semibold text-primary mb-3">Amount type</h2>
            <div className="flex rounded-lg bg-tertiary/80 p-1 border border-white/5">
              <button
                type="button"
                onClick={() => setMode('open')}
                className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                  mode === 'open' ? 'bg-accent-green text-white shadow-sm' : 'text-secondary hover:text-primary'
                }`}
              >
                Open amount
              </button>
              <button
                type="button"
                onClick={() => setMode('fixed')}
                className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                  mode === 'fixed' ? 'bg-accent-green text-white shadow-sm' : 'text-secondary hover:text-primary'
                }`}
              >
                Fixed amount
              </button>
            </div>
            {mode === 'fixed' && (
              <div className="mt-3">
                <label className="block text-xs font-medium text-secondary mb-2">Amount (USDC)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={fixedAmount}
                  onChange={(e) => setFixedAmount(e.target.value)}
                  placeholder="e.g. 25.00"
                  className="w-full rounded-lg bg-tertiary border border-white/10 px-4 py-2.5 text-sm text-primary placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-accent-green/50"
                />
              </div>
            )}
            <div className="mt-4 pt-4 border-t border-white/10">
              <h2 className="text-base font-semibold text-primary mb-2">Vault address</h2>
              <p className="font-mono text-xs text-secondary break-all bg-tertiary/50 rounded-lg px-3 py-2 border border-white/5">
                {vaultAddress}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
