import { useQuery } from "@tanstack/react-query";
import request from "graphql-request";

import { RequestSubscriptionType } from "@/types/graphql/request-subscriptions.types";
import { subgraphUrl } from "@/lib/constants";
import { queryRequestedSubscriptions } from "@/lib/graphql/request-subscriptions.query";

interface ResponseType {
  requestedSubscriptions: RequestSubscriptionType[];
}

export const useRequestSubscriptions = ({
  userAddress,
}: {
  userAddress: string;
}) => {
  const { data, isLoading, refetch } = useQuery<ResponseType>({
    queryKey: ["requested-subscriptions", userAddress],
    queryFn: async () => {
      return await request(
        subgraphUrl,
        queryRequestedSubscriptions(userAddress!.toString().toLowerCase()),
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
    data: data?.requestedSubscriptions || [],
    isLoading,
    refetch,
  };
};
