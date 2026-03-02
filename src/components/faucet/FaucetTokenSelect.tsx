import React, { useState } from 'react';
import type { TokenSymbol } from '../swap/tokens';
import { buildTokensMeta } from '../swap/tokens';
import TokenIcon from '../swap/TokenIcon';
import FaucetTokenListModal from './FaucetTokenListModal';
import { useContractInstances } from '../../provider/ContractInstanceProvider';
import { getNativeTokenSymbol } from '../../lib/Tokens/tokensByChain';

interface FaucetTokenSelectProps {
  symbol: TokenSymbol;
  onChange: (symbol: TokenSymbol) => void;
  title?: string;
  excludeTokens?: TokenSymbol[];
}

const FaucetTokenSelect: React.FC<FaucetTokenSelectProps> = ({ 
  symbol, 
  onChange, 
  title,
  excludeTokens
}) => {
  const { tokenList, currentChainId } = useContractInstances();
  // Default excludeTokens to native token for current chain
  const defaultExcludeTokens = currentChainId ? [getNativeTokenSymbol(currentChainId)] : ['APE'];
  const tokensToExclude = excludeTokens || defaultExcludeTokens;
  const [open, setOpen] = useState(false);
  const TOKENS = buildTokensMeta(tokenList);
  void TOKENS[symbol];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-tertiary rounded-full px-4 py-2.5 hover:bg-quaternary transition-colors border border-white/10"
      >
        <TokenIcon symbol={symbol} />
        <span className="text-primary font-medium text-base">{symbol}</span>
        <svg className="w-4 h-4 text-secondary" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 10l5 5 5-5H7z"/>
        </svg>
      </button>

      <FaucetTokenListModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onSelect={(s) => {
          onChange(s);
          setOpen(false);
        }}
        title={title}
        excludeTokens={tokensToExclude}
      />
    </>
  );
};

export default FaucetTokenSelect;

