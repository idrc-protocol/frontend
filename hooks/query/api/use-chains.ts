import { useQuery } from "@tanstack/react-query";

import { Chain, ChainApiResponse } from "@/types/chain.types";

export const useChains = () => {
  return useQuery<Chain[]>({
    queryKey: ["chains"],
    queryFn: async () => {
      const response = await fetch("/api/chains");

      if (!response.ok) {
        throw new Error(`Failed to fetch chains: ${response.status}`);
      }

      const data: ChainApiResponse = await response.json();

      return data.chains || [];
    },
    staleTime: 300000,
    gcTime: 600000,
  });
};

export const useActiveChains = () => {
  return useQuery<Chain[]>({
    queryKey: ["chains", "active"],
    queryFn: async () => {
      const response = await fetch("/api/chains");

      if (!response.ok) {
        throw new Error(`Failed to fetch chains: ${response.status}`);
      }

      const data: ChainApiResponse = await response.json();

      return (data.chains || []).filter((chain) => chain.isActive !== false);
    },
    staleTime: 300000,
    gcTime: 600000,
  });
};

export const useChainByChainId = (chainId?: number) => {
  return useQuery<Chain | undefined>({
    queryKey: ["chains", chainId],
    queryFn: async () => {
      const response = await fetch("/api/chains");

      if (!response.ok) {
        throw new Error(`Failed to fetch chains: ${response.status}`);
      }

      const data: ChainApiResponse = await response.json();

      return data.chains.find((chain) => chain.chainId === chainId);
    },
    enabled: chainId !== undefined,
    staleTime: 300000,
    gcTime: 600000,
  });
};
