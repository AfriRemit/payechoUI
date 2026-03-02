// Chain configuration for multichain support

export interface ChainConfig {
  id: number;
  name: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrl: string;
  blockExplorer?: string;
  contracts: {
    swapAddress: string;
    priceFeedAddress: string;
    afriStableAddress: string;
    savingAddress: string;
  };
}

// Apechain Testnet Configuration
export const APECHAIN_CONFIG: ChainConfig = {
  id: 33111,
  name: 'Apechain Testnet',
  nativeCurrency: {
    name: 'Ape',
    symbol: 'APE',
    decimals: 18,
  },
  rpcUrl: `https://33111.rpc.thirdweb.com/${import.meta.env.VITE_THIRDWEB_CLIENT_ID}`,
  blockExplorer: 'https://explorer.apechain.io',
  contracts: {
    swapAddress: '0xEaD869D31BAb571Eb50A4BEdb111e22716E5975D',
    priceFeedAddress: '0xa7d203707Ab0055e188150079d4a89e1adDfbCaB',
    afriStableAddress: '0xc5737615ed39b6B089BEDdE11679e5e1f6B9E768',
    savingAddress: '0xe85b044a579e8787afFfBF46691a01E7052cF6D0',
  },
};

// Mantle Testnet Configuration
export const MANTLE_CONFIG: ChainConfig = {
  id: 5003,
  name: 'Mantle Testnet',
  nativeCurrency: {
    name: 'Mantle',
    symbol: 'MNT',
    decimals: 18,
  },
  rpcUrl: `https://5003.rpc.thirdweb.com/${import.meta.env.VITE_THIRDWEB_CLIENT_ID}`,
  blockExplorer: 'https://explorer.testnet.mantle.xyz',
  contracts: {
    swapAddress: '0x013b0CA4E4559339F43682B7ac05479eD48E694f',
    priceFeedAddress: '0xF34EC7483183b0B50E7b50e538ADd13De231eD9b',
    afriStableAddress: '0xc5737615ed39b6B089BEDdE11679e5e1f6B9E768', // Update if different
    savingAddress: '0xe85b044a579e8787afFfBF46691a01E7052cF6D0', // Update if different
  },
};

// Base Sepolia Testnet Configuration
export const BASE_SEPOLIA_CONFIG: ChainConfig = {
  id: 84532,
  name: 'Base Sepolia',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrl: `https://84532.rpc.thirdweb.com/${import.meta.env.VITE_THIRDWEB_CLIENT_ID}`,
  blockExplorer: 'https://sepolia-explorer.base.org',
  contracts: {
    swapAddress: '0x2B2068a831e7C7B2Ac4D97Cd293F934d2625aB69',
    priceFeedAddress: '0x2Efddc5a4FEc6a4308c7206B0E0E9b3898520108',
    afriStableAddress: '0xc5737615ed39b6B089BEDdE11679e5e1f6B9E768', // Update if different
    savingAddress: '0xe85b044a579e8787afFfBF46691a01E7052cF6D0', // Update if different
  },
};

// Supported chains
export const SUPPORTED_CHAINS: ChainConfig[] = [APECHAIN_CONFIG, MANTLE_CONFIG, BASE_SEPOLIA_CONFIG];

// Get chain config by ID
export const getChainConfig = (chainId: number): ChainConfig | undefined => {
  return SUPPORTED_CHAINS.find(chain => chain.id === chainId);
};

// Get default chain (Apechain)
export const DEFAULT_CHAIN = APECHAIN_CONFIG;

// Check if chain is supported
export const isChainSupported = (chainId: number): boolean => {
  return SUPPORTED_CHAINS.some(chain => chain.id === chainId);
};

