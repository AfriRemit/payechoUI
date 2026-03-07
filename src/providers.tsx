'use client';

import type { ReactNode } from 'react';
import { useState, useMemo } from 'react';
import { WagmiProvider } from 'wagmi';
import { PrivyProvider } from '@privy-io/react-auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { baseSepolia } from 'viem/chains';
import { getConfig } from './wagmi';
import { AuthProvider } from './contexts/AuthContext';
import { EnsureWallet } from './components/web3/EnsureWallet';

const privyAppId = (import.meta.env.VITE_PRIVY_APP_ID as string | undefined)?.trim() ?? '';

function PrivySetupRequired() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-primary p-4">
      <div className="max-w-md rounded-xl border border-white/10 bg-secondary p-6 text-center">
        <h1 className="text-lg font-semibold text-primary mb-2">Privy not configured</h1>
        <p className="text-sm text-secondary mb-4">
          Add <code className="bg-tertiary px-1.5 py-0.5 rounded text-accent-green">VITE_PRIVY_APP_ID</code> to your{' '}
          <code className="bg-tertiary px-1.5 py-0.5 rounded">.env</code> and restart the dev server.
        </p>
        <p className="text-xs text-secondary/80">
          Create an app at <a href="https://dashboard.privy.io" target="_blank" rel="noreferrer" className="text-accent-green hover:underline">dashboard.privy.io</a> to get your App ID.
        </p>
      </div>
    </div>
  );
}

export function AppProviders(props: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const wagmiConfig = useMemo(() => getConfig(), []);

  if (!privyAppId) {
    return <PrivySetupRequired />;
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <PrivyProvider
      appId={privyAppId}
      config={{
        // Enable Google & X in Privy Dashboard → Login methods, or they won't appear
        loginMethods: ['email', 'wallet', 'google', 'twitter', 'apple'],
        appearance: {
          theme: 'dark',
          accentColor: '#22c55e', // accent-green
        },
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'all-users',
          },
        },
        defaultChain: baseSepolia,
        supportedChains: [baseSepolia],
      }}
    >
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <EnsureWallet>
            {props.children}
          </EnsureWallet>
        </AuthProvider>
      </QueryClientProvider>
    </PrivyProvider>
    </WagmiProvider>
  );
}
