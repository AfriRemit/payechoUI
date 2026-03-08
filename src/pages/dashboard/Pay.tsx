import { useMemo, useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAccount, useConnect, useDisconnect, useSwitchChain, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { AmountSection } from '../../components/payment/AmountSection';
import { ConfirmPaymentModal } from '../../components/payment/ConfirmPaymentModal';
import { PaymentSuccessModal } from '../../components/payment/PaymentSuccessModal';
import type { PayMode, PayPayload, PaymentMethod } from '../../components/payment/types';
import { parseUSDC, formatUSDC } from '../../lib/payment';
import { getContracts, getBankVaultAddress } from '../../lib/contracts';
import { getApiBaseUrl } from '../../lib/api';
import { BANK_VAULT_ABI } from '../../lib/ABI/BankVault_ABI';
import { ERC20_ABI as ERC20_FULL_ABI } from '../../lib/ABI/ERC20_ABI';
import { baseSepolia } from 'wagmi/chains';
import { Settings } from 'lucide-react';

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
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

/**
 * Customer payment screen. Scan QR → /pay?payload=... or /pay?vault=&merchant=&amount=
 * BankVault: vault = pool address, merchant = wallet to credit. Customer approves USDC then BankVault.acceptPayment(merchant, amount, ref).
 */
export default function PayPage() {
  const [searchParams] = useSearchParams();
  const [overrideAmount, setOverrideAmount] = useState('');
  const [manualMerchantAddress, setManualMerchantAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wallet');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [walletMenuOpen, setWalletMenuOpen] = useState(false);

  const { address: walletAddress, chain } = useAccount();
  const { connect, connectors, isPending: isConnectPending } = useConnect();
  const { disconnect } = useDisconnect();

  // Same as desktop: connect to installed wallet so user can sign transactions (approve + acceptPayment).
  const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod|webOS|Mobi|BlackBerry|IEMobile/i.test(navigator.userAgent);
  const connectConnector = useMemo(() => {
    const injected = connectors.find((c) => c.id === 'injected');
    const coinbase = connectors.find((c) => c.id?.toLowerCase().includes('coinbase'));
    return injected ?? coinbase ?? connectors[0];
  }, [connectors]);
  const { switchChain, isPending: isSwitchPending } = useSwitchChain();
  const contracts = getContracts(chain?.id ?? baseSepolia.id);
  const targetChainId = baseSepolia.id; // MVP: Base Sepolia
  const isCorrectChain = !!chain && chain.id === targetChainId;
  const needsSwitch = !!walletAddress && !!chain && !isCorrectChain;

  const { writeContract: writeApprove, data: approveHash, isPending: _isApprovePending, reset: resetApprove } = useWriteContract();
  const { writeContract: writeAcceptPayment, data: payHash, isPending: _isPayPending, reset: resetPay } = useWriteContract();
  const { data: usdcBalanceRaw } = useReadContract({
    address: contracts.usdcAddress as `0x${string}`,
    abi: ERC20_FULL_ABI,
    functionName: 'balanceOf',
    args: walletAddress ? [walletAddress] : undefined,
  });
  const usdcBalance = useMemo(() => (usdcBalanceRaw !== undefined ? formatUSDC(usdcBalanceRaw) : null), [usdcBalanceRaw]);
  const { isLoading: _isApproveConfirming, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ hash: approveHash });
  const { isLoading: _isPayConfirming, isSuccess: isPaySuccess } = useWaitForTransactionReceipt({ hash: payHash });

  const pendingPayRef = useRef<{ vault: string; merchant: string; amountWei: bigint } | null>(null);
  const acceptPaymentSentRef = useRef(false);
  const walletMenuRef = useRef<HTMLDivElement>(null);

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
    const vault = searchParams.get('vault') ?? getBankVaultAddress();
    const merchant = searchParams.get('merchant') ?? '';
    const mode = (searchParams.get('mode') || 'open') as PayMode;
    const amount = searchParams.get('amount');
    if (!vault || vault === ZERO_ADDRESS) return null;
    return { proto: 'payecho', vault, merchant, mode, amount: amount || null };
  }, [searchParams]);

  const mode: PayMode = parsed?.mode ?? 'open';
  const initialAmount = parsed?.amount ?? searchParams.get('amount') ?? '';
  const amount = mode === 'fixed' ? initialAmount : overrideAmount;
  const vault = parsed?.vault ?? getBankVaultAddress();
  const merchant = parsed?.merchant ?? searchParams.get('merchant') ?? manualMerchantAddress;

  const amountWeiForCheck = useMemo(() => parseUSDC(amount || '0'), [amount]);
  const hasInsufficientBalance = walletAddress && usdcBalanceRaw !== undefined && amountWeiForCheck > 0n && usdcBalanceRaw < amountWeiForCheck;

  const handleRequestPay = () => {
    if (!amount || paymentMethod !== 'wallet') return;
    if ((!vault || vault === ZERO_ADDRESS)) return;
    if (hasInsufficientBalance) {
      toast.error('Insufficient USDC balance');
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirmPay = async () => {
    setConfirmOpen(false);
    if (paymentMethod !== 'wallet' || !amount || !vault.trim()) {
      toast.success(`Payment of ${amount} USDC confirmed.`);
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
    if (!isCorrectChain) {
      toast.error('Switch to Base Sepolia to pay');
      return;
    }
    if (!merchant.trim()) {
      toast.error('Merchant address required (scan QR or enter vault + merchant)');
      return;
    }
    if (usdcBalanceRaw !== undefined && amountWei > usdcBalanceRaw) {
      toast.error('Insufficient USDC balance');
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

  useEffect(() => {
    if (!walletMenuOpen) return;
    const onOutside = (e: MouseEvent) => {
      if (walletMenuRef.current && !walletMenuRef.current.contains(e.target as Node)) setWalletMenuOpen(false);
    };
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [walletMenuOpen]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto px-4 py-6 sm:px-6 sm:py-8"
    >
      <div className="bg-secondary rounded-2xl border border-white/10 overflow-hidden">
        <div className="px-6 py-5 border-b border-white/10 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-primary">{parsed ? 'Pay merchant' : 'Pay'}</h2>
            <p className="text-sm text-secondary mt-0.5">Pay with USDC (wallet) or local payment (Mobile Money, Paystack).</p>
          </div>
          <div className="relative shrink-0" ref={walletMenuRef}>
            <button
              type="button"
              onClick={() => setWalletMenuOpen((o) => !o)}
              className="p-2 rounded-lg text-secondary hover:text-primary hover:bg-white/10 transition-colors touch-manipulation"
              aria-label="Wallet settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            {walletMenuOpen && (
              <div className="absolute right-0 top-full mt-1 py-1 min-w-[160px] rounded-xl border border-white/10 bg-secondary shadow-lg z-10">
                {walletAddress ? (
                  <>
                    <p className="px-3 py-2 text-xs text-secondary truncate max-w-[200px]" title={walletAddress}>
                      {walletAddress.slice(0, 6)}…{walletAddress.slice(-4)}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        disconnect();
                        setWalletMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-primary hover:bg-white/10"
                    >
                      Disconnect
                    </button>
                  </>
                ) : (
                    <button
                      type="button"
                      onClick={() => {
                        connect(
                          { connector: connectConnector },
                          {
                            onError: (err) => {
                              toast.error(err?.message ?? 'Connection failed');
                            },
                          },
                        );
                        setWalletMenuOpen(false);
                      }}
                      disabled={isConnectPending}
                      className="w-full px-3 py-2 text-left text-sm text-primary hover:bg-white/10 disabled:opacity-50"
                    >
                      {isConnectPending ? 'Connecting…' : 'Connect wallet'}
                    </button>
                )}
              </div>
            )}
          </div>
        </div>

        {!parsed && isMobile && (
          <div className="mx-6 mt-2 rounded-xl bg-tertiary/50 border border-white/10 px-4 py-3">
            <p className="text-sm font-medium text-primary">Scan to pay</p>
            <p className="text-xs text-secondary mt-0.5">Open your camera or QR app and scan the merchant&apos;s PayEcho QR code. You&apos;ll be taken here with the amount and merchant pre-filled. No account required.</p>
          </div>
        )}

        <AmountSection
          mode={mode}
          amount={amount}
          vault={vault}
          merchant={merchant}
          onChangeAmount={setOverrideAmount}
          vaultEditable={false}
          merchantEditable={!parsed}
          onMerchantChange={setManualMerchantAddress}
        />

        <div className="px-6 pb-6 space-y-4">
          <p className="text-xs font-medium text-secondary">How do you want to pay?</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod('wallet')}
              className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                paymentMethod === 'wallet'
                  ? 'border-accent-green bg-accent-green/10 text-primary'
                  : 'border-white/10 bg-tertiary/50 text-secondary hover:border-white/20'
              }`}
            >
              <span className="block text-sm font-semibold">USDC</span>
              <span className="block text-[10px] mt-0.5 opacity-80">Wallet · Base</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('momo')}
              className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                paymentMethod !== 'wallet'
                  ? 'border-accent-green bg-accent-green/10 text-primary'
                  : 'border-white/10 bg-tertiary/50 text-secondary hover:border-white/20'
              }`}
            >
              <span className="block text-sm font-semibold">Local</span>
              <span className="block text-[10px] mt-0.5 opacity-80">Momo · Paystack</span>
            </button>
          </div>

          {paymentMethod === 'wallet' ? (
            <div className="rounded-xl border border-white/10 bg-tertiary/30 p-4 space-y-3">
              {!walletAddress ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      connect(
                        { connector: connectConnector },
                        {
                          onError: (err) => {
                            toast.error(err?.message ?? 'Connection failed');
                          },
                        },
                      );
                    }}
                    disabled={isConnectPending}
                    className="w-full rounded-lg bg-accent-green px-4 py-3 text-sm font-semibold text-white hover:bg-accent-green-hover disabled:opacity-50 active:scale-[0.98] touch-manipulation"
                  >
                    {isConnectPending ? 'Connecting…' : 'Connect wallet'}
                  </button>
                </>
              ) : needsSwitch ? (
                <>
                  <p className="text-xs text-secondary">Wrong network. Switch to Base Sepolia to pay with USDC.</p>
                  <button
                    type="button"
                    onClick={() => switchChain({ chainId: targetChainId })}
                    disabled={isSwitchPending}
                    className="w-full rounded-lg bg-amber-500 px-4 py-3 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
                  >
                    {isSwitchPending ? 'Switching…' : 'Switch to Base Sepolia'}
                  </button>
                </>
              ) : (
                <>
                  <p className="text-xs text-secondary">Connected · Base Sepolia</p>
                  {usdcBalance !== null && (
                    <p className="text-sm font-medium text-primary">
                      Balance: <span className="text-accent-green">{usdcBalance} USDC</span>
                    </p>
                  )}
                  {hasInsufficientBalance && (
                    <p className="text-xs text-amber-500">Insufficient USDC balance. You need {amount} USDC.</p>
                  )}
                  <button
                    type="button"
                    disabled={!amount || !vault.trim() || vault === ZERO_ADDRESS || !!hasInsufficientBalance}
                    onClick={handleRequestPay}
                    className="w-full rounded-lg bg-accent-green px-4 py-3 text-sm font-semibold text-white hover:bg-accent-green-hover disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Pay {amount || '0'} USDC
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 bg-tertiary/30 p-4 space-y-3">
              <p className="text-sm font-medium text-primary">Pay with local payment</p>
              <p className="text-xs text-secondary">Use Mobile Money (Momo), Paystack (card/bank), or other local options. No crypto wallet needed.</p>
              <ul className="space-y-2 text-xs">
                <li className="flex items-center gap-2 text-secondary">
                  <span className="rounded bg-white/10 px-1.5 py-0.5 font-medium">Momo</span>
                  Mobile Money · Coming soon
                </li>
                <li className="flex items-center gap-2 text-secondary">
                  <span className="rounded bg-white/10 px-1.5 py-0.5 font-medium">Paystack</span>
                  Card / bank · Coming soon
                </li>
              </ul>
              <p className="text-[10px] text-secondary/80">We’re adding these so you can pay in your local currency. For now, use USDC (wallet) above.</p>
            </div>
          )}
        </div>

        <div className="px-6 py-3 bg-tertiary/50 border-t border-white/10 flex items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-medium text-secondary">Base</span>
          <span className="text-secondary/60">·</span>
          <span className="text-[10px] text-secondary">PayEcho</span>
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

      <PaymentSuccessModal
        open={successOpen}
        amount={amount}
        onClose={() => setSuccessOpen(false)}
      />
    </motion.div>
  );
}
