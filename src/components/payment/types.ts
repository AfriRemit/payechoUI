export type PayMode = 'open' | 'fixed';

export type PaymentMethod = 'wallet' | 'momo' | 'paystack' | 'other';

export interface PayPayload {
  v?: number;
  proto: string;
  chain?: string;
  vault: string;
  /** Merchant wallet to credit (BankVault architecture). */
  merchant?: string;
  mode: PayMode;
  amount: string | null;
}

