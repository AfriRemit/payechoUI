import React, { useMemo, useState } from 'react';
import { buildTokensMeta, getPopularTokens, type TokenSymbol } from './tokens';
import type { Token } from '../../lib/Tokens/tokens';
import TokenIcon from './TokenIcon';
import { useContractInstances } from '../../provider/ContractInstanceProvider';

interface TokenListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (symbol: TokenSymbol) => void;
  title?: string;
  tokens?: Token[]; // Optional: allow passing custom tokens
}

const TokenListModal: React.FC<TokenListModalProps> = ({ isOpen, onClose, onSelect, title, tokens: customTokens }) => {
  const { tokenList } = useContractInstances();
  const [query, setQuery] = useState('');
  
  // Use custom tokens if provided, otherwise use chain-aware tokens from context
  const tokensToUse = customTokens || tokenList;
  const TOKENS = useMemo(() => buildTokensMeta(tokensToUse), [tokensToUse]);
  const POPULAR_TOKENS = useMemo(() => getPopularTokens(tokensToUse), [tokensToUse]);
  
  const tokens = Object.values(TOKENS);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tokens;
    return tokens.filter(t => t.symbol.toLowerCase().includes(q) || t.name.toLowerCase().includes(q));
  }, [query, tokens]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-secondary border border-white/10 rounded-2xl w-full max-w-md p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-primary">{title || 'Select a token'}</h3>
          <button onClick={onClose} className="p-1 text-secondary hover:text-primary">✕</button>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-tertiary text-primary placeholder-secondary rounded-lg px-3 py-2 outline-none mb-3"
          placeholder="Search name or paste address"
        />

        <div className="mb-4 flex items-center gap-2 flex-wrap">
          {POPULAR_TOKENS.map((sym) => (
            <button key={sym} onClick={() => { onSelect(sym); onClose(); }} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-tertiary hover:bg-quaternary transition-colors">
              <TokenIcon symbol={sym} />
              <span className="text-primary text-sm">{sym}</span>
            </button>
          ))}
        </div>

        <div className="max-h-64 overflow-y-auto pr-1">
          {filtered.map((t) => (
            <button key={t.symbol} onClick={() => { onSelect(t.symbol); onClose(); }} className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-tertiary">
              <TokenIcon symbol={t.symbol} />
              <div className="flex-1 text-left">
                <div className="text-primary font-medium">{t.symbol}</div>
                <div className="text-secondary text-sm">{t.name}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TokenListModal;

