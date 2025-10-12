import { useEffect, useState } from "react";

import { TokenConfig } from "@/lib/tokens";

export interface TokenPrice {
  token: TokenConfig;
  price: number;
  change24h: number;
  lastUpdated: Date;
}

interface UseTokenPricesResult {
  prices: Record<string, TokenPrice>;
  isLoading: boolean;
  error?: Error;
  refetch: () => void;
}

interface CoinGeckoPriceResponse {
  [key: string]: {
    usd: number;
    usd_24h_change: number;
  };
}

export function useTokenPrices(tokens: TokenConfig[]): UseTokenPricesResult {
  const [prices, setPrices] = useState<Record<string, TokenPrice>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>();

  const coingeckoIds = tokens
    .map((token) => token.coingeckoId)
    .filter(Boolean)
    .join(",");

  const fetchPrices = async () => {
    if (!coingeckoIds) {
      const defaultPrices: Record<string, TokenPrice> = {};

      tokens.forEach((token) => {
        let defaultPrice = 1;
        let defaultChange = 0;

        if (token.symbol === "BTC") {
          defaultPrice = 43000;
          defaultChange = 2.5;
        } else if (token.symbol === "ETH") {
          defaultPrice = 2500;
          defaultChange = -1.2;
        }

        defaultPrices[token.symbol] = {
          token,
          price: defaultPrice,
          change24h: defaultChange,
          lastUpdated: new Date(),
        };
      });

      setPrices(defaultPrices);

      return;
    }

    setIsLoading(true);
    setError(undefined);

    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoIds}&vs_currencies=usd&include_24hr_change=true`,
        {
          headers: {
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch prices: ${response.status} ${response.statusText}`,
        );
      }

      const data: CoinGeckoPriceResponse = await response.json();
      const newPrices: Record<string, TokenPrice> = {};

      tokens.forEach((token) => {
        if (token.coingeckoId && data[token.coingeckoId]) {
          const priceData = data[token.coingeckoId];

          newPrices[token.symbol] = {
            token,
            price: priceData.usd,
            change24h: priceData.usd_24h_change || 0,
            lastUpdated: new Date(),
          };
        } else {
          let fallbackPrice = 1;
          let fallbackChange = 0;

          if (token.symbol === "BTC") {
            fallbackPrice = 43000;
            fallbackChange = 2.5;
          } else if (token.symbol === "ETH") {
            fallbackPrice = 2500;
            fallbackChange = -1.2;
          }

          newPrices[token.symbol] = {
            token,
            price: fallbackPrice,
            change24h: fallbackChange,
            lastUpdated: new Date(),
          };
        }
      });

      setPrices(newPrices);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch token prices";

      setError(new Error(errorMessage));

      const fallbackPrices: Record<string, TokenPrice> = {};

      tokens.forEach((token) => {
        let fallbackPrice = 1;
        let fallbackChange = 0;

        if (token.symbol === "BTC") {
          fallbackPrice = 43000;
          fallbackChange = 2.5;
        } else if (token.symbol === "ETH") {
          fallbackPrice = 2500;
          fallbackChange = -1.2;
        }

        fallbackPrices[token.symbol] = {
          token,
          price: fallbackPrice,
          change24h: fallbackChange,
          lastUpdated: new Date(),
        };
      });

      setPrices(fallbackPrices);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (tokens.length > 0) {
      fetchPrices();
    }
  }, [coingeckoIds, tokens.length]);

  return {
    prices,
    isLoading,
    error,
    refetch: fetchPrices,
  };
}

export function useTokenPrice(token: TokenConfig): TokenPrice | undefined {
  const result = useTokenPrices([token]);

  return result.prices[token.symbol];
}

export function formatPrice(price: number): string {
  if (price >= 1000) {
    return price.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  } else if (price >= 1) {
    return price.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } else {
    return price.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 4,
      maximumFractionDigits: 6,
    });
  }
}

export function formatChange24h(change: number): string {
  const sign = change >= 0 ? "+" : "";

  return `${sign}${change.toFixed(2)}%`;
}

export function getChangeColorClass(change: number): string {
  return change >= 0 ? "text-green-600" : "text-red-600";
}
