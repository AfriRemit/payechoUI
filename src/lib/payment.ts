/**
 * Payment utilities — USDC amounts, QR URL building.
 * USDC uses 6 decimals on Base.
 */

export const USDC_DECIMALS = 6;

/**
 * Convert human-readable USDC amount (e.g. "25.50") to 6-decimal raw units.
 */
export function parseUSDC(amountStr: string): bigint {
  const cleaned = amountStr.replace(/,/g, '').trim();
  if (!cleaned || isNaN(Number(cleaned))) return 0n;
  const [whole, frac = ''] = cleaned.split('.');
  const padded = frac.padEnd(USDC_DECIMALS, '0').slice(0, USDC_DECIMALS);
  return BigInt(whole + padded);
}

/**
 * Format raw USDC (6 decimals) to display string.
 */
export function formatUSDC(raw: bigint): string {
  const str = raw.toString().padStart(USDC_DECIMALS + 1, '0');
  const intPart = str.slice(0, -USDC_DECIMALS) || '0';
  const decPart = str.slice(-USDC_DECIMALS).replace(/0+$/, '') || '0';
  return decPart ? `${intPart}.${decPart}` : intPart;
}

/**
 * Build payment URL for QR — customers scan and land on /pay.
 * BankVault: vault = BankVault address, merchant = wallet to credit.
 */
export function buildPaymentUrl(vaultAddress: string, merchantAddress: string, mode: 'open' | 'fixed', fixedAmount?: string): string {
  const base = typeof window !== 'undefined'
    ? window.location.origin
    : import.meta.env.VITE_APP_URL || 'https://payecho.xyz';
  const params = new URLSearchParams();
  params.set('vault', vaultAddress);
  params.set('merchant', merchantAddress);
  params.set('mode', mode);
  if (mode === 'fixed' && fixedAmount && Number(fixedAmount) > 0) {
    params.set('amount', fixedAmount);
  }
  return `${base}/pay?${params.toString()}`;
}

/**
 * Parse payment params from URL search (vault, merchant, amount, mode).
 */
export function parsePaymentParams(search: string): { vault: string; merchant: string; mode: 'open' | 'fixed'; amount: string | null } {
  const params = new URLSearchParams(search);
  const vault = params.get('vault') || '';
  const merchant = params.get('merchant') || '';
  const mode = (params.get('mode') || 'open') as 'open' | 'fixed';
  const amount = params.get('amount');
  return { vault, merchant, mode, amount: amount || null };
}
