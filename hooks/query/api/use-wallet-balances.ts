import { useQuery } from "@tanstack/react-query";

export interface WalletBalance {
  walletId: string;
  address: string;
  chain: string;
  idrx: string;
  idrc: string;
}

export interface WalletBalancesResponse {
  success: boolean;
  balances: {
    idrx: string;
    idrc: string;
  };
  walletBalances: WalletBalance[];
}

export const useWalletBalances = (userId?: string) => {
  return useQuery<WalletBalancesResponse>({
    queryKey: ["walletBalances", userId],
    queryFn: async () => {
      const response = await fetch("/api/user/wallet/balance");

      if (!response.ok) {
        throw new Error(`Failed to fetch wallet balances: ${response.status}`);
      }

      const data: WalletBalancesResponse = await response.json();

      return data;
    },
    enabled: !!userId,
    staleTime: 30000,
    refetchInterval: 60000,
  });
};
