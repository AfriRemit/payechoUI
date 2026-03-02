import React, { createContext, useState, useEffect, useMemo, type ReactNode } from 'react';
import { ethers } from 'ethers';
import { useActiveAccount, useActiveWallet, useActiveWalletChain} from 'thirdweb/react';
import { PRICE_ABI } from '../lib/ABI/PriceAPI_ABI.ts';
import { Token_ABI} from '../lib/ABI/TestToken_ABI.ts';
import { SWAP_ABI } from '../lib/ABI/Swap_ABI.ts';
import { AfriStable_ABI } from '../lib/ABI/AfriStable_ABI.ts';
import {Saving_ABI} from '../lib/ABI/Saving_ABI.ts'
import { getChainConfig, isChainSupported, SUPPORTED_CHAINS, DEFAULT_CHAIN } from '../lib/chains';
import { getTokensForChain, getNativeTokenSymbol } from '../lib/Tokens/tokensByChain';

// Import or define the Token type
import type { Token } from '../lib/Tokens/tokens.ts';

// Safe error helpers
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  try {
    return JSON.stringify(error);
  } catch {
    return 'Unknown error';
  }
};

const getErrorInfo = (error: unknown) => {
  if (error instanceof Error) {
    return { name: error.name, message: error.message, stack: error.stack };
  }
  return { name: 'UnknownError', message: getErrorMessage(error), stack: undefined as string | undefined };
};

// Export contract addresses getter (chain-aware)
export const getContractAddresses = (chainId: number) => {
  const chainConfig = getChainConfig(chainId);
  if (!chainConfig) {
    // Fallback to default chain
    return DEFAULT_CHAIN.contracts;
  }
  return chainConfig.contracts;
};

// Export CONTRACT_ADDRESSES for backward compatibility (uses default chain)
export const CONTRACT_ADDRESSES = DEFAULT_CHAIN.contracts;

// Enhanced context interface with Thirdweb integration
interface ContractInstancesContextType {
  fetchBalance: (faucetAddress: string) => Promise<string | undefined>;
  SWAP_CONTRACT_INSTANCE: () => Promise<ethers.Contract | null>;
  AFRISTABLE_CONTRACT_INSTANCE: () => Promise<ethers.Contract | null>;
  TEST_TOKEN_CONTRACT_INSTANCE: (tokenAddress: string) => Promise<ethers.Contract | null>;
  PRICEAPI_CONTRACT_INSTANCE: () => Promise<ethers.Contract | null>;
  SAVING_CONTRACT_INSTANCE: () => Promise<ethers.Contract | null>;
  signer: ethers.Signer | null;
  provider: ethers.JsonRpcProvider | null;
  address: string | null;
  nativeBalance: string | null;
  tokenList: Token[];
  currentChainId: number | undefined;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  networkError: string | null;
  connectionError: string | null;
  // Manual connection method
  reconnectSigner: () => Promise<void>;
}

export const ContractInstances = createContext<ContractInstancesContextType | undefined>(undefined);

// Provider component with updated Thirdweb integration
export const ContractInstanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Thirdweb hooks
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const activeChain = useActiveWalletChain();

  // Local state
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [provider, setProvider] = useState<ethers.JsonRpcProvider | null>(null);
  const [nativeBalance, setNativeBalance] = useState<string>('0');
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Derived state
  const address = account?.address || null;
  const isConnected = !!account && !!wallet;
  const currentChainId = activeChain?.id;
  const currentChainConfig = useMemo(() => {
    if (!currentChainId) return null;
    return getChainConfig(currentChainId);
  }, [currentChainId]);
  
  const isCorrectNetwork = currentChainId ? isChainSupported(currentChainId) : false;
  const supportedChainIds = SUPPORTED_CHAINS.map(chain => chain.id);
  
  // Get tokens for current chain
  const tokenList = useMemo(() => {
    if (!currentChainId) {
      const defaultTokens = getTokensForChain(DEFAULT_CHAIN.id);
      console.log(`[ContractInstanceProvider] No chain ID, using default chain tokens (${DEFAULT_CHAIN.id}):`, defaultTokens.map(t => t.symbol));
      return defaultTokens;
    }
    const tokens = getTokensForChain(currentChainId);
    console.log(`[ContractInstanceProvider] Chain changed to ${currentChainId}, tokens updated:`, tokens.map(t => t.symbol));
    return tokens;
  }, [currentChainId]);

  // Initialize provider with Thirdweb RPC (chain-aware)
  useEffect(() => {
    const initializeProvider = () => {
      try {
        // Use current chain config or default
        const chainConfig = currentChainConfig || DEFAULT_CHAIN;
        const jsonRpcProvider = new ethers.JsonRpcProvider(chainConfig.rpcUrl);
        setProvider(jsonRpcProvider);
        console.log(`Thirdweb RPC provider initialized for chain ${chainConfig.id} (${chainConfig.name})`);
      } catch (error) {
        console.error('Failed to initialize Thirdweb RPC provider:', error);
        setConnectionError('Failed to initialize RPC provider');
      }
    };

    initializeProvider();
  }, [currentChainConfig]);

  // Effect to create signer from active account with Thirdweb RPC
  useEffect(() => {
    const createSignerFromAccount = async () => {
      if (account && wallet && isConnected && isCorrectNetwork && provider) {
        try {
          console.log('Starting signer creation process...');
          console.log('Account:', account.address);
          console.log('Wallet:', wallet);
          console.log('Provider available:', !!provider);

          // Check if the browser has ethereum provider for signing
          if (typeof window !== 'undefined' && window.ethereum) {
            console.log('Ethereum provider found, creating browser provider...');
            
            // Create browser provider for signing transactions
            const browserProvider = new ethers.BrowserProvider(window.ethereum);
            console.log('Browser provider created successfully');
            
            // Get the signer
            console.log('Getting signer from browser provider...');
            const ethSigner = await browserProvider.getSigner();
            console.log('Signer obtained from browser provider');
            
            // Verify the signer address matches the account
            const signerAddress = await ethSigner.getAddress();
            console.log('Signer address:', signerAddress);
            console.log('Account address:', account.address);
            
            if (signerAddress.toLowerCase() === account.address.toLowerCase()) {
              // Try to connect signer to our Thirdweb RPC provider
              try {
                console.log('Connecting signer to Thirdweb RPC provider...');
                const connectedSigner = ethSigner.connect(provider);
                setSigner(connectedSigner);
                setConnectionError(null);
                console.log('✅ Signer connected with Thirdweb RPC provider successfully');
              } catch (connectError) {
                console.warn('Failed to connect signer to Thirdweb RPC, using browser signer:', connectError);
                // Fallback: use the browser signer directly
                setSigner(ethSigner);
                setConnectionError(null);
                console.log('✅ Using browser signer as fallback');
              }
            } else {
              console.warn('❌ Signer address mismatch with account');
              console.warn('Expected:', account.address.toLowerCase());
              console.warn('Got:', signerAddress.toLowerCase());
              setSigner(null);
              setConnectionError('Address mismatch between wallet and signer');
            }
          } else {
            console.warn('❌ No ethereum provider found in window object');
            console.log('Available providers:', Object.keys(window).filter(key => key.includes('ethereum') || key.includes('wallet')));
            setSigner(null);
            setConnectionError('No ethereum provider available');
          }
        } catch (error) {
          console.error('❌ Failed to create signer from account:', error);
          console.error('Error details:', getErrorInfo(error));
          setSigner(null);
          setConnectionError(`Failed to create signer: ${getErrorMessage(error)}`);
        }
      } else {
        console.log('Signer creation conditions not met:');
        console.log('- Account:', !!account);
        console.log('- Wallet:', !!wallet);
        console.log('- Is Connected:', isConnected);
        console.log('- Is Correct Network:', isCorrectNetwork);
        console.log('- Provider:', !!provider);
        setSigner(null);
      }
    };

    createSignerFromAccount();
  }, [account, wallet, isConnected, isCorrectNetwork, provider]);

  // Alternative signer creation method for Thirdweb compatibility
  useEffect(() => {
    const createThirdwebCompatibleSigner = async () => {
      if (account && wallet && isConnected && isCorrectNetwork) {
        try {
          console.log('Attempting Thirdweb-compatible signer creation...');
          
          // Method 1: Try to get signer from wallet adapter
          if (wallet.getChain && wallet.switchChain) {
            try {
              // Ensure we're on a supported chain
              const currentChain = await wallet.getChain();
              if (!currentChain || !isChainSupported(currentChain.id)) {
                console.log('Switching to default supported chain...');
                const defaultChain = DEFAULT_CHAIN;
                await wallet.switchChain({
                  id: defaultChain.id,
                  name: defaultChain.name,
                  rpc: defaultChain.rpcUrl,
                  nativeCurrency: defaultChain.nativeCurrency
                });
              }
            } catch (chainError) {
              console.warn('Chain switch failed:', chainError);
            }
          }

          // Method 2: Try EIP-1193 provider approach
          if (typeof window !== 'undefined' && window.ethereum) {
            console.log('Trying EIP-1193 provider approach...');
            
            // Request account access
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            // Create provider and signer
            const web3Provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await web3Provider.getSigner();
            
            // Verify network
            const network = await web3Provider.getNetwork();
            const networkChainId = Number(network.chainId);
            console.log('Current network:', networkChainId);
            
            if (isChainSupported(networkChainId)) {
              setSigner(signer);
              setConnectionError(null);
              console.log('✅ EIP-1193 signer created successfully');
              return;
            } else {
              const supportedIds = supportedChainIds.join(', ');
              console.warn('Unsupported network detected:', networkChainId, 'supported:', supportedIds);
              setNetworkError(`Unsupported network. Please switch to one of: ${supportedIds}`);
            }
          }

          // Method 3: Direct provider connection (fallback)
          if (provider) {
            console.log('Using read-only provider as fallback...');
            // This won't allow transactions but will allow contract reads
            setConnectionError('Connected in read-only mode. Some features may be limited.');
          }

        } catch (error) {
          console.error('All signer creation methods failed:', error);
          setConnectionError(`Signer creation failed: ${getErrorMessage(error)}`);
        }
      }
    };

    // Run alternative method if primary method fails
    if (isConnected && !signer && !connectionError?.includes('No ethereum provider')) {
      createThirdwebCompatibleSigner();
    }
  }, [account, wallet, isConnected, isCorrectNetwork, provider, signer, connectionError]);

  // Updated effect to fetch native balance using signer's provider (like in second file)
  useEffect(() => {
    const fetchNativeBalance = async () => {
      if (signer && address && isConnected && isCorrectNetwork) {
        try {
          // Use the signer's provider first (like in the working second file)
          const signerProvider = signer.provider;
          if (signerProvider) {
            console.log('Fetching native balance using signer provider...');
            const balance = await signerProvider.getBalance(address);
            setNativeBalance(ethers.formatEther(balance));
            console.log('✅ Native balance fetched successfully using signer provider:', ethers.formatEther(balance));
          } else if (provider) {
            // Fallback to Thirdweb RPC provider
            console.log('Fallback: Fetching native balance using Thirdweb RPC provider...');
            const balance = await provider.getBalance(address);
            setNativeBalance(ethers.formatEther(balance));
            console.log('✅ Native balance fetched successfully using RPC provider:', ethers.formatEther(balance));
          } else {
            console.warn('No provider available for balance fetch');
            setNativeBalance('0');
          }
        } catch (error) {
          console.error('Failed to fetch native balance:', error);
          setNativeBalance('0');
        }
      } else {
        console.log('Native balance fetch conditions not met:');
        console.log('- Signer:', !!signer);
        console.log('- Address:', !!address);
        console.log('- Is Connected:', isConnected);
        console.log('- Is Correct Network:', isCorrectNetwork);
        setNativeBalance('0');
      }
    };

    fetchNativeBalance();
  }, [signer, address, isConnected, isCorrectNetwork, provider]);

  // Effect to handle network changes
  useEffect(() => {
    if (isConnected && currentChainId && !isChainSupported(currentChainId)) {
      const supportedIds = supportedChainIds.join(', ');
      setNetworkError(`Unsupported network (Chain ID: ${currentChainId}). Please switch to one of: ${supportedIds}`);
    } else if (isConnected && isCorrectNetwork) {
      setNetworkError(null);
    }
  }, [currentChainId, isConnected, isCorrectNetwork, supportedChainIds]);

  // Effect to clear state when disconnected
  useEffect(() => {
    if (!isConnected) {
      setConnectionError(null);
      setNetworkError(null);
      setSigner(null);
      setNativeBalance('0');
    }
  }, [isConnected]);

  // Fetch balance function
  const fetchBalance = async (faucetAddress: string): Promise<string | undefined> => {
    try {
      if (!address || !isConnected || !isCorrectNetwork) {
        throw new Error('Wallet not connected or wrong network');
      }

      const token = tokenList.find(token => token.address === faucetAddress);
      if (!token) {
        throw new Error('Token not found');
      }

      // Check if it's the native token (chain-aware)
      const nativeSymbol = currentChainId ? getNativeTokenSymbol(currentChainId) : 'APE';
      if (token.symbol === nativeSymbol) {
        return nativeBalance || '0';
      }

      // Special case for AFX token
      if (token.symbol === 'AFX') {
        const AFRI_CONTRACT = await AFRISTABLE_CONTRACT_INSTANCE();
        if (!AFRI_CONTRACT) {
          throw new Error('Unable to create AFX token contract instance');
        }
        const balance = await AFRI_CONTRACT.balanceOf(address);
        const formattedBalance = ethers.formatEther(balance);
        return formattedBalance;
      }

      // For other ERC20 tokens
      const TOKEN_CONTRACT = await TEST_TOKEN_CONTRACT_INSTANCE(faucetAddress);
      if (!TOKEN_CONTRACT) {
        throw new Error('Unable to create token contract instance');
      }
      const balance = await TOKEN_CONTRACT.balanceOf(address);
      const formattedBalance = ethers.formatEther(balance);
      return formattedBalance;

    } catch (error) {
      console.error('Error fetching balance:', error);
      return undefined;
    }
  };

  // Contract instance functions with Thirdweb RPC provider (chain-aware)
  const SWAP_CONTRACT_INSTANCE = async (): Promise<ethers.Contract | null> => {
    // For read-only operations (pool info, etc.), only provider is needed
    // For write operations, wallet connection is required
    if (!provider) {
      console.warn('Provider not available for swap contract.');
      return null;
    }
    
    // Use current chain or default chain
    const chainId = currentChainId || DEFAULT_CHAIN.id;
    const contractAddresses = getContractAddresses(chainId);
    
    // For write operations, ensure signer is available
    if (isConnected && !signer) {
      console.warn('Signer not available. Contract instance may not support write operations.');
    }
    
    // Use signer if available for write operations, otherwise use provider for read-only
    const signerOrProvider = signer || provider;
    return new ethers.Contract(contractAddresses.swapAddress, SWAP_ABI, signerOrProvider);
  };

  const PRICEAPI_CONTRACT_INSTANCE = async (): Promise<ethers.Contract | null> => {
    // Price feed is read-only, doesn't require wallet connection
    if (!provider) {
      console.warn('Provider not available for price feed.');
      return null;
    }
    
    // Use current chain or default chain for price feed
    const chainId = currentChainId || DEFAULT_CHAIN.id;
    const contractAddresses = getContractAddresses(chainId);
    
    // Use provider directly (read-only operations don't need signer)
    return new ethers.Contract(contractAddresses.priceFeedAddress, PRICE_ABI, provider);
  };

  const TEST_TOKEN_CONTRACT_INSTANCE = async (TOKEN_ADDRESS: string): Promise<ethers.Contract | null> => {
    if (!provider || !isConnected || !isCorrectNetwork) {
      console.warn('Provider not available, wallet not connected, or wrong network.');
      return null;
    }
    
    // For write operations, ensure signer is available
    if (!signer) {
      console.warn('Signer not available. Contract instance may not support write operations.');
    }
    
    const signerOrProvider = signer || provider;
    return new ethers.Contract(TOKEN_ADDRESS, Token_ABI, signerOrProvider);
  };

  const AFRISTABLE_CONTRACT_INSTANCE = async (): Promise<ethers.Contract | null> => {
    if (!provider || !isConnected || !isCorrectNetwork || !currentChainId) {
      console.warn('Provider not available, wallet not connected, or wrong network.');
      return null;
    }
    
    // For write operations, ensure signer is available
    if (!signer) {
      console.warn('Signer not available. Contract instance may not support write operations.');
    }
    
    const contractAddresses = getContractAddresses(currentChainId);
    const signerOrProvider = signer || provider;
    return new ethers.Contract(contractAddresses.afriStableAddress, AfriStable_ABI, signerOrProvider);
  };

  const SAVING_CONTRACT_INSTANCE = async (): Promise<ethers.Contract | null> => {
    if (!provider || !isConnected || !isCorrectNetwork || !currentChainId) {
      console.warn('Provider not available, wallet not connected, or wrong network.');
      return null;
    }
    
    const contractAddresses = getContractAddresses(currentChainId);
    const signerOrProvider = signer || provider;
    return new ethers.Contract(contractAddresses.savingAddress, Saving_ABI, signerOrProvider);
  };

  // Manual reconnection function
  const reconnectSigner = async (): Promise<void> => {
    try {
      console.log('Manual signer reconnection initiated...');
      setConnectionError(null);
      
      if (!isConnected) {
        throw new Error('Wallet not connected. Please connect your wallet first.');
      }

      if (!isCorrectNetwork || !currentChainId) {
        const supportedIds = supportedChainIds.join(', ');
        throw new Error(`Unsupported network. Please switch to one of: ${supportedIds}`);
      }

      // Force reconnection
      if (window.ethereum) {
        // Request account access again
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        
        if (accounts.length === 0) {
          throw new Error('No accounts available');
        }

        // Create fresh provider and signer
        const freshProvider = new ethers.BrowserProvider(window.ethereum);
        const freshSigner = await freshProvider.getSigner();
        
        // Verify the address
        const signerAddress = await freshSigner.getAddress();
        if (account && signerAddress.toLowerCase() === account.address.toLowerCase()) {
          setSigner(freshSigner);
          console.log('✅ Manual signer reconnection successful');
        } else {
          throw new Error('Address mismatch after reconnection');
        }
      } else {
        throw new Error('Ethereum provider not available');
      }
    } catch (error) {
      console.error('Manual reconnection failed:', error);
      setConnectionError(`Manual reconnection failed: ${getErrorMessage(error)}`);
      throw error;
    }
  };

  const contextValue: ContractInstancesContextType = {
    fetchBalance,
    SWAP_CONTRACT_INSTANCE,
    AFRISTABLE_CONTRACT_INSTANCE,
    TEST_TOKEN_CONTRACT_INSTANCE,
    PRICEAPI_CONTRACT_INSTANCE,
    SAVING_CONTRACT_INSTANCE,
    signer,
    provider,
    address,
    nativeBalance,
    tokenList,
    currentChainId,
    isConnected,
    isCorrectNetwork,
    networkError,
    connectionError,
    reconnectSigner,
  };

  return (
    <ContractInstances.Provider value={contextValue}>
      {children}
    </ContractInstances.Provider>
  );
};

export default ContractInstanceProvider;

// Custom hook to use the context
export const useContractInstances = (): ContractInstancesContextType => {
  const context = React.useContext(ContractInstances);
  if (context === undefined) {
    throw new Error('useContractInstances must be used within a ContractInstanceProvider');
  }
  return context;
};