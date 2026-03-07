import { useMemo, useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAccount, useConnect, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { PayHeader } from '../../components/payment/PayHeader';
import { AmountSection } from '../../components/payment/AmountSection';
import { PaymentMethodSection } from '../../components/payment/PaymentMethodSection';
import { ConfirmPaymentModal } from '../../components/payment/ConfirmPaymentModal';
import { PaymentSettingsModal } from '../../components/payment/PaymentSettingsModal';
import { PaymentSuccessModal } from '../../components/payment/PaymentSuccessModal';
import type { PayMode, PayPayload, PaymentMethod } from '../../components/payment/types';
import { parseUSDC } from '../../lib/payment';
import { getContracts } from '../../lib/contracts';
import { getApiBaseUrl } from '../../lib/api';
import { BANK_VAULT_ABI } from '../../lib/ABI/BankVault_ABI';
import { baseSepolia } from 'wagmi/chains';

const ERC20_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

const ZERO_REF: `0x${string}` = '0x0000000000000000000000000000000000000000000000000000000000000000';

/**
 * Customer payment screen. Scan QR → /pay?payload=... or /pay?vault=&merchant=&amount=
 * BankVault: vault = pool address, merchant = wallet to credit. Customer approves USDC then BankVault.acceptPayment(merchant, amount, ref).
 */
export default function PayPage() {
  const [searchParams] = useSearchParams();
  const [overrideAmount, setOverrideAmount] = useState('');
  const [manualVaultAddress, setManualVaultAddress] = useState('');
  const [manualMerchantAddress, setManualMerchantAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wallet');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { address: walletAddress, chain } = useAccount();
  const { connect, connectors, isPending: isConnectPending } = useConnect();
  const contracts = getContracts(chain?.id ?? baseSepolia.id);
  const { writeContract: writeApprove, data: approveHash, isPending: _isApprovePending, reset: resetApprove } = useWriteContract();
  const { writeContract: writeAcceptPayment, data: payHash, isPending: _isPayPending, reset: resetPay } = useWriteContract();
  const { isLoading: _isApproveConfirming, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ hash: approveHash });
  const { isLoading: _isPayConfirming, isSuccess: isPaySuccess } = useWaitForTransactionReceipt({ hash: payHash });

  const pendingPayRef = useRef<{ vault: string; merchant: string; amountWei: bigint } | null>(null);
  const acceptPaymentSentRef = useRef(false);

  const parsed = useMemo<PayPayload | null>(() => {
    const raw = searchParams.get('payload');
    if (raw) {
      try {
        const decoded = JSON.parse(decodeURIComponent(raw)) as PayPayload;
        if (decoded.proto !== 'payecho') return null;
        return decoded;
      } catch {
        return null;
      }
    }
    const vault = searchParams.get('vault') ?? '';
    const merchant = searchParams.get('merchant') ?? '';
    const mode = (searchParams.get('mode') || 'open') as PayMode;
    const amount = searchParams.get('amount');
    if (!vault) return null;
    return { proto: 'payecho', vault, merchant, mode, amount: amount || null };
  }, [searchParams]);

  const mode: PayMode = parsed?.mode ?? 'open';
  const initialAmount = parsed?.amount ?? searchParams.get('amount') ?? '';
  const amount = mode === 'fixed' ? initialAmount : overrideAmount;
  const vault = parsed?.vault ?? manualVaultAddress;
  const merchant = parsed?.merchant ?? searchParams.get('merchant') ?? manualMerchantAddress;

  const handleRequestPay = () => {
    if (!amount || paymentMethod !== 'wallet') return;
    if (!parsed && !vault.trim()) return;
    setConfirmOpen(true);
  };

  const handleConfirmPay = async () => {
    setConfirmOpen(false);
    if (paymentMethod !== 'wallet' || !amount || !vault.trim()) {
      toast.success(`Payment of ${amount} USDC confirmed (demo only).`);
      setSuccessOpen(true);
      return;
    }
    const amountWei = parseUSDC(amount);
    if (amountWei === 0n) {
      toast.error('Invalid amount');
      return;
    }
    if (!walletAddress) {
      toast.error('Connect your wallet to pay');
      return;
    }
    if (!merchant.trim()) {
      toast.error('Merchant address required (scan QR or enter vault + merchant)');
      return;
    }
    pendingPayRef.current = { vault, merchant, amountWei };
    acceptPaymentSentRef.current = false;
    try {
      writeApprove(
        {
          address: contracts.usdcAddress as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [vault as `0x${string}`, amountWei],
        },
        {
          onError: (e) => {
            toast.error(e.message ?? 'Approve failed');
            pendingPayRef.current = null;
          },
        },
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Approve failed');
      pendingPayRef.current = null;
    }
  };

  useEffect(() => {
    if (!approveHash || !isApproveSuccess || acceptPaymentSentRef.current) return;
    const pending = pendingPayRef.current;
    if (!pending) return;
    acceptPaymentSentRef.current = true;
    writeAcceptPayment(
      {
        address: pending.vault as `0x${string}`,
        abi: BANK_VAULT_ABI,
        functionName: 'acceptPayment',
        args: [pending.merchant as `0x${string}`, pending.amountWei, ZERO_REF],
      },
      {
        onError: (e) => {
          toast.error(e.message ?? 'Payment failed');
          acceptPaymentSentRef.current = false;
        },
      },
    );
  }, [approveHash, isApproveSuccess, writeAcceptPayment]);

  useEffect(() => {
    if (!payHash || !isPaySuccess) return;
    toast.success(`Payment of ${amount} USDC confirmed.`);
    setSuccessOpen(true);
    pendingPayRef.current = null;
    acceptPaymentSentRef.current = false;
    resetApprove();
    resetPay();
    // Speak transaction confirmation (no auth required for announce)
    const speak = async () => {
      try {
        let volume = 1;
        let quietStart = '22:00', quietEnd = '07:00';
        try {
          const raw = localStorage.getItem('payecho_voice_settings');
          if (raw) {
            const s = JSON.parse(raw) as Record<string, unknown>;
            if (typeof s.volume === 'number') volume = s.volume / 100;
            if (typeof s.quietStart === 'string') quietStart = s.quietStart;
            if (typeof s.quietEnd === 'string') quietEnd = s.quietEnd;
          }
        } catch { /* ignore */ }
        const now = new Date();
        const [sh, sm] = quietStart.split(':').map(Number);
        const [eh, em] = quietEnd.split(':').map(Number);
        const nowM = now.getHours() * 60 + now.getMinutes();
        const startM = sh * 60 + sm, endM = eh * 60 + em;
        const inQuiet = startM <= endM ? (nowM >= startM && nowM < endM) : (nowM >= startM || nowM < endM);
        if (inQuiet) return;
        const res = await fetch(`${getApiBaseUrl()}/api/voice/announce`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ template: 'payment_sent', amount: amount || '0' }),
        });
        if (!res.ok) return;
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.volume = volume;
        audio.play().catch(() => {});
        audio.onended = () => URL.revokeObjectURL(url);
      } catch {
        // ignore voice errors
      }
    };
    speak();
  }, [payHash, isPaySuccess, amount, resetApprove, resetPay]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto px-4 py-6 sm:px-6 sm:py-8"
    >
      <div className="bg-secondary rounded-2xl border border-white/10 overflow-hidden">
        <PayHeader parsed={parsed} onToggleSettings={() => setSettingsOpen((open) => !open)} />

        {!walletAddress && (
          <div className="mx-6 mt-4 p-4 rounded-xl bg-accent-green/10 border border-accent-green/20">
            <p className="text-sm font-medium text-primary mb-2">No account needed — connect your wallet to pay</p>
            <p className="text-xs text-secondary mb-3">Use MetaMask, Coinbase Wallet, or any supported wallet. You don’t need to sign up or log in.</p>
            <div className="flex flex-wrap gap-2">
              {connectors.map((c) => (
                <button
                  key={c.uid}
                  type="button"
                  onClick={() => connect({ connector: c })}
                  disabled={isConnectPending}
                  className="rounded-full bg-accent-green px-4 py-2 text-sm font-medium text-white hover:bg-accent-green-hover disabled:opacity-50 transition-colors"
                >
                  {isConnectPending ? 'Connecting…' : `Connect ${c.name}`}
                </button>
              ))}
            </div>
          </div>
        )}

        <AmountSection
          mode={mode}
          amount={amount}
          vault={vault}
          merchant={merchant}
          onChangeAmount={setOverrideAmount}
          vaultEditable={!parsed}
          onVaultChange={setManualVaultAddress}
          merchantEditable={!parsed}
          onMerchantChange={setManualMerchantAddress}
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
        merchant={merchant}
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
