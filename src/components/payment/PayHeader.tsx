import { Settings } from 'lucide-react';
import type { PayPayload } from './types';

interface PayHeaderProps {
  parsed: PayPayload | null;
  onToggleSettings: () => void;
}

export function PayHeader({ parsed, onToggleSettings }: PayHeaderProps) {
  return (
    <div className="bg-gradient-to-br from-accent-green/15 to-transparent px-6 py-5 border-b border-white/10">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-accent-green/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-primary">
              {parsed ? 'Pay merchant' : 'Pay to an address'}
            </h2>
            <p className="text-xs text-secondary">Pay with USDC on Base</p>
            <p className="text-[10px] text-secondary/80 mt-0.5">Payment goes to the merchant; funds are collected in the shared vault.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onToggleSettings}
          aria-label="Payment settings"
          className="w-9 h-9 rounded-full bg-tertiary/70 border border-white/10 flex items-center justify-center text-secondary hover:text-primary hover:bg-tertiary transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

