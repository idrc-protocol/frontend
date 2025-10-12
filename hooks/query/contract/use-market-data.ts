import { useQuery } from "@tanstack/react-query";
import { erc20Abi } from "viem";
import { readContract } from "wagmi/actions";

import { contractAddresses } from "@/lib/constants";
import { normalize } from "@/lib/helper/bignumber";
import { config } from "@/lib/wagmi";

import { MarketABI } from "@/lib/abis/market.abi";

export const useMarketData = () => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["marketData"],
    queryFn: async () => {
      const marketAddress = contractAddresses.market;
      const tokenAddress = contractAddresses.mockUSDT;

      const tvl = await readContract(config, {
        address: marketAddress,
        abi: MarketABI,
        functionName: "tvl",
      });

      const maxSupply = await readContract(config, {
        address: marketAddress,
        abi: MarketABI,
        functionName: "maxSupply",
      });

      const contractBalance = await readContract(config, {
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [marketAddress],
      });

      const marketName = await readContract(config, {
        address: marketAddress,
        abi: MarketABI,
        functionName: "marketName",
      });

      return {
        tvl: parseFloat(normalize((tvl as bigint).toString(), 6)),
        maxSupply: parseFloat(normalize((maxSupply as bigint).toString(), 6)),
        contractBalance: parseFloat(
          normalize((contractBalance as bigint).toString(), 6),
        ),
        marketName: marketName as string,
      };
    },
    refetchInterval: 10000,
  });

  return {
    data: data || {
      tvl: 0,
      maxSupply: 0,
      contractBalance: 0,
      marketName: "",
    },
    isLoading,
    refetch,
  };
};
