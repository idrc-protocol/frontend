import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Wallet, WalletApiResponse } from "@/types/wallet.types";

export const useWallets = (userId?: string) => {
  return useQuery<Wallet[]>({
    queryKey: ["wallets", userId],
    queryFn: async () => {
      const response = await fetch("/api/user/wallet");

      if (!response.ok) {
        throw new Error(`Failed to fetch wallets: ${response.status}`);
      }

      const data: WalletApiResponse = await response.json();

      return data.wallets || [];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 10,
  });
};

export const useCreateWallet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (walletData: {
      address: string;
      chainId: number;
      network: string;
      name: string;
    }) => {
      const response = await fetch("/api/user/wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(walletData),
      });

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(errorData.error || "Failed to create wallet");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
    },
  });
};

export const useUpdateWallet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: string;
      address?: string;
      chainId?: number;
      network?: string;
      name?: string;
    }) => {
      const response = await fetch("/api/user/wallet", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(errorData.error || "Failed to update wallet");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
    },
  });
};

export const useDeleteWallet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (walletId: string) => {
      const response = await fetch(`/api/user/wallet?id=${walletId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(errorData.error || "Failed to delete wallet");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
    },
  });
};
