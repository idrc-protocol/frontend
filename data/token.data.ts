export interface CryptoToken {
  symbol: string;
  name: string;
  icon?: string;
  balance?: string;
  value?: string;
  price?: number;
  change24h?: number;
}

export const createSampleTokens = (): CryptoToken[] => [
  {
    symbol: "USDT",
    name: "Tether",
    icon: "/images/token/usdt.webp",
    balance: "1,234.56",
    value: "1,234.56",
    price: 1.0,
    change24h: 0.01,
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    icon: "/images/token/usdc.webp",
    balance: "987.65",
    value: "987.65",
    price: 1.0,
    change24h: -0.02,
  },
];
