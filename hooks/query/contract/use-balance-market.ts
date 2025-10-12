import { useAccount, useBalance } from "wagmi";
import { isAddress } from "viem";

export const useBalanceMarket = ({
  tokenAddress,
  enabled = true,
  refetchInterval = 10_000,
}: {
  tokenAddress: HexAddress;
  enabled?: boolean;
  refetchInterval?: number;
}) => {
  const { address: userAddress, isConnected } = useAccount();

  const isTokenValid = isAddress(tokenAddress);

  const { data, isLoading, refetch } = useBalance({
    address: userAddress,
    token: tokenAddress,
    query: {
      enabled: enabled && !!userAddress && isConnected && isTokenValid,
      refetchInterval,
    },
  });

  const balance = data?.value;
  const decimals = data?.decimals ?? 6;
  const balanceNormalized = data?.formatted;

  return {
    balance,
    decimals,
    balanceNormalized,
    isLoading,
    refetch,
  };
};
