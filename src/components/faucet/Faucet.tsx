import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ethers } from 'ethers';
import { Droplets } from 'lucide-react';
import { toast } from 'react-toastify';
import { addTokenToMetamask, roundToTwoDecimalPlaces } from '../../lib/utils';
import { useContractInstances } from '../../provider/ContractInstanceProvider';
import { getNativeTokenSymbol } from '../../lib/Tokens/tokensByChain';
import type { TokenSymbol } from '../swap/tokens';
import FaucetTokenSelect from './FaucetTokenSelect';

const Faucet: React.FC = () => {
  const { isConnected, TEST_TOKEN_CONTRACT_INSTANCE, fetchBalance, address, tokenList, currentChainId } = useContractInstances();
 
  // Get native token symbol for current chain
  const nativeTokenSymbol = currentChainId ? getNativeTokenSymbol(currentChainId) : 'APE';
  const [fromToken, setFromToken] = useState<TokenSymbol>('AFR');
  const [isFaucet, setFaucet] = useState(false);
  const token1Address = tokenList.find(t => t.symbol === fromToken)?.address;

  const [token1Amount, setToken1Amount] = useState<string>('');
  const [Bal1, setBal1] = useState(0);
  const [userAllocation, setUserAllocation] = useState<number>(0);
  const maxFaucetLimit = 100; // Maximum tokens that can be minted per address

  useEffect(() => {
    const fetchData = async () => {
      if (!isConnected || !token1Address || !address) return;
      
      try {
        console.log('Fetching balances and allocation...', token1Address);
        const bal1 = await fetchBalance(token1Address);
        const roundedBal1 = bal1 ? roundToTwoDecimalPlaces(parseFloat(bal1)) : 0;
        setBal1(roundedBal1);

        // Fetch user's current allocation from the contract
        const TOKEN_CONTRACT = await TEST_TOKEN_CONTRACT_INSTANCE(token1Address);
        if (TOKEN_CONTRACT) {
          try {
            const allocation = await TOKEN_CONTRACT.getUserTokenAllocation();
            const allocationInEther = parseFloat(ethers.formatEther(allocation));
            setUserAllocation(roundToTwoDecimalPlaces(allocationInEther));
            console.log('User allocation:', allocationInEther);
          } catch (error) {
            console.warn('Could not fetch user allocation:', error);
            setUserAllocation(0);
          }
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [isConnected, fromToken, token1Address, fetchBalance, isFaucet, address, TEST_TOKEN_CONTRACT_INSTANCE]);

  const getFaucet = async () => {
    if (!token1Address || !token1Amount) return;
    
    const requestedAmount = parseFloat(token1Amount);
    if (isNaN(requestedAmount) || requestedAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    // Check if requested amount exceeds the limit
    const totalAfterRequest = userAllocation + requestedAmount;
    if (totalAfterRequest > maxFaucetLimit) {
      const remaining = maxFaucetLimit - userAllocation;
      toast.error(
        `Cannot mint more than ${maxFaucetLimit} ${fromToken} total. You have already minted ${userAllocation.toFixed(2)} ${fromToken}. Maximum remaining: ${remaining > 0 ? remaining.toFixed(2) : '0'} ${fromToken}`
      );
      return;
    }
    
    // Set loading state immediately for user feedback
    setFaucet(true);
    
    try {
      const TOKEN_CONTRACT = await TEST_TOKEN_CONTRACT_INSTANCE(token1Address);
      if (!TOKEN_CONTRACT) {
        setFaucet(false);
        console.error('Failed to get token contract');
        toast.error('Failed to get token contract');
        return;
      }
      
      const GET_FAUCET = await TOKEN_CONTRACT.faucet(token1Amount);
      
      // Show immediate feedback after MetaMask confirmation
      toast.info(`Transaction submitted! Waiting for confirmation... (${GET_FAUCET.hash.slice(0, 10)}...)`);
      console.log(`Transaction submitted - ${GET_FAUCET.hash}`);
      
      // Wait for confirmation in background
      await GET_FAUCET.wait();
      console.log(`Transaction confirmed - ${GET_FAUCET.hash}`);
      toast.success(`Successfully received ${token1Amount} ${fromToken}! Transaction confirmed.`);
      setFaucet(false);
      
      // Clear input and refresh balance and allocation after successful faucet
      setToken1Amount('');
      const bal1 = await fetchBalance(token1Address);
      const roundedBal1 = bal1 ? roundToTwoDecimalPlaces(parseFloat(bal1)) : 0;
      setBal1(roundedBal1);
      
      // Refresh allocation
      if (TOKEN_CONTRACT && address) {
        try {
          const allocation = await TOKEN_CONTRACT.getUserTokenAllocation();
          const allocationInEther = parseFloat(ethers.formatEther(allocation));
          setUserAllocation(roundToTwoDecimalPlaces(allocationInEther));
        } catch (error) {
          console.warn('Could not refresh allocation:', error);
        }
      }
    } catch (error: any) {
      setFaucet(false);
      console.error(error);
      let errorMessage = 'Transaction failed';
      
      // Parse error message
      if (error?.reason) {
        errorMessage = error.reason;
      } else if (error?.message) {
        errorMessage = error.message;
        // Check for common error patterns
        if (errorMessage.includes("can't mint more token") || errorMessage.includes("cannot mint more")) {
          errorMessage = `Cannot mint more tokens. You have already minted ${userAllocation.toFixed(2)}/${maxFaucetLimit} ${fromToken}. Maximum remaining: ${(maxFaucetLimit - userAllocation).toFixed(2)} ${fromToken}`;
        }
      }
      
      toast.error(`Faucet failed: ${errorMessage}`);
    }
  };

  const handleTokenChange = (newToken: TokenSymbol) => {
    setFromToken(newToken);
    setToken1Amount('');
  };

  const requestedAmount = token1Amount ? parseFloat(token1Amount) : 0;
  const canGetFaucet = isConnected && 
    token1Amount && 
    requestedAmount > 0 && 
    !isFaucet &&
    (userAllocation + requestedAmount) <= maxFaucetLimit;

  // Helper function to format balance
  const formatBalance = (balance: number): string => {
    if (balance === 0) return '0';
    if (balance >= 1000) {
      return parseFloat(balance.toFixed(2)).toString();
    }
    return parseFloat(balance.toFixed(4)).toString();
  };

  return (
    <section className="px-6 py-8">
      <motion.div 
        className="max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent-green/20 flex items-center justify-center">
              <Droplets className="w-5 h-5 text-accent-green" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-primary">Faucet</h2>
              <p className="text-sm text-secondary">Get RemiFi Testnet Tokens</p>
            </div>
          </div>
        </div>

        {/* Token input card - mirror Swap styles */}
        <div className="bg-secondary rounded-xl p-5 space-y-3 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-secondary">Amount to request</span>
            {address && !isNaN(Bal1) && (
              <span className="text-sm text-secondary">
                Balance: {formatBalance(Bal1)} {fromToken}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <input
                type="number"
                disabled={!isConnected}
                value={token1Amount}
                onChange={(e) => setToken1Amount(e.target.value)}
                inputMode="decimal"
                className="w-full bg-transparent outline-none focus:outline-none text-4xl font-semibold text-primary placeholder:text-secondary"
                placeholder="0.0"
                min="0"
                step="0.01"
              />
              <div className="text-sm text-secondary mt-1">
                Max Faucet: {maxFaucetLimit} {fromToken} | Used: {userAllocation.toFixed(2)}/{maxFaucetLimit} {fromToken}
                {userAllocation > 0 && (
                  <span className="text-accent-green ml-2">
                    (Remaining: {(maxFaucetLimit - userAllocation).toFixed(2)} {fromToken})
                  </span>
                )}
              </div>
            </div>

            <FaucetTokenSelect 
              symbol={fromToken} 
              onChange={handleTokenChange}
              title="Select token"
              excludeTokens={[nativeTokenSymbol]}
            />
          </div>
        </div>

        {/* Get Faucet button */}
        <div className="mt-6">
          <motion.button
            type="button"
            onClick={getFaucet}
            disabled={!canGetFaucet}
            className={`w-full px-6 py-4 rounded-2xl text-lg font-semibold shadow-lg transition-colors duration-200 ${
              canGetFaucet
                ? 'bg-accent-green text-white hover:bg-accent-green-hover'
                : 'bg-tertiary text-secondary cursor-not-allowed'
            }`}
            whileHover={canGetFaucet ? { scale: 1.02 } : {}}
            whileTap={canGetFaucet ? { scale: 0.98 } : {}}
          >
            {isFaucet ? 'Getting Faucet...' : canGetFaucet ? 'Get Faucet' : !isConnected ? 'Connect Wallet' : 'Enter amount'}
          </motion.button>
        </div>

        {/* Add to Metamask button */}
        <div className="mt-4">
          <motion.button
            type="button"
            onClick={() => token1Address && addTokenToMetamask(token1Address, fromToken, 18)}
            className="w-full px-6 py-4 rounded-2xl text-lg font-semibold bg-tertiary text-primary hover:bg-quaternary transition-colors duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Add {fromToken} to Metamask
          </motion.button>
        </div>
      </motion.div>
    </section>
  );
};

export default Faucet;

