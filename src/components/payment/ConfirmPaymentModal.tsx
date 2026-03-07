interface ConfirmPaymentModalProps {
  open: boolean;
  amount: string;
  vault: string;
  merchant?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmPaymentModal({ open, amount, vault, merchant, onConfirm, onCancel }: ConfirmPaymentModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-secondary border border-white/15 shadow-xl px-6 py-5 text-left space-y-3">
        <p className="text-base font-semibold text-primary">Confirm payment</p>
        <p className="text-sm text-secondary">
          You are about to pay{' '}
          <span className="font-semibold text-primary">{amount || '—'} USDC</span> from your connected wallet to the
          payment pool; the amount will be credited to the merchant.
        </p>
        <p className="text-xs font-mono text-primary break-all bg-tertiary/60 border border-white/10 rounded-lg px-3 py-2">
          Pool: {vault}
        </p>
        {merchant ? (
          <p className="text-xs font-mono text-primary break-all bg-tertiary/60 border border-white/10 rounded-lg px-3 py-2">
            Merchant (to credit): {merchant}
          </p>
        ) : null}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-full bg-accent-green px-4 py-2 text-xs font-semibold text-white hover:bg-accent-green-hover transition-colors"
          >
            Confirm payment
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-primary hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

