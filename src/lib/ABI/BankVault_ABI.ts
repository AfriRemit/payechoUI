/**
 * BankVault ABI — single payment pool. acceptPayment(merchant, amount, ref) credits the merchant.
 */

export const BANK_VAULT_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'merchant', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'bytes32', name: 'ref', type: 'bytes32' },
    ],
    name: 'acceptPayment',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;
