import { useQuery } from "@tanstack/react-query";
import request from "graphql-request";
import { useAccount } from "wagmi";

import { RequestRedemptionsType } from "@/types/graphql/request-redemptions.types";
import { subgraphUrl } from "@/lib/constants";
import { queryRequestedRedemptions } from "@/lib/graphql/request-redemptions.query";

interface ResponseType {
  requestedRedemptions: RequestRedemptionsType[];
}

export const useRequestRedemptions = () => {
  const { address } = useAccount();

  const { data, isLoading, refetch } = useQuery<ResponseType>({
    queryKey: ["requested-redemptions", address],
    queryFn: async () => {
      return await request(
        subgraphUrl,
        queryRequestedRedemptions(address!.toString().toLowerCase()),
      );
    },
    staleTime: 60 * 5,
    refetchInterval: 60 * 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    enabled: !!address,
  });

  return {
    data: data?.requestedRedemptions || [],
    isLoading,
    refetch,
  };
};
