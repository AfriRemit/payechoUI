import type { Token } from '../../lib/Tokens/tokens';

export type TokenSymbol = string;

export interface TokenMeta {
  symbol: TokenSymbol;
  name: string;
  icon: string; // public path or URL
  decimals: number;
}

// Build token metadata from token list (chain-aware)
export const buildTokensMeta = (tokens: Token[]): Record<TokenSymbol, TokenMeta> => {
  return tokens.reduce((acc, t) => {
    acc[t.symbol] = {
      symbol: t.symbol,
      name: t.name,
      icon: t.img || '/assets/Icons.svg',
      decimals: 18,
    };
    return acc;
  }, {} as Record<TokenSymbol, TokenMeta>);
};

export const getPopularTokens = (tokens: Token[]): TokenSymbol[] => {
  return tokens.slice(0, 5).map(t => t.symbol);
};

// Legacy exports for backward compatibility (will use default chain tokens)
// These should be replaced with chain-aware versions
import tokens from '../../lib/Tokens/tokens';
export const TOKENS: Record<TokenSymbol, TokenMeta> = buildTokensMeta(tokens);
export const POPULAR_TOKENS: TokenSymbol[] = getPopularTokens(tokens);

// Removed mock prices; keep exports for compatibility
export const MOCK_PRICES_USDT: Record<TokenSymbol, number> = {};

export function getQuote(_amount: number, _from: TokenSymbol, _to: TokenSymbol): number {
  return 0;
}

