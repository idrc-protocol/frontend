import { useAccount, useReadContract } from "wagmi";

import { contractAddresses } from "@/lib/constants";

import { MarketABI } from "@/lib/abis/market.abi";

export const useOwner = () => {
  const { isConnected } = useAccount();

  const { data, isLoading, refetch } = useReadContract({
    address: contractAddresses.market,
    abi: MarketABI,
    functionName: "owner",
    args: [],
    query: {
      enabled: !!isConnected,
      refetchInterval: 10000,
    },
  });

  return {
    data,
    isLoading,
    refetch,
  };
};
