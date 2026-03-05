import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { PayHeader } from '../../components/payment/PayHeader';
import { AmountSection } from '../../components/payment/AmountSection';
import { PaymentMethodSection } from '../../components/payment/PaymentMethodSection';
import { ConfirmPaymentModal } from '../../components/payment/ConfirmPaymentModal';
import { PaymentSettingsModal } from '../../components/payment/PaymentSettingsModal';
import { PaymentSuccessModal } from '../../components/payment/PaymentSuccessModal';
import type { PayMode, PayPayload, PaymentMethod } from '../../components/payment/types';

/**
 * Customer payment screen. PC: open /pay to pay to an address (enter vault + amount).
 * Phone: scan QR → /pay?payload=... with vault + amount, then connect wallet and pay.
 */
export default function PayPage() {
  const [searchParams] = useSearchParams();
  const [overrideAmount, setOverrideAmount] = useState('');
  const [manualVaultAddress, setManualVaultAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wallet');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const parsed = useMemo<PayPayload | null>(() => {
    const raw = searchParams.get('payload');
    if (!raw) return null;
    try {
      const decoded = JSON.parse(decodeURIComponent(raw)) as PayPayload;
      if (decoded.proto !== 'payecho') return null;
      return decoded;
    } catch {
      return null;
    }
  }, [searchParams]);

  const mode: PayMode = parsed?.mode ?? 'open';
  const initialAmount = parsed?.amount ?? '';
  const amount = mode === 'fixed' ? initialAmount : overrideAmount;
  const vault = parsed?.vault ?? manualVaultAddress;

  const handleRequestPay = () => {
    if (!amount || paymentMethod !== 'wallet') return;
    if (!parsed && !vault.trim()) return;
    setConfirmOpen(true);
  };

  const handleConfirmPay = () => {
    setConfirmOpen(false);
    // In the real app, this is where we will call the MerchantVault.acceptPayment()
    // function on Base. For now we just confirm visually.
    toast.success(`Payment of ${amount} USDC confirmed (demo only).`);
    setSuccessOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto px-4 py-6 sm:px-6 sm:py-8"
    >
      <div className="bg-secondary rounded-2xl border border-white/10 overflow-hidden">
        <PayHeader parsed={parsed} onToggleSettings={() => setSettingsOpen((open) => !open)} />

        <AmountSection
          mode={mode}
          amount={amount}
          vault={vault}
          onChangeAmount={setOverrideAmount}
          vaultEditable={!parsed}
          onVaultChange={setManualVaultAddress}
        />

        <div className="px-6 pb-6 space-y-4">
          <PaymentMethodSection
            paymentMethod={paymentMethod}
            amount={amount}
            onChangePaymentMethod={setPaymentMethod}
            onRequestPay={handleRequestPay}
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-tertiary/50 border-t border-white/10 flex items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-medium text-secondary">
            Base
          </span>
          <span className="text-secondary/60">·</span>
          <span className="text-[10px] text-secondary">PayEcho Protocol</span>
        </div>
      </div>

      <ConfirmPaymentModal
        open={confirmOpen}
        amount={amount}
        vault={vault}
        onConfirm={handleConfirmPay}
        onCancel={() => setConfirmOpen(false)}
      />

      <PaymentSettingsModal
        open={settingsOpen}
        paymentMethod={paymentMethod}
        onChangePaymentMethod={setPaymentMethod}
        onClose={() => setSettingsOpen(false)}
      />

      <PaymentSuccessModal
        open={successOpen}
        amount={amount}
        onClose={() => setSuccessOpen(false)}
      />
    </motion.div>
  );
}
