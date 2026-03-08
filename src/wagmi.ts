import { http, fallback, createConfig } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { coinbaseWallet, injected } from 'wagmi/connectors';
import { BASE_SEPOLIA_RPC } from './lib/base-rpc';

// Multiple RPC endpoints: when one returns "too many errors" / rate limit, the next is tried.
const baseSepoliaTransport = fallback([
  http(import.meta.env.VITE_BASE_SEPOLIA_RPC || BASE_SEPOLIA_RPC, { batch: false, retryCount: 3 }),
  http('https://base-sepolia-rpc.publicnode.com', { batch: false, retryCount: 2 }),
  http('https://base-sepolia.drpc.org', { batch: false, retryCount: 2 }),
]);

export function getConfig() {
  // Connect to the user's installed wallet (MetaMask, Brave, etc.). No WalletConnect.
  const connectors = [
    injected(),
    coinbaseWallet({
      appName: 'PayEcho',
      preference: 'smartWalletOnly',
      version: '4',
    }),
  ];

  return createConfig({
    chains: [baseSepolia, base],
    connectors,
    transports: {
      [base.id]: http(),
      [baseSepolia.id]: baseSepoliaTransport,
    },
  });
}

declare module 'wagmi' {
  interface Register {
    config: ReturnType<typeof getConfig>;
  }
}
