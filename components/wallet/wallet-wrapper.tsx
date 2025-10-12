"use client";

import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { switchChain } from "wagmi/actions";

import { config } from "@/lib/wagmi";

export default function WalletWrapper({
  children,
  currentChainId,
}: {
  children: React.ReactNode;
  currentChainId?: number;
}) {
  const { isConnected, chainId } = useAccount();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (
      isMounted &&
      isConnected &&
      currentChainId &&
      currentChainId !== chainId
    ) {
      switchChain(config, {
        chainId: currentChainId as any,
      }).catch((err) => {
        throw new Error(
          `Failed to switch chain to ${currentChainId}: ${err.message}`,
        );
      });
    }
  }, [isMounted, isConnected, currentChainId, chainId]);

  if (!isMounted) return null;

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] w-full">
        <h1 className="text-2xl font-bold">Please connect your wallet</h1>
        <p className="mt-4 text-gray-600">
          You need to connect your wallet to access this page.
        </p>
      </div>
    );
  }

  return <React.Fragment>{children}</React.Fragment>;
}
