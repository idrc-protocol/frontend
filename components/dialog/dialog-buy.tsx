import React from "react";
import Link from "next/link";
import { useAccount, useSwitchChain, useDisconnect } from "wagmi";
import { Loader2, Wallet as WalletIcon } from "lucide-react";
import { parseUnits } from "viem";
import { useConnectModal } from "@rainbow-me/rainbowkit";

import { AssetInfo } from "@/app/(client)/assets/[slug]/_components/asset";
import { formatNumber } from "@/lib/helper/number";
import { usePriceFeed } from "@/hooks/query/api/use-price-feed";
import { useBalanceCustom } from "@/hooks/query/contract/use-balance-custom";
import { useSubscription } from "@/hooks/mutation/contract/use-subscription";
import { MultiStepTransactionDialog } from "@/components/dialog/multi-step-transaction-dialog";
import { contractAddresses } from "@/lib/constants";
import { BASE_SEPOLIA_TOKENS } from "@/lib/tokens";
import {
  useHubPrice,
  calculateIdrxAmount,
} from "@/hooks/query/contract/use-hub-price";
import { useWallets } from "@/hooks/query/api/use-wallets";
import { useSession } from "@/lib/auth-client";

import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { SelectNetworkCrypto } from "../ui/select-network-crypto";
import { SelectTokenCryptoWithBalances } from "../ui/select-token-crypto-with-balances";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

export default function DialogBuy({
  open,
  onOpenChange,
  assetInfo,
  buyAmount,
  calculatedCurrentAmount,
  onClose,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assetInfo?: AssetInfo;
  buyAmount: string;
  calculatedCurrentAmount?: string;
  onClose?: () => void;
}) {
  const {
    chainId: currentChainId,
    address: userAddress,
    isConnected,
  } = useAccount();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();
  const { data: session } = useSession();
  const { data: userWallets } = useWallets(session?.user?.id);

  const subscription = useSubscription();
  const [showTransactionDialog, setShowTransactionDialog] =
    React.useState(false);

  const [selectedChainId, setSelectedChainId] = React.useState<number | null>(
    null,
  );
  const [selectedTokenSymbol, setSelectedTokenSymbol] =
    React.useState<string>("");

  const isCorrectChain = currentChainId === selectedChainId;
  const isWrongChain = !!currentChainId && !!selectedChainId && !isCorrectChain;

  const registeredWallet = React.useMemo(() => {
    if (!userWallets || !selectedChainId) return null;

    return userWallets.find((w) => w.chain.chainId === selectedChainId);
  }, [userWallets, selectedChainId]);

  const isWalletMismatch =
    isConnected &&
    registeredWallet &&
    userAddress?.toLowerCase() !== registeredWallet.address.toLowerCase();

  const { data: priceFeed } = usePriceFeed({
    amountFromUsd: Number(calculatedCurrentAmount),
  });

  const {
    price: hubPrice,
    isLoading: isLoadingHubPrice,
    isError: isErrorHubPrice,
  } = useHubPrice();
  const idrxAmountNeeded = calculateIdrxAmount(buyAmount, hubPrice);

  const { balanceNormalized: userBalance } = useBalanceCustom({
    tokenIDRX: true,
  });

  const handleSwitchChain = () => {
    if (!switchChain || !selectedChainId) return;
    switchChain({ chainId: selectedChainId });
  };

  const handleConnectCorrectWallet = async () => {
    disconnect();

    setTimeout(() => {
      if (openConnectModal) {
        openConnectModal();
      }
    }, 300);
  };

  const handleConfirmPurchase = () => {
    if (!idrxAmountNeeded || !userAddress) return;

    const amountInWei = parseUnits(
      idrxAmountNeeded.toString(),
      BASE_SEPOLIA_TOKENS.IDRX.decimals,
    );

    setShowTransactionDialog(true);
    onOpenChange(false);

    subscription.mutation.mutate({
      token: contractAddresses.IDRXToken,
      spender: contractAddresses.HubProxy,
      amount: amountInWei,
    });
  };

  const handleCloseTransactionDialog = () => {
    setShowTransactionDialog(false);
    subscription.resetSteps();
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg min-h-[400px] justify-between flex flex-col">
          <div className="space-y-8">
            <DialogHeader>
              <DialogTitle>
                Purchase{" "}
                {formatNumber(buyAmount, {
                  decimals: 0,
                  thousandSeparator: ",",
                })}{" "}
                {assetInfo?.symbol}
              </DialogTitle>
              <DialogDescription>
                <span className="font-medium text-sm">
                  1 {assetInfo?.symbol} ≈ {assetInfo?.primaryMarket.price} USD ≈{" "}
                  {formatNumber(
                    (priceFeed?.usdToIdr || 0) *
                      (Number(assetInfo?.primaryMarket.price) || 0),
                    { decimals: 0, thousandSeparator: "," },
                  )}{" "}
                  IDRX
                </span>
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="crypto">
              <TabsList className="w-full">
                <TabsTrigger value="crypto">Crypto</TabsTrigger>
                <TabsTrigger value="fiat">Fiat</TabsTrigger>
              </TabsList>
              <TabsContent value="crypto">
                <div className="space-y-4">
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700 mb-2"
                      htmlFor="select-network-crypto"
                    >
                      Select Network
                    </label>
                    <SelectNetworkCrypto
                      comingSoonChains={["Ethereum", "Polygon"]}
                      id="select-network-crypto"
                      label="Network"
                      placeholder="Choose a network"
                      showTestnets={true}
                      value={selectedChainId || undefined}
                      onDisabledChainClick={(chain) => {
                        alert(`${chain.name} support coming soon!`);
                      }}
                      onValueChange={(chainId) => {
                        setSelectedTokenSymbol("");

                        setSelectedChainId(chainId || null);
                      }}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label
                        className="block text-sm font-medium text-gray-700 mb-2"
                        htmlFor="select-token-crypto"
                      >
                        Select Token
                      </label>
                      {selectedTokenSymbol && (
                        <span className="text-xs">
                          Your Balance:{" "}
                          {formatNumber(Number(userBalance), {
                            decimals: 0,
                            thousandSeparator: ",",
                          })}{" "}
                          {selectedTokenSymbol}
                        </span>
                      )}
                    </div>
                    {selectedChainId ? (
                      <SelectTokenCryptoWithBalances
                        comingSoonTokens={["USDT", "USDC"]}
                        id="select-token-crypto"
                        label="Token"
                        placeholder="Choose a token"
                        showBalance={true}
                        showPrice={false}
                        value={selectedTokenSymbol}
                        onDisabledTokenClick={(symbol) => {
                          alert(`${symbol} support coming soon!`);
                        }}
                        onValueChange={(symbol) => {
                          setSelectedTokenSymbol(symbol);
                        }}
                      />
                    ) : (
                      <div className="h-14 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 text-sm">
                        Please select a network first
                      </div>
                    )}
                  </div>

                  {isWalletMismatch && registeredWallet && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <WalletIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-yellow-900">
                            Wallet Address Mismatch
                          </p>
                          <p className="text-sm text-yellow-800 mt-1">
                            Your connected wallet ({userAddress?.slice(0, 6)}...
                            {userAddress?.slice(-4)}) doesn&apos;t match your
                            registered wallet (
                            {registeredWallet.address.slice(0, 6)}...
                            {registeredWallet.address.slice(-4)}) for this
                            network.
                          </p>
                          <p className="text-sm text-yellow-800 mt-1">
                            Please connect the correct wallet to continue.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {!idrxAmountNeeded &&
                  selectedTokenSymbol &&
                  !isWalletMismatch ? (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm font-medium text-yellow-900">
                        Unable to calculate required IDRX amount
                      </p>
                      <p className="text-sm text-yellow-800 mt-1">
                        {isLoadingHubPrice
                          ? "Loading price data from blockchain..."
                          : isErrorHubPrice
                            ? "Error fetching price from contract. Please ensure you're connected to the correct network."
                            : !hubPrice
                              ? "Hub price is not available. Please try connecting your wallet or refreshing the page."
                              : "Please check if the asset price is available or try again later."}
                      </p>
                    </div>
                  ) : Number(userBalance) < Number(idrxAmountNeeded) &&
                    selectedTokenSymbol &&
                    !isWalletMismatch &&
                    idrxAmountNeeded &&
                    idrxAmountNeeded > 0 ? (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm font-medium text-red-900">
                        Insufficient balance to complete this purchase.{" "}
                        {Number(userBalance) === 0 ? (
                          <>
                            You need{" "}
                            {formatNumber(Number(idrxAmountNeeded), {
                              decimals: 0,
                              thousandSeparator: ",",
                            })}{" "}
                            {selectedTokenSymbol}.
                          </>
                        ) : (
                          <>
                            You need about{" "}
                            {formatNumber(
                              Number(idrxAmountNeeded) - Number(userBalance),
                              {
                                decimals: 0,
                                thousandSeparator: ",",
                              },
                            )}{" "}
                            more {selectedTokenSymbol}.
                          </>
                        )}
                      </p>
                      <p className="text-sm text-red-800 mt-1">
                        Tip: You can mint test tokens{" "}
                        <Link
                          className="underline text-blue-500"
                          href="/faucet"
                        >
                          here
                        </Link>
                        .
                      </p>
                    </div>
                  ) : selectedChainId &&
                    selectedTokenSymbol &&
                    !isWalletMismatch &&
                    idrxAmountNeeded ? (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm font-medium text-blue-900">
                        You will buy{" "}
                        {formatNumber(buyAmount, {
                          decimals: 0,
                          thousandSeparator: ",",
                          suffix: ` ${assetInfo?.symbol}`,
                        })}{" "}
                        for{" "}
                        {formatNumber(Number(idrxAmountNeeded), {
                          decimals: 0,
                          thousandSeparator: ",",
                          suffix: ` ${selectedTokenSymbol}`,
                        })}
                      </p>
                    </div>
                  ) : null}
                </div>
              </TabsContent>
              <TabsContent value="fiat">
                <div className="h-40 w-full flex justify-center items-center">
                  <span>Coming soon</span>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <DialogFooter className="flex sm:flex-row sm:justify-between w-full">
            <Button
              className="h-12"
              variant={"secondary"}
              onClick={() => onClose?.()}
            >
              Cancel
            </Button>
            {!isConnected ? (
              <Button className="h-12" onClick={openConnectModal}>
                <WalletIcon className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            ) : isWalletMismatch ? (
              <Button className="h-12" onClick={handleConnectCorrectWallet}>
                <WalletIcon className="w-4 h-4 mr-2" />
                Connect Correct Wallet
              </Button>
            ) : isWrongChain ? (
              <Button
                className="h-12"
                disabled={isSwitchingChain}
                onClick={handleSwitchChain}
              >
                {isSwitchingChain ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Switching...
                  </>
                ) : (
                  "Switch Network"
                )}
              </Button>
            ) : (
              <Button
                className="h-12"
                disabled={
                  !selectedChainId ||
                  !selectedTokenSymbol ||
                  !calculatedCurrentAmount ||
                  !idrxAmountNeeded ||
                  Number(userBalance) < Number(idrxAmountNeeded) ||
                  subscription.isLoading
                }
                onClick={handleConfirmPurchase}
              >
                {subscription.isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Confirm Purchase"
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <MultiStepTransactionDialog
        currentStep={subscription.currentStep}
        description={`Purchasing ${formatNumber(buyAmount, { decimals: 0, thousandSeparator: "," })} ${assetInfo?.symbol} with IDRX`}
        explorerUrl="https://sepolia.basescan.org/tx"
        isError={subscription.isError}
        isLoading={subscription.isLoading}
        isSuccess={subscription.isSuccess}
        open={showTransactionDialog}
        showTxHashes={true}
        steps={subscription.steps}
        title="Purchase Transaction"
        onClose={handleCloseTransactionDialog}
        onOpenChange={setShowTransactionDialog}
        onRetry={() => handleConfirmPurchase()}
      />
    </>
  );
}
