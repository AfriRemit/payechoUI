import { useRef } from 'react';
import { useQRCode } from '../../hooks/useQRCode';

interface QRDisplayProps {
  mode: 'open' | 'fixed';
  fixedAmount: string;
  onDownload?: () => void;
  onPrint?: () => void;
  vaultAddress: string;
  merchantAddress: string;
}

export function QRDisplay({
  mode,
  fixedAmount,
  onDownload,
  onPrint,
  vaultAddress,
  merchantAddress,
}: QRDisplayProps) {
  const qrImageRef = useRef<HTMLImageElement>(null);
  const { qrDataUrl, error } = useQRCode(vaultAddress, merchantAddress, mode, fixedAmount);

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `payecho-qr-${mode}${mode === 'fixed' && fixedAmount ? `-${fixedAmount}usdc` : ''}.png`;
    a.click();
    onDownload?.();
  };

  const handlePrint = () => {
    if (!qrDataUrl) return;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`
      <html><head><title>PayEcho QR</title>
      <style>body{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;font-family:sans-serif;background:#fff;}
      img{max-width:320px;height:auto;}
      p{color:#666;margin-top:1rem;font-size:14px;}</style></head>
      <body><img src="${qrDataUrl}" alt="PayEcho QR" /><p>Scan to pay USDC · Base</p></body></html>
    `);
    w.document.close();
    w.focus();
    w.print();
    w.close();
    onPrint?.();
  };

  return (
    <div className="flex flex-col h-full min-h-0 w-full">
      <div className="flex flex-col items-center justify-center flex-1 min-h-0">
        {qrDataUrl && !error ? (
          <>
            <div className="rounded-lg bg-white p-2 shadow-md">
              <img
                ref={qrImageRef}
                src={qrDataUrl}
                alt="PayEcho payment QR"
                className="w-28 h-28 md:w-32 md:h-32 object-contain"
              />
            </div>
            <p className="text-xs text-secondary mt-2 font-medium">Scan to pay USDC · Base</p>
            <p className="text-[11px] text-secondary/80 mt-0.5">
              {mode === 'open' ? 'Customer enters amount' : fixedAmount ? `${fixedAmount} USDC` : 'Set amount'}
            </p>
          </>
        ) : (
          <div className="w-28 h-28 rounded-lg bg-tertiary border border-white/10 flex items-center justify-center text-secondary text-xs">
            {error || 'Generating…'}
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-3 pt-3 border-t border-white/10 shrink-0">
        <button
          type="button"
          onClick={handleDownload}
          disabled={!qrDataUrl}
          className="flex-1 rounded-lg bg-accent-green px-3 py-2 text-xs font-semibold text-white hover:bg-accent-green-hover disabled:opacity-50 disabled:pointer-events-none transition-colors flex items-center justify-center gap-1.5"
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download
        </button>
        <button
          type="button"
          onClick={handlePrint}
          disabled={!qrDataUrl}
          className="flex-1 rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-primary hover:bg-white/5 disabled:opacity-50 disabled:pointer-events-none transition-colors flex items-center justify-center gap-1.5"
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print
        </button>
      </div>
    </div>
  );
}
