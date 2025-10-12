import { useQuery } from "@tanstack/react-query";

interface Transaction {
  id: string;
  type: "mint" | "redeem" | "deposit" | "withdraw" | "transfer";
  asset: {
    name: string;
    symbol: string;
    logo: string;
  };
  network: {
    name: string;
    chainId: number;
    logo: string;
  };
  amount: number;
  value: number;
  status: "pending" | "completed" | "failed" | "cancelled";
  timestamp: string;
  txHash?: string;
  fromAddress?: string;
  toAddress?: string;
}

interface AccountActivity {
  transactions: Transaction[];
  totalCount: number;
  hasNextPage: boolean;
}

export const useAccountActivity = (
  userId?: string,
  options: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
  } = {},
) => {
  const { page = 1, limit = 20, type, status } = options;

  return useQuery<AccountActivity>({
    queryKey: ["accountActivity", userId, page, limit, type, status],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (type) searchParams.set("type", type);
      if (status) searchParams.set("status", status);

      const response = await fetch(
        `/api/user/transactions?${searchParams.toString()}`,
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch account activity: ${response.status}`);
      }

      const data = await response.json();

      return {
        transactions: data.transactions || [],
        totalCount: data.totalCount || 0,
        hasNextPage: data.hasNextPage || false,
      };
    },
    enabled: !!userId,
    staleTime: 30000,
    refetchInterval: 60000,
  });
};

export const useTransactionDetails = (transactionId: string) => {
  return useQuery<Transaction>({
    queryKey: ["transaction", transactionId],
    queryFn: async () => {
      const response = await fetch(`/api/user/transactions/${transactionId}`);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch transaction details: ${response.status}`,
        );
      }

      return response.json();
    },
    enabled: !!transactionId,
    staleTime: 300000,
  });
};
