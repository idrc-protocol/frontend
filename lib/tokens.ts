import { Address } from "viem";

export interface TokenConfig {
  symbol: string;
  name: string;
  address: Address;
  decimals: number;
  icon?: string;
  coingeckoId?: string;
}

export const BASE_SEPOLIA_TOKENS: Record<string, TokenConfig> = {
  IDRX: {
    symbol: "IDRX",
    name: "IDRX",
    address: "0x06ecC38c1a44dEb8CAbD310fD0Ca6b4a7e37caa5" as Address,
    decimals: 2,
    icon: "/images/token/idrx.webp",
    coingeckoId: "idrx",
  },
  USDC: {
    symbol: "USDC",
    name: "USD Coin",
    address: "0x036cbd53842c5426634e7929541ec2318f3dcf7e" as Address,
    decimals: 6,
    icon: "/images/token/usdc.webp",
    coingeckoId: "usd-coin",
  },
  USDT: {
    symbol: "USDT",
    name: "Tether USD",
    address: "0x7169D38820dfd117C3FA1f22a697dBA58d90BA06" as Address,
    decimals: 6,
    icon: "/images/token/usdt.webp",
    coingeckoId: "tether",
  },
};

export const getTokensForChain = (
  _chainId?: number,
): Record<string, TokenConfig> => {
  return BASE_SEPOLIA_TOKENS;
};

export const getAllTokens = (): TokenConfig[] => {
  return Object.values(getTokensForChain());
};

export const getTokenBySymbol = (symbol: string): TokenConfig | undefined => {
  return getTokensForChain()[symbol];
};

export const getTokenByAddress = (
  address: Address,
): TokenConfig | undefined => {
  const tokens = getAllTokens();

  return tokens.find(
    (token) => token.address.toLowerCase() === address.toLowerCase(),
  );
};
