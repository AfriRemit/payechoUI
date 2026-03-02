import type { Token } from './tokens';

// Chain-specific token addresses
export interface ChainTokens {
  [chainId: number]: Token[];
}

// Apechain Testnet (33111) tokens
const apechainTokens: Token[] = [
  { 
    id: 1,
    symbol: 'APE', 
    name: 'ApeCoin', 
    balance: 0.5,
    address: '0xFd8Ee9856bBc5A2042259e6EE31e310fDC08D970',
    pool: ["AFR","USDT"],
    poolId: [1,2],
    img: "https://coin-images.coingecko.com/coins/images/50913/large/apecoin.jpg?1729568016"
  },
  { 
    id: 2,
    symbol: 'USDT', 
    name: 'USDT', 
    balance: 2,
    address: '0xd5Cb99b6f7AC35fB0A8071f7C700b45DA5556EbD',
    pool: ["APE","AFX"],
    poolId: [2,6],
    img:'https://coin-images.coingecko.com/coins/images/39963/large/usdt.png?1724952731'
  },
  { 
    id: 3,
    symbol: 'WETH', 
    name: 'Wrapped Ethereum', 
    balance: 1250,
    address: '0xe7Bf8D39D8Cd29a65fBADD303619Efdfb988610e',
    pool: [],
    poolId: [],
    img: 'https://coin-images.coingecko.com/coins/images/39713/large/WETH.PNG?1723731496',
  },
  { 
    id: 4,
    symbol: 'AFR', 
    name: 'AfriRemit', 
    balance: 1250,
    address: '0x1bFF33dD4139592B43655b3b9a4673aBd7cAeC04',
    pool: ["APE"],
    poolId: [1],
    img: 'https://coin-images.coingecko.com/coins/images/34057/large/LOGOMARK.png?1708356054',
  },
  { 
    id: 5,
    symbol: 'AFX', 
    name: 'AfriStable', 
    balance: 1250,
    address: '0x03C61d50De4b8Faf4FB6DEaF84329ed51A510Fb5',
    pool: ["cZAR", "USDT"],
    poolId: [5,6],
    img: 'https://www.xe.com/svgs/flags/ngn.static.svg',
  },
  { 
    id: 6,
    symbol: 'cNGN', 
    name: 'Crypto Naira', 
    balance: 1250,
    address: '0x4BE9f0d6F4AD844918af0bf3c5e30ceC83240651',
    pool: ["cZAR"],
    poolId: [3],
    img: 'https://www.xe.com/svgs/flags/ngn.static.svg',
  },
  { 
    id: 7,
    symbol: 'cZAR', 
    name: 'Crypto South African Rand', 
    balance: 1250,
    address: '0x2fe5eF2b81D385E9be7d6dA2e8bC1ded407f97D0',
    pool: ["cNGN","AFX"],
    poolId: [3,5],
    img: 'https://www.xe.com/svgs/flags/zar.static.svg',
  },
  { 
    id: 8,
    symbol: 'cGHS', 
    name: 'Crypto Ghanaian Cedi', 
    balance: 1250,
    address: '0x5aC3255EBCf52Ab6E2A43cB27FA4D415dA95d629',
    pool: ["cKES"],
    poolId: [4],
    img: 'https://www.xe.com/svgs/flags/ghs.static.svg',
  },
  { 
    id: 9,
    symbol: 'cKES', 
    name: 'Crypto Kenyan Shilling', 
    balance: 1250,
    address: '0x462D2453c8c36182CaC93598D91A53b40977eBbb',
    pool: ["cGHS"],
    poolId: [4],
    img: 'https://www.xe.com/svgs/flags/kes.static.svg',
  },
];

// Base Sepolia (84532) tokens
const baseSepoliaTokens: Token[] = [
  { 
    id: 1,
    symbol: 'ETH', 
    name: 'Ethereum', 
    balance: 0.5,
    address: '0x4B2D72c1CB89c0B2B320C43BB67fF79f562f5FF4', // Native ETH
    pool: ["AFR","USDT"],
    poolId: [1, 2],
    img: "https://assets.pancakeswap.finance/web/native/1.png"
  },
  { 
    id: 2,
    symbol: 'USDT', 
    name: 'Tether USD', 
    balance: 2,
    address: '0xC7d68ce9A8047D4bF64E6f7B79d388a11944A06E',
    pool: ["ETH", "AFX"],
    poolId: [2, 6],
    img: 'https://coin-images.coingecko.com/coins/images/39963/large/usdt.png?1724952731'
  },
  { 
    id: 3,
    symbol: 'WETH', 
    name: 'Wrapped Ethereum', 
    balance: 1250,
    address: '0x48D2210bd4E72c741F74E6c0E8f356b2C36ebB7A',
    pool: [],
    poolId: [],
    img: 'https://coin-images.coingecko.com/coins/images/39810/large/weth.png?1724139790'
  },
  { 
    id: 4,
    symbol: 'AFR', 
    name: 'AfriRemit', 
    balance: 1250,
    address: '0x8F11F588B1Cc0Bc88687F7d07d5A529d34e5CD84',
    pool: ["ETH"],
    poolId: [1],
    img: 'https://app.mantle.xyz/icons/NetworkMantle.svg'
  },
  { 
    id: 5,
    symbol: 'AFX', 
    name: 'AfriStable', 
    balance: 1250,
    address: '0xCcD4D22E24Ab5f9FD441a6E27bC583d241554a3c',
    pool: ["cZAR", "USDT"],
    poolId: [5, 6],
    img: 'https://www.xe.com/svgs/flags/ngn.static.svg'
  },
  { 
    id: 6,
    symbol: 'cNGN', 
    name: 'Crypto Naira', 
    balance: 1250,
    address: '0x7dd1aD415F58D91BbF76BcC2640cc6FdD44Aa94b',
    pool: ["cZAR"],
    poolId: [3],
    img: 'https://www.xe.com/svgs/flags/ngn.static.svg'
  },
  { 
    id: 7,
    symbol: 'cZAR', 
    name: 'Crypto South African Rand', 
    balance: 1250,
    address: '0x48686EA995462d611F4DA0d65f90B21a30F259A5',
    pool: ["cNGN", "AFX"],
    poolId: [3, 5],
    img: 'https://www.xe.com/svgs/flags/zar.static.svg'
  },
  { 
    id: 8,
    symbol: 'cGHS', 
    name: 'Crypto Ghanaian Cedi', 
    balance: 1250,
    address: '0xaC56E37f70407f279e27cFcf2E31EdCa888EaEe4',
    pool: ["cKES"],
    poolId: [4],
    img: 'https://www.xe.com/svgs/flags/ghs.static.svg'
  },
  { 
    id: 9,
    symbol: 'cKES', 
    name: 'Crypto Kenyan Shilling', 
    balance: 1250,
    address: '0xC0c182d9895882C61C1fC1DF20F858e5E29a4f71',
    pool: ["cGHS"],
    poolId: [4],
    img: 'https://www.xe.com/svgs/flags/kes.static.svg'
  },
];

// Mantle Testnet (5003) tokens
const mantleTokens: Token[] = [
  { 
    id: 1,
    symbol: 'MNT', 
    name: 'Mantle', 
    balance: 0.5,
    address: '0x28ED5341C2e6a2599c550270b824B71dFA078d06', // Native MNT
    pool: ["AFR","USDT"],
    poolId: [1, 2],
    img: "https://app.mantle.xyz/icons/NetworkMantle.svg"
  },
  { 
    id: 2,
    symbol: 'USDT', 
    name: 'Tether USD', 
    balance: 2,
    address: '0x6765e788d5652E22691C6c3385c401a9294B9375',
    pool: ["MNT", "AFX"],
    poolId: [2, 6],
    img: 'https://coin-images.coingecko.com/coins/images/39963/large/usdt.png?1724952731'
  },
  { 
    id: 3,
    symbol: 'WETH', 
    name: 'Wrapped Ethereum', 
    balance: 1250,
    address: '0x25a8e2d1e9883D1909040b6B3eF2bb91feAB2e2f',
    pool: [],
    poolId: [],
    img: 'https://coin-images.coingecko.com/coins/images/39810/large/weth.png?1724139790'
  },
  { 
    id: 4,
    symbol: 'AFR', 
    name: 'AfriRemit', 
    balance: 1250,
    address: '0xC7d68ce9A8047D4bF64E6f7B79d388a11944A06E',
    pool: ["MNT"],
    poolId: [1],
    img: 'https://cdn.moralis.io/MNT/0x6b3595068778dd592e39a122f4f5a5cf09c90fe2.png'
  },
  { 
    id: 5,
    symbol: 'AFX', 
    name: 'AfriStable', 
    balance: 1250,
    address: '0xCcD4D22E24Ab5f9FD441a6E27bC583d241554a3c',
    pool: ["cZAR", "USDT"],
    poolId: [5, 6],
    img: 'https://www.xe.com/svgs/flags/ngn.static.svg'
  },
  { 
    id: 6,
    symbol: 'cNGN', 
    name: 'Crypto Naira', 
    balance: 1250,
    address: '0x48D2210bd4E72c741F74E6c0E8f356b2C36ebB7A',
    pool: ["cZAR"],
    poolId: [3],
    img: 'https://www.xe.com/svgs/flags/ngn.static.svg'
  },
  { 
    id: 7,
    symbol: 'cZAR', 
    name: 'Crypto South African Rand', 
    balance: 1250,
    address: '0x7dd1aD415F58D91BbF76BcC2640cc6FdD44Aa94b',
    pool: ["cNGN", "AFX"],
    poolId: [3, 5],
    img: 'https://www.xe.com/svgs/flags/zar.static.svg'
  },
  { 
    id: 8,
    symbol: 'cGHS', 
    name: 'Crypto Ghanaian Cedi', 
    balance: 1250,
    address: '0x8F11F588B1Cc0Bc88687F7d07d5A529d34e5CD84',
    pool: ["cKES"],
    poolId: [4],
    img: 'https://www.xe.com/svgs/flags/ghs.static.svg'
  },
  { 
    id: 9,
    symbol: 'cKES', 
    name: 'Crypto Kenyan Shilling', 
    balance: 1250,
    address: '0xaC56E37f70407f279e27cFcf2E31EdCa888EaEe4',
    pool: ["cGHS"],
    poolId: [4],
    img: 'https://www.xe.com/svgs/flags/kes.static.svg'
  },
];

// Chain-specific tokens mapping
export const tokensByChain: ChainTokens = {
  33111: apechainTokens, // Apechain Testnet
  5003: mantleTokens,    // Mantle Testnet
  84532: baseSepoliaTokens, // Base Sepolia
};

// Get tokens for a specific chain
export const getTokensForChain = (chainId: number): Token[] => {
  return tokensByChain[chainId] || apechainTokens; // Default to Apechain
};

// Get native token symbol for a chain
export const getNativeTokenSymbol = (chainId: number): string => {
  if (chainId === 5003) return 'MNT';
  if (chainId === 33111) return 'APE';
  if (chainId === 84532) return 'ETH';
  return 'APE'; // Default
};

