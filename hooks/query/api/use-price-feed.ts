import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface PriceFeedData {
  id: string;
  base: string;
  target: string;
  rate: number;
  date: string;
  amount: number;
  usdToIdr: number;
  idrToUsd: number;
  updatedAt: Date;
  createdAt: Date;
}

interface PriceFeedResponse {
  success: boolean;
  data?: PriceFeedData;
  error?: string;
}

interface UpdatePriceFeedResponse {
  success: boolean;
  message?: string;
  data?: PriceFeedData;
  source?: {
    api: string;
    url: string;
    rawData: any;
  };
  error?: string;
}

interface UpdatePriceFeedParams {
  base?: string;
  target?: string;
}

interface UsePriceFeedOptions {
  base?: string;
  target?: string;
  amountFromUsd?: number;
  amountFromIdr?: number;
}

export const usePriceFeed = (options: UsePriceFeedOptions = {}) => {
  const {
    base = "USD",
    target = "IDR",
    amountFromUsd,
    amountFromIdr,
  } = options;

  const query = useQuery<PriceFeedData, Error>({
    queryKey: ["priceFeed", base, target],
    queryFn: async () => {
      const response = await fetch(
        `/api/price-feed?base=${base}&target=${target}`,
      );

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(errorData.error || "Failed to fetch price feed");
      }

      const result: PriceFeedResponse = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || "Invalid response format");
      }

      return result.data;
    },

    refetchInterval: 5 * 60 * 1000,

    staleTime: 1 * 60 * 1000,
  });

  const convertedToIdr =
    amountFromUsd && query.data
      ? convertUsdToIdr(amountFromUsd, query.data.rate)
      : undefined;

  const convertedToUsd =
    amountFromIdr && query.data
      ? convertIdrToUsd(amountFromIdr, query.data.rate)
      : undefined;

  return {
    ...query,
    convertedToIdr,
    convertedToUsd,
  };
};

export const useUpdatePriceFeed = () => {
  const queryClient = useQueryClient();

  return useMutation<PriceFeedData, Error, UpdatePriceFeedParams>({
    mutationFn: async (params: UpdatePriceFeedParams = {}) => {
      const { base = "USD", target = "IDR" } = params;

      const response = await fetch("/api/price-feed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ base, target }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(errorData.error || "Failed to update price feed");
      }

      const result: UpdatePriceFeedResponse = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || "Invalid response format");
      }

      return result.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["priceFeed", data.base, data.target],
      });
    },
  });
};

export const usePriceFeedWithUpdate = (options: UsePriceFeedOptions = {}) => {
  const {
    base = "USD",
    target = "IDR",
    amountFromUsd,
    amountFromIdr,
  } = options;

  const priceFeedQuery = usePriceFeed({
    base,
    target,
    amountFromUsd,
    amountFromIdr,
  });
  const updateMutation = useUpdatePriceFeed();

  const refresh = () => {
    updateMutation.mutate({ base, target });
  };

  return {
    data: priceFeedQuery.data,
    isLoading: priceFeedQuery.isLoading,
    isError: priceFeedQuery.isError,
    error: priceFeedQuery.error,

    convertedToIdr: priceFeedQuery.convertedToIdr,
    convertedToUsd: priceFeedQuery.convertedToUsd,

    isUpdating: updateMutation.isPending,
    isUpdateError: updateMutation.isError,
    updateError: updateMutation.error,

    refresh,
    refetch: priceFeedQuery.refetch,
  };
};

export const convertUsdToIdr = (usdAmount: number, rate: number): number => {
  return usdAmount * rate;
};

export const convertIdrToUsd = (idrAmount: number, rate: number): number => {
  return idrAmount / rate;
};

export const formatIdr = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatUsd = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};
