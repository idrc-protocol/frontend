import { useAccount, useBalance } from "wagmi";
import { isAddress } from "viem";

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
  _decimals = 6,
  tokenIDRC,
  tokenIDRX,
}: {
  tokenAddress?: HexAddress;
  enabled?: boolean;
  refetchInterval?: number;
  _decimals?: number;
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

  const { data, isLoading, refetch } = useBalance({
    address: userAddress,
    token: tokenAddress,
    query: {
      enabled: enabled && !!userAddress && isConnected && isTokenValid,
      refetchInterval,
    },
  });

  const balance = data?.value || BigInt(0);
  const decimals = data?.decimals ?? _decimals ?? 6;

  const balanceNormalized = data?.value
    ? normalize(Number(data.value), decimals) || 0
    : 0;

  return {
    balance,
    decimals,
    balanceNormalized,
    isLoading,
    refetch,
  };
};
