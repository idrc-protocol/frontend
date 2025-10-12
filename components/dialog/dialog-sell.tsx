import React from "react";
import Link from "next/link";
import { useAccount, useSwitchChain } from "wagmi";
import { Loader2 } from "lucide-react";
import { parseUnits } from "viem";

import { AssetInfo } from "@/app/(client)/assets/[slug]/_components/asset";
import { formatNumber } from "@/lib/helper/number";
import { usePriceFeed } from "@/hooks/query/api/use-price-feed";
import { useBalanceCustom } from "@/hooks/query/contract/use-balance-custom";
import { useRedeem } from "@/hooks/mutation/contract/use-redeem";
import { MultiStepTransactionDialog } from "@/components/dialog/multi-step-transaction-dialog";
import { contractAddresses } from "@/lib/constants";
import { BASE_SEPOLIA_TOKENS } from "@/lib/tokens";
import {
  useHubPrice,
  calculateIdrxAmount,
} from "@/hooks/query/contract/use-hub-price";

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

export default function DialogSell({
  open,
  onOpenChange,
  assetInfo,
  sellAmount,
  calculatedCurrentAmount,
  onClose,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assetInfo?: AssetInfo;
  sellAmount: string;
  calculatedCurrentAmount?: string;
  onClose?: () => void;
}) {
  const { chainId: currentChainId, address: userAddress } = useAccount();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();

  const redeem = useRedeem();
  const [showTransactionDialog, setShowTransactionDialog] =
    React.useState(false);

  const [selectedChainId, setSelectedChainId] = React.useState<number | null>(
    null,
  );
  const [selectedTokenSymbol, setSelectedTokenSymbol] =
    React.useState<string>("");

  const isCorrectChain = currentChainId === selectedChainId;
  const isWrongChain = !!currentChainId && !!selectedChainId && !isCorrectChain;

  const { data: priceFeed } = usePriceFeed({
    amountFromUsd: Number(calculatedCurrentAmount),
  });

  const { price: hubPrice } = useHubPrice();
  const idrxAmountToReceive = calculateIdrxAmount(sellAmount, hubPrice);

  const { balance: idrcBalance } = useBalanceCustom({
    tokenIDRC: true,
  });

  const handleSwitchChain = () => {
    if (!switchChain || !selectedChainId) return;
    switchChain({ chainId: selectedChainId });
  };

  const handleConfirmSell = () => {
    if (!idrxAmountToReceive || !userAddress) return;

    const amountInWei = parseUnits(
      idrxAmountToReceive.toString(),
      BASE_SEPOLIA_TOKENS.IDRX.decimals,
    );

    setShowTransactionDialog(true);
    onOpenChange(false);

    redeem.mutation.mutate({
      token: contractAddresses.IDRXToken,
      spender: contractAddresses.HubProxy,
      amount: amountInWei,
    });
  };

  const handleCloseTransactionDialog = () => {
    setShowTransactionDialog(false);
    redeem.resetSteps();
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
                Sell{" "}
                {formatNumber(sellAmount, {
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
                        Receive Token
                      </label>
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

                  {/* Asset Balance Info Box */}
                  {selectedChainId && selectedTokenSymbol && (
                    <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Your {assetInfo?.symbol} Balance:
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {formatNumber(Number(idrcBalance), {
                            decimals: 2,
                            thousandSeparator: ",",
                          })}{" "}
                          {assetInfo?.symbol}
                        </span>
                      </div>
                    </div>
                  )}

                  {Number(idrcBalance) < Number(sellAmount) &&
                  selectedTokenSymbol ? (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm font-medium text-red-900">
                        Insufficient {assetInfo?.symbol} balance to complete
                        this sale. You need approximately{" "}
                        {formatNumber(
                          Number(sellAmount) - Number(idrcBalance),
                          {
                            decimals: 0,
                            thousandSeparator: ",",
                          },
                        )}{" "}
                        more {assetInfo?.symbol}.
                      </p>
                      <p className="text-sm text-red-800">
                        Tip: You can buy more{" "}
                        <Link
                          className="underline text-blue-500"
                          href={`/assets/${assetInfo?.symbol}`}
                        >
                          here
                        </Link>
                        .
                      </p>
                    </div>
                  ) : selectedChainId &&
                    selectedTokenSymbol &&
                    Number(sellAmount) > 0 ? (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm font-medium text-blue-900">
                        You will sell{" "}
                        {formatNumber(sellAmount, {
                          decimals: 0,
                          thousandSeparator: ",",
                          suffix: ` ${assetInfo?.symbol}`,
                        })}{" "}
                        and receive{" "}
                        {formatNumber(Number(idrxAmountToReceive), {
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
            {isWrongChain ? (
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
                  Number(idrcBalance) < Number(sellAmount) ||
                  redeem.isLoading
                }
                onClick={handleConfirmSell}
              >
                {redeem.isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Confirm Sale"
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Multi-step transaction dialog */}
      <MultiStepTransactionDialog
        currentStep={redeem.currentStep}
        description={`Selling ${formatNumber(sellAmount, { decimals: 0, thousandSeparator: "," })} ${assetInfo?.symbol} for IDRX`}
        explorerUrl="https://sepolia.basescan.org/tx"
        isError={redeem.isError}
        isLoading={redeem.isLoading}
        isSuccess={redeem.isSuccess}
        open={showTransactionDialog}
        showTxHashes={true}
        steps={redeem.steps}
        title="Sell Transaction"
        onClose={handleCloseTransactionDialog}
        onOpenChange={setShowTransactionDialog}
        onRetry={() => handleConfirmSell()}
      />
    </>
  );
}
