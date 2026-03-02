import { useState, useEffect, useRef } from 'react';
import { formatEther } from 'ethers';
import { useContractInstances } from '../../provider/ContractInstanceProvider';
import { roundToTwoDecimalPlaces } from '../../lib/utils';

const BalanceCard: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const { PRICEAPI_CONTRACT_INSTANCE, fetchBalance, isConnected, address, tokenList } = useContractInstances();
  const [totalUsdValue, setTotalUsdValue] = useState<number>(0);
  const [portfolioGrowth, setPortfolioGrowth] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const previousTotalValueRef = useRef<number>(0);

  useEffect(() => {
    const calculateTotalValue = async () => {
      if (!isConnected || !address) {
        setTotalUsdValue(0);
        setPortfolioGrowth(0);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const priceContract = await PRICEAPI_CONTRACT_INSTANCE();
        if (!priceContract) {
          setIsLoading(false);
          return;
        }

        let totalValue = 0;

        // Fetch balances and prices for all tokens with addresses
        for (const token of tokenList) {
          if (!token.address) continue;

          try {
            // Fetch balance
            const balance = await fetchBalance(token.address);
            const balanceValue = balance !== undefined ? parseFloat(balance) : NaN;
            if (!Number.isFinite(balanceValue) || balanceValue <= 0) continue;

            // Fetch price
            const price = await priceContract.getTokenPrice(token.address);
            const priceInUSD = parseFloat(formatEther(price));
            
            // Calculate USD value
            const usdValue = balanceValue * priceInUSD;
            totalValue += usdValue;
          } catch (error) {
            console.error(`Error fetching data for ${token.symbol}:`, error);
          }
        }

        const roundedTotal = roundToTwoDecimalPlaces(totalValue);
        setTotalUsdValue(roundedTotal);

        // Calculate portfolio growth
        const previousValue = previousTotalValueRef.current;
        if (previousValue > 0) {
          const growth = ((totalValue - previousValue) / previousValue) * 100;
          setPortfolioGrowth(roundToTwoDecimalPlaces(growth));
        } else {
          setPortfolioGrowth(0);
        }

        previousTotalValueRef.current = totalValue;
      } catch (error) {
        console.error('Error calculating total value:', error);
      } finally {
        setIsLoading(false);
      }
    };

    calculateTotalValue();
  }, [isConnected, address, PRICEAPI_CONTRACT_INSTANCE, fetchBalance, tokenList]);

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <div className="text-4xl font-bold text-primary">
          {isLoading ? (
            <div className="h-12 w-48 bg-tertiary rounded-lg animate-pulse"></div>
          ) : isVisible ? (
            `$${totalUsdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          ) : (
            '••••••'
          )}
        </div>
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="text-secondary hover:text-primary transition-colors duration-200"
        >
          <div className="relative w-6 h-6">
            <img src="/assets/Eye icons.svg" alt="toggle visibility" className="w-6 h-6" />
            {!isVisible && (
              <span className="absolute left-1/2 top-1/2 block w-7 h-[2px] bg-secondary -translate-x-1/2 -translate-y-1/2 rotate-45"></span>
            )}
          </div>
        </button>
      </div>
      {isConnected && (
        <div className="flex items-center space-x-2">
          {isLoading ? (
            <div className="h-6 w-24 bg-tertiary rounded animate-pulse"></div>
          ) : (
            <>
              <img src="/assets/Vector (1).svg" alt="gain" className="w-4 h-4" />
              <span className={`text-lg font-medium ${portfolioGrowth >= 0 ? 'text-accent-green' : 'text-red-500'}`}>
                {portfolioGrowth >= 0 ? '+' : ''}{portfolioGrowth.toFixed(2)}%
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default BalanceCard;
