import { useEffect, useState, useMemo } from 'react';
import QRCode from 'qrcode';

export interface QRPayload {
  v: number;
  proto: string;
  chain: string;
  vault: string;
  merchant: string;
  mode: 'open' | 'fixed';
  amount: string | null;
}

export function useQRCode(vaultAddress: string, merchantAddress: string, mode: 'open' | 'fixed', fixedAmount: string) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const payload: QRPayload = useMemo(
    () => ({
      v: 1,
      proto: 'payecho',
      chain: 'base',
      vault: vaultAddress,
      merchant: merchantAddress,
      mode,
      amount: mode === 'fixed' && fixedAmount ? fixedAmount : null,
    }),
    [vaultAddress, merchantAddress, mode, fixedAmount],
  );

  useEffect(() => {
    let cancelled = false;
    const generate = async () => {
      try {
        setError(null);
        const configuredOrigin = import.meta.env.VITE_PUBLIC_APP_URL as string | undefined;
        const origin =
          configuredOrigin && configuredOrigin.length > 0
            ? configuredOrigin.replace(/\/+$/, '')
            : typeof window !== 'undefined' && window.location
              ? window.location.origin
              : 'https://app.payecho.xyz';
        const text = `${origin}/pay?payload=${encodeURIComponent(JSON.stringify(payload))}`;
        const url = await QRCode.toDataURL(text, {
          margin: 1,
          width: 512,
          errorCorrectionLevel: 'M',
        });
        if (!cancelled) setQrDataUrl(url);
      } catch {
        if (!cancelled) {
          setError('Could not generate QR');
          setQrDataUrl(null);
        }
      }
    };
    generate();
    return () => {
      cancelled = true;
    };
  }, [payload]);

  return { qrDataUrl, error };
}
