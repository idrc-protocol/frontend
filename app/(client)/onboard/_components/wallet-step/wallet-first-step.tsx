"use client";

import Link from "next/link";
import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { WalletInput } from "@/components/ui/wallet-input";

export default function WalletFirstStep({ onNext }: { onNext?: () => void }) {
  const [walletAddress, setWalletAddress] = useState("");
  const [selectedChainId, setSelectedChainId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    if (!walletAddress.trim() || selectedChainId === null) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/user/wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: walletAddress,
          chainId: selectedChainId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(errorData.error || "Failed to save wallet");
      }

      const data = await response.json();

      if (data.success) {
        toast.success("Wallet added successfully!");

        if (onNext) {
          onNext();
        }
      } else {
        throw new Error(data.error || "Failed to save wallet");
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save wallet. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isValidWallet =
    walletAddress.trim().length > 0 && selectedChainId !== null;

  return (
    <div className="flex flex-col gap-6 w-full max-w-md">
      <div className="flex flex-col gap-5">
        <span className="text-black text-2xl font-semibold">
          IDRC | Add Wallet Information
        </span>
        <p className="text-sm">
          Please provide your wallet information to proceed.
        </p>

        <WalletInput
          chainId={selectedChainId || undefined}
          placeholder="Enter wallet address"
          value={walletAddress}
          onChainChange={setSelectedChainId}
          onChange={setWalletAddress}
        />

        <Button
          className="flex-1 text-md font-semibold py-5"
          disabled={!isValidWallet || isLoading}
          variant="purple"
          onClick={handleContinue}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Continue"
          )}
        </Button>
      </div>
      <p className="text-sm text-start mt-2">
        Get assistance via{" "}
        <Link
          className="underline"
          href="mailto:support@idrc.site"
          target="_blank"
        >
          support@idrc.site
        </Link>
      </p>
    </div>
  );
}
