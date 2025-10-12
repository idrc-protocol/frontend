import { useAccount, useReadContract } from "wagmi";

import { contractAddresses } from "@/lib/constants";

import { MarketABI } from "@/lib/abis/market.abi";

export const useTVL = () => {
  const { isConnected } = useAccount();

  const { data, isLoading, refetch } = useReadContract({
    address: contractAddresses.market,
    abi: MarketABI,
    functionName: "tvl",
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
