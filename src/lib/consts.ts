import { createThirdwebClient } from "thirdweb";
import { defineChain } from "thirdweb/chains";
import type { SmartWalletOptions } from "thirdweb/wallets";
import { APECHAIN_CONFIG, MANTLE_CONFIG, BASE_SEPOLIA_CONFIG } from "./chains";

// Replace this with your client ID string
const clientId = import.meta.env.VITE_THIRDWEB_CLIENT_ID || '9d358fb1c51d6d6g1d6d6g1d6d6g1d6d6g';

// ————————————————————————————————————————————————
// Multichain Support - Define supported chains
// ————————————————————————————————————————————————

// Apechain Testnet
export const apechainChain = defineChain({
  id: APECHAIN_CONFIG.id,
  name: APECHAIN_CONFIG.name,
  nativeCurrency: APECHAIN_CONFIG.nativeCurrency,
  rpc: APECHAIN_CONFIG.rpcUrl,
  blockExplorers: APECHAIN_CONFIG.blockExplorer ? [
    {
      name: "Apechain Explorer",
      url: APECHAIN_CONFIG.blockExplorer,
    },
  ] : [],
  testnet: true,
});

// Mantle Testnet
export const mantleChain = defineChain({
  id: MANTLE_CONFIG.id,
  name: MANTLE_CONFIG.name,
  nativeCurrency: MANTLE_CONFIG.nativeCurrency,
  rpc: MANTLE_CONFIG.rpcUrl,
  blockExplorers: MANTLE_CONFIG.blockExplorer ? [
    {
      name: "Mantle Explorer",
      url: MANTLE_CONFIG.blockExplorer,
    },
  ] : [],
  testnet: true,
});

// Base Sepolia Testnet
export const baseSepoliaChain = defineChain({
  id: BASE_SEPOLIA_CONFIG.id,
  name: BASE_SEPOLIA_CONFIG.name,
  nativeCurrency: BASE_SEPOLIA_CONFIG.nativeCurrency,
  rpc: BASE_SEPOLIA_CONFIG.rpcUrl,
  blockExplorers: BASE_SEPOLIA_CONFIG.blockExplorer ? [
    {
      name: "Base Sepolia Explorer",
      url: BASE_SEPOLIA_CONFIG.blockExplorer,
    },
  ] : [],
  testnet: true,
});

// Default chain (Apechain)
export const chain = apechainChain;

export const client = createThirdwebClient({ clientId });

export const accountAbstraction: SmartWalletOptions = {
  chain,
  sponsorGas: true,
};
