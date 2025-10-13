import { useQuery } from "@tanstack/react-query";
import request from "graphql-request";

import { RequestRedemptionsType } from "@/types/graphql/request-redemptions.types";
import { subgraphUrl } from "@/lib/constants";
import { queryRequestedRedemptions } from "@/lib/graphql/request-redemptions.query";

interface ResponseType {
  requestedRedemptions: RequestRedemptionsType[];
}

export const useRequestRedemptions = ({
  userAddress,
}: {
  userAddress: string;
}) => {
  const { data, isLoading, refetch } = useQuery<ResponseType>({
    queryKey: ["requested-redemptions", userAddress],
    queryFn: async () => {
      return await request(
        subgraphUrl,
        queryRequestedRedemptions(userAddress!.toString().toLowerCase()),
      );
    },
    staleTime: 60 * 5,
    refetchInterval: 60 * 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    enabled: !!userAddress,
  });

  return {
    data: data?.requestedRedemptions || [],
    isLoading,
    refetch,
  };
};
