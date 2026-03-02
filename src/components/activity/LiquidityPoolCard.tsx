import React, { useState, useEffect } from 'react';
import type { TokenSymbol } from '../swap/tokens';
import { useContractInstances } from '../../provider/ContractInstanceProvider';
import { ethers } from 'ethers';

interface LiquidityPool {
  id: string;
  tokenA: TokenSymbol;
  tokenB: TokenSymbol;
  liquidity: number;
  apy: number;
  volume24h: number;
  fees24h: number;
  yourShare: number;
  yourFees: number;
}

interface LiquidityPoolCardProps {
  pool: LiquidityPool;
  onAddLiquidity?: (poolId: string) => void;
  onRemoveLiquidity?: (poolId: string) => void;
  onClaimFees?: (poolId: string) => void;
}

const LiquidityPoolCard: React.FC<LiquidityPoolCardProps> = ({ 
  pool, 
  onAddLiquidity, 
  onRemoveLiquidity, 
  onClaimFees 
}) => {
  const { SWAP_CONTRACT_INSTANCE, PRICEAPI_CONTRACT_INSTANCE, address, isConnected, tokenList } = useContractInstances();
  const [poolData, setPoolData] = useState(pool);
  const [loading, setLoading] = useState(false);
  const [resolvedPoolId, setResolvedPoolId] = useState<string>(pool.id);

  const tokenAMeta = tokenList.find((token) => token.symbol === poolData.tokenA);
  const tokenBMeta = tokenList.find((token) => token.symbol === poolData.tokenB);

  // Helper function to get USD value for a token amount
  const getTokenUSDValue = async (tokenAddress: string, amount: number, PRICE_FEED_CONTRACT: any) => {
    try {
      const priceInWei = await PRICE_FEED_CONTRACT.getLatestPrice(tokenAddress);
      const price = parseFloat(ethers.formatEther(priceInWei));
      const usdValue = amount * price;
      return usdValue;
    } catch (error) {
      console.error(`     ❌ Error getting price for token ${tokenAddress}:`, error);
      return 0;
    }
  };

  // Helper function to get total pool liquidity in USD
  const getTotalPoolLiquidity = async (tokenA: any, tokenB: any, PRICE_FEED_CONTRACT: any, SWAP_CONTRACT: any) => {
    try {
      const [poolBalance1, poolBalance2] = await SWAP_CONTRACT.getPoolSize(tokenA.address, tokenB.address);
      
      const totalAmount0Formatted = parseFloat(ethers.formatEther(poolBalance1));
      const totalAmount1Formatted = parseFloat(ethers.formatEther(poolBalance2));
      
      // If pool balances are 0, return 0 early
      if (totalAmount0Formatted === 0 && totalAmount1Formatted === 0) {
        return 0;
      }
      
      const [usdValue0, usdValue1] = await Promise.all([
        getTokenUSDValue(tokenA.address, totalAmount0Formatted, PRICE_FEED_CONTRACT),
        getTokenUSDValue(tokenB.address, totalAmount1Formatted, PRICE_FEED_CONTRACT)
      ]);
      
      return usdValue0 + usdValue1;
    } catch (error: any) {
      // Silently return 0 on error - pool might not exist yet
      return 0;
    }
  };

  // Fetch pool data (works without wallet connection - shows public pool info)
  useEffect(() => {
    const fetchPoolData = async () => {
      if (!SWAP_CONTRACT_INSTANCE || !PRICEAPI_CONTRACT_INSTANCE) {
        return;
      }

      try {
        setLoading(true);

        const SWAP_CONTRACT = await SWAP_CONTRACT_INSTANCE();
        const PRICE_FEED_CONTRACT = await PRICEAPI_CONTRACT_INSTANCE();

        if (!SWAP_CONTRACT || !PRICE_FEED_CONTRACT) {
          setLoading(false);
          return;
        }

        // Find token objects
        const tokenAObj = tokenList.find(t => t.symbol === (pool.tokenA as string));
        const tokenBObj = tokenList.find(t => t.symbol === (pool.tokenB as string));

        if (!tokenAObj || !tokenBObj || !tokenAObj.address || !tokenBObj.address) {
          setLoading(false);
          return;
        }

        // Resolve actual on-chain pool id for this pair
        try {
          const onChainPoolId: bigint = await SWAP_CONTRACT.findPool(tokenAObj.address, tokenBObj.address);
          const idStr = onChainPoolId.toString();
          if (idStr !== '0') {
            setResolvedPoolId(idStr);
          }
        } catch (e) {
          console.warn('Failed to resolve pool id from contract:', e);
        }

        // Get total pool liquidity in USD (public data - no wallet needed)
        const totalPoolLiquidity = await getTotalPoolLiquidity(
          tokenAObj,
          tokenBObj,
          PRICE_FEED_CONTRACT,
          SWAP_CONTRACT
        );

        // User liquidity data (only fetch if wallet is connected)
        let userLiquidity = 0;
        let userShare = 0;
        let userFees = 0;

        if (isConnected && address) {
          try {
            // Fetch user liquidity from contract
            const [pools, amounts0, amounts1] = await SWAP_CONTRACT.myLiquidities(address);
            
            // Find user's position for this pool
            const poolIndex = pools.findIndex((p: bigint) => p.toString() === resolvedPoolId);
            if (poolIndex !== -1) {
              const userAmount0 = parseFloat(ethers.formatEther(amounts0[poolIndex]));
              const userAmount1 = parseFloat(ethers.formatEther(amounts1[poolIndex]));

              const [userUsdValue0, userUsdValue1] = await Promise.all([
                getTokenUSDValue(tokenAObj.address, userAmount0, PRICE_FEED_CONTRACT),
                getTokenUSDValue(tokenBObj.address, userAmount1, PRICE_FEED_CONTRACT)
              ]);

              userLiquidity = userUsdValue0 + userUsdValue1;
              userShare = totalPoolLiquidity > 0 ? (userLiquidity / totalPoolLiquidity) : 0;

              // Calculate fees (placeholder - you may need to implement this)
              userFees = 0;
            }
          } catch (error) {
            console.warn(`Could not fetch user liquidity:`, error);
          }
        }

        // Update pool data with fetched values
        setPoolData({
          ...pool,
          liquidity: totalPoolLiquidity, // Don't round - keep full precision
          yourShare: userShare,
          yourFees: userFees,
          fees24h: userFees, // Using user fees for 24h fees
          volume24h: 0, // Placeholder - implement if you have this data
          apy: pool.apy // Keep original APY or calculate if needed
        });

      } catch (error) {
        console.error(`❌ Error fetching pool data for ${pool.id}:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchPoolData();
  }, [SWAP_CONTRACT_INSTANCE, PRICEAPI_CONTRACT_INSTANCE, isConnected, address, pool.id, pool.tokenA, pool.tokenB, resolvedPoolId, tokenList]);

  return (
    <div className="bg-secondary rounded-xl p-6 border border-white/10 hover:border-white/20 transition-colors duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            <div className="w-8 h-8 bg-tertiary rounded-full border border-white/10 overflow-hidden flex items-center justify-center">
              {tokenAMeta?.img ? (
                <img
                  src={tokenAMeta.img}
                  alt={`${poolData.tokenA} token`}
                  className="w-full h-full object-cover"
                  onError={(event) => {
                    const target = event.currentTarget as HTMLImageElement;
                    target.onerror = null;
                    target.src = '/assets/Icons.svg';
                  }}
                />
              ) : (
                <span className="text-sm font-medium">{poolData.tokenA}</span>
              )}
            </div>
            <div className="w-8 h-8 bg-tertiary rounded-full border border-white/10 overflow-hidden flex items-center justify-center">
              {tokenBMeta?.img ? (
                <img
                  src={tokenBMeta.img}
                  alt={`${poolData.tokenB} token`}
                  className="w-full h-full object-cover"
                  onError={(event) => {
                    const target = event.currentTarget as HTMLImageElement;
                    target.onerror = null;
                    target.src = '/assets/Icons.svg';
                  }}
                />
              ) : (
                <span className="text-sm font-medium">{poolData.tokenB}</span>
              )}
            </div>
          </div>
          <div>
            <div className="text-primary font-semibold">
              {poolData.tokenA}/{poolData.tokenB}
            </div>
            <div className="text-sm text-secondary">
              Pool #{resolvedPoolId}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-accent-green font-semibold">
            {loading ? '...' : `${poolData.apy}% APY`}
          </div>
          <div className="text-sm text-secondary">
            Current Rate
          </div>
        </div>
      </div>

      <div className={`grid gap-4 mb-4 ${isConnected ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2'}`}>
        <div>
          <div className="text-sm text-secondary">Total Liquidity</div>
          <div className="text-primary font-medium">
            {loading ? '...' : poolData.liquidity > 0.01
              ? `$${poolData.liquidity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : poolData.liquidity > 0
              ? `$${poolData.liquidity.toFixed(6)}`
              : '$0.00'}
          </div>
        </div>
        <div>
          <div className="text-sm text-secondary">24h Volume</div>
          <div className="text-primary font-medium">
            {loading ? '...' : `$${poolData.volume24h.toLocaleString()}`}
          </div>
        </div>
        {isConnected && (
          <>
            <div>
              <div className="text-sm text-secondary">Your Share</div>
              <div className="text-primary font-medium">
                {loading ? '...' : `${(poolData.yourShare * 100).toFixed(2)}%`}
              </div>
            </div>
            <div>
              <div className="text-sm text-secondary">Your Fees</div>
              <div className="text-accent-green font-medium">
                {loading ? '...' : `$${poolData.yourFees.toFixed(2)}`}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex gap-3">
        <button 
          onClick={() => onAddLiquidity?.(poolData.id)}
          disabled={!isConnected}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
            isConnected 
              ? 'bg-accent-green text-white hover:bg-accent-green-hover' 
              : 'bg-tertiary text-secondary cursor-not-allowed opacity-50'
          }`}
        >
          {isConnected ? 'Add Liquidity' : 'Connect Wallet'}
        </button>
        <button 
          onClick={() => onRemoveLiquidity?.(poolData.id)}
          disabled={!isConnected || poolData.yourShare === 0}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
            isConnected && poolData.yourShare > 0
              ? 'bg-tertiary text-primary hover:bg-quaternary' 
              : 'bg-tertiary text-secondary cursor-not-allowed opacity-50'
          }`}
        >
          {!isConnected ? 'Connect Wallet' : 'Remove'}
        </button>
        <button 
          onClick={() => onClaimFees?.(poolData.id)}
          disabled={!isConnected || poolData.yourFees === 0}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            isConnected && poolData.yourFees > 0
              ? 'bg-tertiary text-primary hover:bg-quaternary' 
              : 'bg-tertiary text-secondary cursor-not-allowed opacity-50'
          }`}
        >
          {!isConnected ? 'Connect Wallet' : 'Claim Fees'}
        </button>
      </div>
    </div>
  );
};

export default LiquidityPoolCard;
