"use client";

import React, { useState } from "react";
import {
  Droplet,
  Loader2,
  AlertCircle,
  Wallet as WalletIcon,
} from "lucide-react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
  useSwitchChain,
  useDisconnect,
} from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import { baseSepolia } from "wagmi/chains";

import { Button } from "@/components/ui/button";
import { BASE_SEPOLIA_TOKENS } from "@/lib/tokens";
import { idrxABI } from "@/lib/abis/idrx.abi";
import { formatNumber } from "@/lib/helper/number";
import { ConnectButtonCustom } from "@/components/wallet/connect-button-custom";
import { useWallets } from "@/hooks/query/api/use-wallets";
import { useSession } from "@/lib/auth-client";

const IDRX = BASE_SEPOLIA_TOKENS.IDRX;
const REQUIRED_CHAIN_ID = baseSepolia.id;

export default function Faucet() {
  const { address, isConnected, chainId } = useAccount();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();
  const { data: session } = useSession();
  const { data: userWallets } = useWallets(session?.user?.id);
  const queryClient = useQueryClient();
  const [mintAmount, setMintAmount] = useState("10000000");

  const isCorrectChain = chainId === REQUIRED_CHAIN_ID;
  const isWrongChain = isConnected && !isCorrectChain;

  const registeredWallet = React.useMemo(() => {
    if (!userWallets) return null;

    return userWallets.find((w) => w.chain.chainId === REQUIRED_CHAIN_ID);
  }, [userWallets]);

  const hasNoWallets = !userWallets || userWallets.length === 0;

  const isWalletMismatch =
    isConnected &&
    registeredWallet &&
    address?.toLowerCase() !== registeredWallet.address.toLowerCase();

  const {
    data: balance,
    isLoading: balanceLoading,
    refetch: refetchBalance,
  } = useReadContract({
    address: IDRX.address,
    abi: idrxABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isCorrectChain,
    },
  });

  const formattedBalance = balance
    ? formatUnits(balance as bigint, IDRX.decimals)
    : "0";

  const {
    data: hash,
    writeContract,
    isPending: isWritePending,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const isPending = isWritePending || isConfirming;

  React.useEffect(() => {
    if (isSuccess) {
      toast.success("Successfully minted IDRX!", {
        description: `${mintAmount} IDRX has been added to your wallet`,
      });

      queryClient.invalidateQueries({ queryKey: ["balance"] });
      refetchBalance();
    }
  }, [isSuccess, mintAmount, refetchBalance, queryClient]);

  const handleSwitchChain = () => {
    if (!switchChain) {
      toast.error("Chain switching not supported");

      return;
    }

    switchChain({ chainId: REQUIRED_CHAIN_ID });
  };

  const handleConnectCorrectWallet = async () => {
    disconnect();

    setTimeout(() => {
      if (openConnectModal) {
        openConnectModal();
      }
    }, 300);
  };

  const handleMint = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");

      return;
    }

    if (!address) {
      toast.error("Wallet address not found");

      return;
    }

    if (!isCorrectChain) {
      toast.error("Please switch to Base Sepolia network");

      return;
    }

    if (hasNoWallets) {
      toast.error(
        "No registered wallets found. Please register a wallet first.",
      );

      return;
    }

    if (isWalletMismatch) {
      toast.error("Please connect the correct wallet");

      return;
    }

    const amount = parseFloat(mintAmount);

    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");

      return;
    }

    try {
      const amountWei = parseUnits(mintAmount, IDRX.decimals);

      writeContract({
        address: IDRX.address,
        abi: idrxABI,
        functionName: "mint",
        args: [address, amountWei],
      });
    } catch (error: any) {
      toast.error("Failed to mint IDRX", {
        description: error.message || "Please try again",
      });
    }
  };

  const quickAmounts = ["10000000", "50000000", "100000000", "500000000"];

  return (
    <div className="space-y-8 max-w-2xl mx-auto pt-16 px-5 md:px-0">
      <div className="flex flex-wrap justify-between gap-4 lg:gap-6">
        <div className="flex flex-col gap-2 p-4 sm:bg-transparent">
          <span className="text-sm text-muted-foreground">
            Your IDRX Balance
          </span>
          <span className="text-3xl sm:text-4xl lg:text-5xl leading-none capitalize">
            {balanceLoading ? (
              <span className="text-muted-foreground">Loading...</span>
            ) : (
              `${formatNumber(parseFloat(formattedBalance), { decimals: 0 })} IDRX`
            )}
          </span>
        </div>

        <div className="flex flex-col gap-2 p-4 sm:bg-transparent">
          <span className="text-sm text-muted-foreground">Network</span>
          <span className="text-3xl sm:text-4xl lg:text-5xl leading-none">
            Base Sepolia
          </span>
        </div>
      </div>

      <div className="border-[0.5px] border-border rounded-4xl">
        <div className="p-6">
          {!isConnected ? (
            <div className="text-center py-12">
              <Droplet className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-lg font-medium text-muted-foreground mb-2">
                Connect Your Wallet
              </p>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                Please connect your wallet to use the faucet and mint testnet
                IDRX
              </p>
              <div className="flex justify-center mt-6">
                <ConnectButtonCustom />
              </div>
            </div>
          ) : isWrongChain ? (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-orange-500 opacity-70" />
              <p className="text-lg font-medium mb-2">Wrong Network</p>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                This faucet only works on Base Sepolia network. Please switch
                your network to continue.
              </p>
              <Button
                className="rounded-full mt-5 h-14"
                disabled={isSwitchingChain}
                onClick={handleSwitchChain}
              >
                {isSwitchingChain ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Switching...
                  </>
                ) : (
                  "Switch to Base Sepolia"
                )}
              </Button>
            </div>
          ) : isWalletMismatch && registeredWallet ? (
            <div className="text-center py-12">
              <WalletIcon className="w-16 h-16 mx-auto mb-4 text-yellow-500 opacity-70" />
              <p className="text-lg font-medium mb-2">
                Wallet Address Mismatch
              </p>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-2">
                Your connected wallet ({address?.slice(0, 6)}...
                {address?.slice(-4)}) doesn&apos;t match your registered wallet
                ({registeredWallet.address.slice(0, 6)}...
                {registeredWallet.address.slice(-4)}) for this network.
              </p>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                Please connect the correct wallet to continue minting IDRX.
              </p>
              <Button
                className="rounded-full mt-5 h-14"
                onClick={handleConnectCorrectWallet}
              >
                <WalletIcon className="w-4 h-4 mr-2" />
                Connect Correct Wallet
              </Button>
            </div>
          ) : hasNoWallets ? (
            <div className="text-center py-12">
              <WalletIcon className="w-16 h-16 mx-auto mb-4 text-red-500 opacity-70" />
              <p className="text-lg font-medium mb-2">No Registered Wallets</p>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                You need to register a wallet first before you can use the
                faucet. Please register your wallet in your account settings.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Mint Amount</span>
                <Image
                  alt="IDRX"
                  className="w-4 h-4 object-cover rounded-full"
                  height={16}
                  src={IDRX?.icon || "/images/token/idrx.webp"}
                  width={16}
                />
              </div>

              <input
                className="w-full focus:outline-none focus:ring-0 focus:border-transparent h-12 text-4xl font-medium bg-transparent"
                disabled={isPending}
                placeholder="0.00"
                type="text"
                value={mintAmount}
                onChange={(e) => {
                  const value = e.target.value;

                  if (value === "" || /^\d*\.?\d*$/.test(value)) {
                    setMintAmount(value);
                  }
                }}
              />

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {mintAmount && !isNaN(parseFloat(mintAmount))
                    ? `~Rp ${formatNumber(parseFloat(mintAmount), { decimals: 0 })}`
                    : "Rp 0"}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    {balanceLoading
                      ? "..."
                      : `${formatNumber(formattedBalance, { decimals: 2, thousandSeparator: "," })} IDRX`}
                  </span>
                  <Button
                    className="rounded-full text-xs py-1 h-6 px-3"
                    disabled={
                      !isConnected ||
                      balanceLoading ||
                      isPending ||
                      isWalletMismatch ||
                      hasNoWallets
                    }
                    variant="secondary"
                    onClick={() => setMintAmount("1000000000")}
                  >
                    Max
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {isConnected && isCorrectChain && !isWalletMismatch && !hasNoWallets && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickAmounts.map((amount) => (
            <Button
              key={amount}
              className="h-12 rounded-3xl"
              disabled={isPending || isWalletMismatch || hasNoWallets}
              variant="outline"
              onClick={() => setMintAmount(amount)}
            >
              {formatNumber(parseFloat(amount), {
                decimals: 0,
                thousandSeparator: ",",
              })}{" "}
              IDRX
            </Button>
          ))}
        </div>
      )}

      {isConnected && isCorrectChain && !isWalletMismatch && !hasNoWallets && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button
            className="rounded-full h-14"
            variant="destructive"
            onClick={() => disconnect()}
          >
            Disconnect Wallet
          </Button>
          <Button
            className="w-full h-14 font-semibold rounded-3xl"
            disabled={
              isPending ||
              !mintAmount ||
              parseFloat(mintAmount) <= 0 ||
              isWalletMismatch ||
              hasNoWallets
            }
            size="lg"
            onClick={handleMint}
          >
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {isWritePending ? "Confirming..." : "Minting..."}
              </>
            ) : (
              <>
                <Droplet className="w-5 h-5 mr-2" />
                Mint{" "}
                {formatNumber(parseFloat(mintAmount || "0"), {
                  decimals: 0,
                })}{" "}
                IDRX
              </>
            )}
          </Button>
        </div>
      )}

      <div className="text-center text-sm text-muted-foreground">
        <p>IDRX Token Contract: {IDRX.address}</p>
        <p className="mt-1">Network: Base Sepolia (Chain ID: 84532)</p>
      </div>
    </div>
  );
}
