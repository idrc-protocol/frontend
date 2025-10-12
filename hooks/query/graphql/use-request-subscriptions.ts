import { useQuery } from "@tanstack/react-query";
import request from "graphql-request";
import { useAccount } from "wagmi";

import { RequestSubscriptionType } from "@/types/graphql/request-subscriptions.types";
import { subgraphUrl } from "@/lib/constants";
import { queryRequestedSubscriptions } from "@/lib/graphql/request-subscriptions.query";

interface ResponseType {
  requestedSubscriptions: RequestSubscriptionType[];
}

export const useRequestSubscriptions = () => {
  const { address } = useAccount();

  const { data, isLoading, refetch } = useQuery<ResponseType>({
    queryKey: ["requested-subscriptions", address],
    queryFn: async () => {
      return await request(
        subgraphUrl,
        queryRequestedSubscriptions(address!.toString().toLowerCase()),
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
    data: data?.requestedSubscriptions || [],
    isLoading,
    refetch,
  };
};
