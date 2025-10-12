import { useEffect, useState } from "react";
import { useAccount, useReadContracts, useBalance } from "wagmi";
import { Address, formatUnits } from "viem";
import { baseSepolia } from "wagmi/chains";

import { TokenConfig } from "@/lib/tokens";

const ERC20_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export interface TokenBalance {
  token: TokenConfig;
  balance: string;
  rawBalance: bigint;
  isLoading: boolean;
  error?: Error;
}

interface UseTokenBalancesResult {
  balances: TokenBalance[];
  isLoading: boolean;
  error?: Error;
  refetch: () => void;
}

export function useTokenBalances(
  tokens: TokenConfig[],
): UseTokenBalancesResult {
  const { address, isConnected } = useAccount();
  const [nativeTokenBalance, setNativeTokenBalance] =
    useState<TokenBalance | null>(null);

  const erc20Tokens = tokens.filter(
    (token) => token.address !== "0x0000000000000000000000000000000000000000",
  );
  const nativeToken = tokens.find(
    (token) => token.address === "0x0000000000000000000000000000000000000000",
  );

  const {
    data: nativeBalance,
    isLoading: isNativeLoading,
    error: nativeError,
    refetch: refetchNative,
  } = useBalance({
    address: address,
    chainId: baseSepolia.id,
    query: {
      enabled: !!address && !!nativeToken && isConnected,
    },
  });

  const contracts = erc20Tokens.map((token) => ({
    address: token.address,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [address as Address],
  }));

  const {
    data: contractResults,
    isLoading: isErc20Loading,
    error: erc20Error,
    refetch: refetchErc20,
  } = useReadContracts({
    contracts,
    query: {
      enabled: !!address && erc20Tokens.length > 0 && isConnected,
    },
  });

  useEffect(() => {
    if (nativeToken && nativeBalance) {
      setNativeTokenBalance({
        token: nativeToken,
        balance: formatUnits(nativeBalance.value, nativeToken.decimals),
        rawBalance: nativeBalance.value,
        isLoading: isNativeLoading,
        error: nativeError || undefined,
      });
    } else if (nativeToken) {
      setNativeTokenBalance({
        token: nativeToken,
        balance: "0",
        rawBalance: BigInt(0),
        isLoading: isNativeLoading,
        error: nativeError || undefined,
      });
    }
  }, [nativeToken, nativeBalance, isNativeLoading, nativeError]);

  const erc20Balances: TokenBalance[] = erc20Tokens.map((token, index) => {
    const result = contractResults?.[index];
    const isLoading = isErc20Loading;

    if (result?.status === "success" && result.result !== undefined) {
      const rawBalance = result.result as bigint;

      return {
        token,
        balance: formatUnits(rawBalance, token.decimals),
        rawBalance,
        isLoading,
      };
    }

    return {
      token,
      balance: "0",
      rawBalance: BigInt(0),
      isLoading,
      error:
        result?.status === "failure"
          ? new Error(result.error?.message || "Failed to fetch balance")
          : undefined,
    };
  });

  const allBalances = [
    ...(nativeTokenBalance ? [nativeTokenBalance] : []),
    ...erc20Balances,
  ];

  const isLoading = isNativeLoading || isErc20Loading;

  const error = nativeError || erc20Error || undefined;

  const refetch = () => {
    refetchNative();
    refetchErc20();
  };

  if (!isConnected || !address) {
    return {
      balances: tokens.map((token) => ({
        token,
        balance: "0",
        rawBalance: BigInt(0),
        isLoading: false,
      })),
      isLoading: false,
      refetch: () => {},
    };
  }

  return {
    balances: allBalances,
    isLoading,
    error,
    refetch,
  };
}

export function useTokenBalance(token: TokenConfig): TokenBalance {
  const result = useTokenBalances([token]);

  return (
    result.balances[0] || {
      token,
      balance: "0",
      rawBalance: BigInt(0),
      isLoading: false,
    }
  );
}

export function formatTokenBalance(balance: string, decimals = 6): string {
  const num = parseFloat(balance);

  if (num === 0) return "0";
  if (num < 0.000001) return "< 0.000001";
  if (num < 1) return num.toFixed(decimals);
  if (num < 1000) return num.toFixed(2);
  if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;

  return `${(num / 1000000).toFixed(1)}M`;
}

export function calculateTokenValue(balance: string, price: number): string {
  const balanceNum = parseFloat(balance);
  const value = balanceNum * price;

  return value.toFixed(2);
}
