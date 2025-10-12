import { useQuery } from "@tanstack/react-query";

interface PortfolioBalance {
  totalValue: number;
  totalChange: number;
  totalChangePercent: number;
  cashBalance: number;
  assets: Array<{
    id: string;
    name: string;
    symbol: string;
    network: string;
    networkLogo: string;
    price: number;
    balance: number;
    value: number;
    logo: string;
  }>;
}

export const usePortfolio = (userId?: string) => {
  return useQuery<PortfolioBalance>({
    queryKey: ["portfolio", userId],
    queryFn: async () => {
      const response = await fetch("/api/user/portfolio");

      if (!response.ok) {
        throw new Error(`Failed to fetch portfolio: ${response.status}`);
      }

      return response.json();
    },
    enabled: !!userId,
    staleTime: 30000,
    refetchInterval: 60000,
  });
};

export const useCashBalance = (userId?: string) => {
  return useQuery<{ balance: number; currency: string }>({
    queryKey: ["cashBalance", userId],
    queryFn: async () => {
      const response = await fetch("/api/user/cash-balance");

      if (!response.ok) {
        throw new Error(`Failed to fetch cash balance: ${response.status}`);
      }

      return response.json();
    },
    enabled: !!userId,
    staleTime: 10000,
    refetchInterval: 30000,
  });
};
