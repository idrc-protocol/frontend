import { useAccount, useReadContract } from "wagmi";
import { erc20Abi, isAddress } from "viem";

import { normalize } from "@/lib/helper/bignumber";
import { contractAddresses } from "@/lib/constants";

const tokens = {
  IDRC: contractAddresses.IDRCProxy,
  IDRX: contractAddresses.IDRXToken,
};

export const useBalanceCustom = ({
  tokenAddress,
  enabled = true,
  refetchInterval = 10_000,
  tokenIDRC,
  tokenIDRX,
}: {
  tokenAddress?: HexAddress;
  enabled?: boolean;
  refetchInterval?: number;
  tokenIDRC?: boolean;
  tokenIDRX?: boolean;
}) => {
  const { address: userAddress, isConnected } = useAccount();

  if (!tokenAddress) {
    if (tokenIDRC) {
      tokenAddress = tokens.IDRC;
    } else if (tokenIDRX) {
      tokenAddress = tokens.IDRX;
    }
  }

  if (!tokenAddress) {
    throw new Error("Token address is required");
  }

  const isTokenValid = isAddress(tokenAddress);

  const {
    data: value,
    isLoading,
    refetch,
  } = useReadContract({
    address: tokenAddress as HexAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [userAddress as HexAddress],
    query: {
      enabled: enabled && !!userAddress && isConnected && isTokenValid,
      refetchInterval,
    },
  });

  const { data: decimals } = useReadContract({
    address: tokenAddress as HexAddress,
    abi: erc20Abi,
    functionName: "decimals",
    query: {
      enabled: enabled && !!userAddress && isConnected && isTokenValid,
      refetchInterval,
    },
  });

  const balance = value || BigInt(0);

  const balanceNormalized =
    value && decimals ? normalize(Number(value), decimals) || 0 : 0;

  return {
    balance,
    decimals,
    balanceNormalized,
    isLoading,
    refetch,
  };
};
