import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { buildTokensMeta } from '../swap/tokens';
import type { TokenSymbol } from '../swap/tokens';
import TokenIcon from '../swap/TokenIcon';
import { useContractInstances } from '../../provider/ContractInstanceProvider';
import { getNativeTokenSymbol } from '../../lib/Tokens/tokensByChain';

interface FaucetTokenListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (symbol: TokenSymbol) => void;
  title?: string;
  excludeTokens?: TokenSymbol[];
}

const FaucetTokenListModal: React.FC<FaucetTokenListModalProps> = ({ 
  isOpen, 
  onClose, 
  onSelect, 
  title,
  excludeTokens
}) => {
  const { tokenList, currentChainId } = useContractInstances();
  // Default excludeTokens to native token for current chain
  const defaultExcludeTokens = currentChainId ? [getNativeTokenSymbol(currentChainId)] : ['APE'];
  const tokensToExclude = excludeTokens || defaultExcludeTokens;
  const [query, setQuery] = useState('');
  const TOKENS = useMemo(() => buildTokensMeta(tokenList), [tokenList]);
  const allTokens = Object.values(TOKENS);
  
  // Filter out excluded tokens
  const availableTokens = useMemo(() => {
    return allTokens.filter(t => !tokensToExclude.includes(t.symbol));
  }, [allTokens, tokensToExclude]);
  
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return availableTokens;
    return availableTokens.filter(
      t => t.symbol.toLowerCase().includes(q) || t.name.toLowerCase().includes(q)
    );
  }, [query, availableTokens]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-secondary border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-primary">{title || 'Select a token'}</h3>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full hover:bg-tertiary transition-colors text-secondary hover:text-primary"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-tertiary text-primary placeholder-secondary rounded-lg px-4 py-3 outline-none mb-4 border border-white/10 focus:border-accent-green transition-colors"
          placeholder="Search name or paste address"
        />

        <div className="max-h-80 overflow-y-auto pr-2 custom-scrollbar">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-secondary">
              No tokens found
            </div>
          ) : (
            filtered.map((t) => (
              <button 
                key={t.symbol} 
                onClick={() => { onSelect(t.symbol); onClose(); }} 
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-tertiary transition-colors mb-1"
              >
                <TokenIcon symbol={t.symbol} />
                <div className="flex-1 text-left">
                  <div className="text-primary font-medium">{t.symbol}</div>
                  <div className="text-secondary text-sm">{t.name}</div>
                </div>
              </button>
            ))
          )}
        </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default FaucetTokenListModal;

