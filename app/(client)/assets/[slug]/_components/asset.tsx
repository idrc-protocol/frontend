/* eslint-disable @next/next/no-img-element */
"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Fuel } from "lucide-react";
import { formatDate } from "date-fns/format";
import { parseUnits } from "viem";

import DialogBuy from "@/components/dialog/dialog-buy";
import FallbackImage from "@/components/fallback-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AssetInfo, assetsInfo } from "@/data/asset-info";
import { assetData } from "@/data/asset.data";
import { networkData } from "@/data/network.data";
import { useOnboardingStatus } from "@/hooks/query/api/use-onboarding-status";
import { useBalanceCustom } from "@/hooks/query/contract/use-balance-custom";
import { useRedeem } from "@/hooks/mutation/contract/use-redeem";
import { contractAddresses } from "@/lib/constants";
import { useSession } from "@/lib/auth-client";
import { FALLBACK_IMAGE } from "@/lib/constants";
import { formatNumber } from "@/lib/helper/number";
import { encodeSvgDataUri } from "@/lib/utils";
import { MultiStepTransactionDialog } from "@/components/dialog/multi-step-transaction-dialog";
import {
  Timeframe,
  TradingPairChart,
} from "@/components/chart/trading-pair-chart";
import { useChartData } from "@/hooks/use-chart-data";

interface InfoRowProps {
  label: string;
  value?: string | null;
  fallback?: string;
}

export function AssetSkeleton() {
  return (
    <div className="w-full h-full pb-24 lg:pb-10 min-h-svh">
      <div className="flex flex-col lg:flex-row items-start gap-6 mt-5 relative">
        <div className="flex-1 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <Skeleton className="rounded-full w-12 h-12" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>

          <div className="w-full">
            <Skeleton className="w-full h-[430px] rounded-lg" />
          </div>

          <Separator />

          <div>
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex justify-between py-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <Skeleton className="h-6 w-40 mb-3" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>

          <Separator />

          <div>
            <Skeleton className="h-6 w-32 mb-3" />
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-6 w-24 rounded-full" />
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex justify-between py-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-40" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="hidden lg:flex w-96 sticky top-5 max-h-svh overflow-y-auto flex-shrink-0 flex-col gap-3">
          <div className="border-[0.5px] border-border rounded-4xl p-6">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-12 w-full" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-20" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Skeleton className="h-12 flex-1 rounded-3xl" />
            <Skeleton className="h-12 flex-1 rounded-3xl" />
          </div>

          <div className="border-[0.5px] border-border rounded-4xl p-6">
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
              <Separator />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>

          <Skeleton className="h-14 w-full rounded-3xl" />
        </div>
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border z-50">
        <Skeleton className="h-14 w-full rounded-3xl" />
      </div>
    </div>
  );
}

function InfoRow({ label, value, fallback = "N/A" }: InfoRowProps) {
  return (
    <div className="flex justify-between py-2">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-medium text-gray-900">
        {value || fallback}
      </span>
    </div>
  );
}

export default function Asset({ symbol }: { symbol: string }) {
  const router = useRouter();
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const { data: userStatus } = useOnboardingStatus(userId);

  const { balanceNormalized: idrcBalance } = useBalanceCustom({
    tokenIDRC: true,
  });

  const redeem = useRedeem();
  const [dialogBuyOpen, setDialogBuyOpen] = useState(false);
  const [buyAmount, setBuyAmount] = useState("");
  const [sellAmount, setSellAmount] = useState("");
  const [selectedAction, setSelectedAction] = useState<"buy" | "sell" | null>(
    null,
  );
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);

  const handleNumberInput = (value: string): string => {
    const numericValue = value.replace(/[^0-9.]/g, "");

    const parts = numericValue.split(".");

    if (parts.length > 2) {
      return parts[0] + "." + parts.slice(1).join("");
    }

    if (
      numericValue.length > 1 &&
      numericValue.startsWith("0") &&
      numericValue[1] !== "."
    ) {
      return numericValue.substring(1);
    }

    return numericValue;
  };

  const formatInputDisplay = (value: string): string => {
    if (!value) return "";

    const parts = value.split(".");

    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    return parts.join(".");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = [
      "Backspace",
      "Delete",
      "Tab",
      "Escape",
      "Enter",
      "Home",
      "End",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
    ];

    if (e.ctrlKey && ["a", "c", "v", "x", "z"].includes(e.key.toLowerCase())) {
      return;
    }

    if (e.key === "." && !e.currentTarget.value.includes(".")) {
      return;
    }

    if (allowedKeys.includes(e.key) || (e.key >= "0" && e.key <= "9")) {
      return;
    }

    e.preventDefault();
  };

  const asset = assetData.find((a) => a.symbol === symbol);
  const assetInfo: AssetInfo | undefined = assetsInfo.find(
    (a) => a.symbol === symbol,
  );

  const [timeframe, setTimeframe] = useState<Timeframe>("1D");
  const chartSymbol = asset?.chart
    ? `${asset.chart.compareSymbol}/${asset.chart.compareCurrency}`
    : symbol;
  const chartDatas = useChartData(chartSymbol, timeframe);

  const handleOpenDialogBuy = () => {
    setDialogBuyOpen(true);
  };

  const handleCloseDialogBuy = () => {
    setDialogBuyOpen(false);
  };

  const handleSell = () => {
    if (!sellAmount || Number(sellAmount) <= 0) return;

    const amountInWei = parseUnits(sellAmount, 2);

    setShowTransactionDialog(true);

    redeem.mutation.mutate({
      token: contractAddresses.IDRXToken,
      spender: contractAddresses.HubProxy,
      amount: amountInWei,
    });
  };

  const handleCloseTransactionDialog = () => {
    setShowTransactionDialog(false);
    redeem.resetSteps();
  };

  const handleVerifyClick = () => {
    router.push("/account/settings");
  };

  const handleStartKycClick = () => {
    router.push("/onboard");
  };

  const handleAddWalletClick = () => {
    router.push("/onboard");
  };

  const getVerificationStatus = () => {
    if (!session?.user) {
      return {
        canTrade: false,
        actionButton: {
          text: "Sign In to Trade",
          onClick: () => router.push("/auth/auth/login"),
          variant: "default" as const,
        },
        statusMessage: `Please sign in to start transaction`,
      };
    }

    if (!userStatus) {
      return {
        canTrade: false,
        actionButton: null,
        statusMessage: "Loading verification status...",
      };
    }

    if (!userStatus.isEmailVerified) {
      return {
        canTrade: false,
        actionButton: {
          text: "Verify Email",
          onClick: handleVerifyClick,
          variant: "destructive" as const,
        },
        statusMessage: "Email verification required before transaction",
      };
    }

    if (!userStatus.hasKyc) {
      return {
        canTrade: false,
        actionButton: {
          text: "Complete KYC",
          onClick: handleStartKycClick,
          variant: "secondary" as const,
        },
        statusMessage: "KYC verification required before transaction",
      };
    }

    if (!userStatus.hasWallet) {
      return {
        canTrade: false,
        actionButton: {
          text: "Connect Wallet",
          onClick: handleAddWalletClick,
          variant: "secondary" as const,
        },
        statusMessage: "Wallet connection required before transaction",
      };
    }

    return {
      canTrade: true,
      actionButton: null,
      statusMessage: "Ready to buy/sell",
    };
  };

  const verificationStatus = getVerificationStatus();

  if (!asset) {
    return (
      <div className="flex flex-col gap-10 mt-5">
        <span className="text-black text-2xl font-medium">Asset not found</span>
      </div>
    );
  }

  const currentAmount = selectedAction === "sell" ? sellAmount : buyAmount;

  const calculatedCurrentAmount = String(
    parseFloat(currentAmount) *
      parseFloat(String(chartDatas.currentPrice || "0")),
  );

  return (
    <>
      <DialogBuy
        assetInfo={assetInfo}
        buyAmount={buyAmount}
        calculatedCurrentAmount={calculatedCurrentAmount}
        open={dialogBuyOpen}
        onClose={handleCloseDialogBuy}
        onOpenChange={setDialogBuyOpen}
      />

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
        onRetry={() => handleSell()}
      />

      <div className="w-full h-full pb-24 lg:pb-10 min-h-svh">
        <div className="flex flex-col lg:flex-row items-start gap-6 mt-5 relative">
          <div className="w-full lg:flex-1 lg:min-w-0 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <FallbackImage
                alt={asset.assetName}
                className="rounded-full w-12 h-12"
                fallback={FALLBACK_IMAGE}
                height={48}
                src={asset.iconSrc}
                width={48}
              />
              <div className="flex flex-col">
                <span className="text-black text-2xl font-medium">
                  {asset.symbol}
                </span>
                <p className="text-sm text-gray-600">{asset.assetName}</p>
              </div>
            </div>

            <div className="w-full lg:min-w-0">
              <TradingPairChart
                chartDatas={chartDatas}
                className="w-full"
                setTimeframe={setTimeframe}
                symbol={`${asset.symbol}/${asset.chart.compareCurrency}`}
                timeframe={timeframe}
              />
            </div>

            <Separator />

            {assetInfo && (
              <>
                <div>
                  <h2 className="text-lg font-semibold mb-4">
                    Market Information
                  </h2>
                  <div className="space-y-1">
                    <InfoRow
                      label="Price"
                      value={
                        chartDatas.currentPrice
                          ? `$${formatNumber(chartDatas.currentPrice, {
                              decimals: 8,
                            })}`
                          : undefined
                      }
                    />
                    <InfoRow
                      label="24h Change"
                      value={
                        chartDatas.priceChange24h
                          ? `${formatNumber(chartDatas.priceChange24h, { decimals: 2 })}%`
                          : undefined
                      }
                    />
                    <InfoRow
                      label="Market Cap"
                      value={assetInfo.primaryMarket.marketCap}
                    />
                    <InfoRow
                      label="24h Volume"
                      value={assetInfo.primaryMarket.volume24h}
                    />
                    <InfoRow
                      label="Average Volume"
                      value={assetInfo.primaryMarket.averageVolume}
                    />
                    <InfoRow label="Total Supply" value={"∞"} />
                  </div>
                </div>
                <Separator />
              </>
            )}

            <div>
              <h2 className="text-lg font-semibold mb-3">
                About {asset.assetName}
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed">
                {assetInfo?.description || "No description available."}
              </p>
            </div>

            <Separator />

            {assetInfo && assetInfo.tags.length > 0 && (
              <>
                <div>
                  <h2 className="text-lg font-semibold mb-3">Categories</h2>
                  <div className="flex flex-wrap gap-2">
                    {assetInfo.tags.map((tag) => (
                      <Badge key={tag.tagSlug} variant="secondary">
                        {tag.tagLabel}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {assetInfo?.dividend && (
              <>
                <div>
                  <h2 className="text-lg font-semibold mb-4">
                    Dividend Information
                  </h2>
                  <div className="space-y-1">
                    <InfoRow
                      label="Dividend Yield"
                      value={assetInfo.dividend.dividendYield}
                    />
                    <InfoRow
                      label="Last Payment Date"
                      value={assetInfo.dividend.lastPaymentDate}
                    />
                    <InfoRow
                      label="Last Cash Amount"
                      value={assetInfo.dividend.lastCashAmount}
                    />
                    <InfoRow
                      label="Payout Frequency"
                      value={assetInfo.dividend.payoutFrequency}
                    />
                  </div>
                </div>
                <Separator />
              </>
            )}

            {assetInfo?.supportedNetworks &&
              assetInfo.supportedNetworks.length > 0 && (
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">
                      Supported Networks
                    </h2>
                    <div className="space-y-3">
                      {assetInfo.supportedNetworks.map((net) => {
                        const network = networkData.find(
                          (n) => n.chainId === net.chainId,
                        );

                        return (
                          <Link
                            key={net.chainId}
                            href={`https://sepolia.basescan.org/address/${net.address}`}
                            target="_blank"
                          >
                            <div className="w-5 h-5">
                              <img
                                alt={network?.name || "Network Logo"}
                                className="w-full h-full rounded-full"
                                src={encodeSvgDataUri(network?.logo || "")}
                              />
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

            {assetInfo?.topHoldings && assetInfo.topHoldings.length > 0 && (
              <>
                <div>
                  <h2 className="text-lg font-semibold mb-3">Top Holdings</h2>
                  <ul className="space-y-1">
                    {assetInfo.topHoldings.map((holding, idx) => (
                      <li key={idx} className="text-sm text-gray-700">
                        • {holding}
                      </li>
                    ))}
                  </ul>
                </div>
                <Separator />
              </>
            )}

            {assetInfo?.integrationPartners &&
              assetInfo.integrationPartners.length > 0 && (
                <>
                  <div>
                    <h2 className="text-lg font-semibold mb-3">
                      Integration Partners
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {assetInfo.integrationPartners.map((partner, idx) => (
                        <Badge key={idx} variant="outline">
                          {partner}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

            {assetInfo && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Details</h2>
                <div className="space-y-1">
                  <InfoRow label="Token Name" value={assetInfo.tokenName} />
                  <InfoRow
                    label="Underlying Asset"
                    value={assetInfo.underlyingName}
                  />
                  <InfoRow label="Ticker" value={assetInfo.ticker} />
                  <InfoRow
                    label="Minimum Amount"
                    value={`${formatNumber(assetInfo.minimumAmount, { decimals: 0, thousandSeparator: "," })} ${assetInfo.symbol}`}
                  />
                  <InfoRow
                    label="Created"
                    value={formatDate(assetInfo.createdAt, "MMM dd, yyyy")}
                  />
                  {assetInfo.supportedPaymentMethods && (
                    <InfoRow
                      label="Payment Methods"
                      value={assetInfo.supportedPaymentMethods
                        .map((method) => method.paymentMethod)
                        .join(", ")}
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="hidden lg:flex w-96 sticky top-5 max-h-svh overflow-y-auto flex-shrink-0 flex-col gap-3">
            <div className="border-[0.5px] border-border rounded-4xl p-6">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span>
                    {selectedAction === "sell" ? "Sell" : "Buy"} {asset.symbol}
                  </span>
                  <div className="text-sm flex items-center gap-1">
                    <Fuel className="text-neutral-700" size={15} />
                    <span>
                      ~{" "}
                      {formatNumber(Number(1), {
                        compact: true,
                        decimals: 0,
                        prefix: "$",
                      })}
                    </span>
                  </div>
                </div>
                <input
                  className="w-full focus:outline-none focus:ring-0 focus:border-transparent h-12 text-4xl font-medium bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!verificationStatus.canTrade}
                  inputMode="decimal"
                  pattern="[0-9]*"
                  placeholder={
                    verificationStatus.canTrade
                      ? "0.00"
                      : "Complete verification"
                  }
                  type="text"
                  value={formatInputDisplay(
                    selectedAction === "sell" ? sellAmount : buyAmount,
                  )}
                  onChange={(e) => {
                    const numericValue = handleNumberInput(e.target.value);

                    if (selectedAction === "sell") {
                      setSellAmount(numericValue);
                    } else {
                      setBuyAmount(numericValue);
                    }
                  }}
                  onKeyDown={handleKeyDown}
                />
                <span className="text-sm text-muted-foreground">
                  {(() => {
                    return currentAmount && !isNaN(parseFloat(currentAmount))
                      ? `$${formatNumber(calculatedCurrentAmount, { decimals: 0, thousandSeparator: "," })}`
                      : "$0.00";
                  })()}
                </span>
                <div className="flex items-center justify-between">
                  {selectedAction === "sell" && (
                    <div
                      className={`text-xs ${
                        Number(currentAmount) > Number(idrcBalance)
                          ? "text-red-500 font-medium"
                          : "text-gray-500"
                      }`}
                    >
                      You have:{" "}
                      {formatNumber(Number(idrcBalance), {
                        decimals: 2,
                        thousandSeparator: ",",
                      })}{" "}
                      {asset.symbol}
                      {Number(currentAmount) > Number(idrcBalance) && (
                        <span className="ml-1">(Insufficient balance)</span>
                      )}
                    </div>
                  )}
                  {selectedAction === "buy" && (
                    <div className={`text-xs text-gray-500`}>
                      You have:{" "}
                      {formatNumber(Number(idrcBalance), {
                        decimals: 2,
                        thousandSeparator: ",",
                      })}{" "}
                      {asset.symbol}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Button
                      className="rounded-full text-xs py-1 h-6 px-3"
                      disabled={!verificationStatus.canTrade}
                      variant={"secondary"}
                      onClick={() => {
                        if (selectedAction === "sell") {
                          const balance = Number(idrcBalance) || 0;

                          setSellAmount(balance.toString());
                        } else {
                          setBuyAmount("1000000000");
                        }
                      }}
                    >
                      Max
                    </Button>
                    <FallbackImage
                      alt={asset.assetName}
                      className="w-4 h-4 object-cover rounded-full"
                      fallback={FALLBACK_IMAGE}
                      height={16}
                      src={asset.iconSrc}
                      width={16}
                    />
                  </div>
                </div>
              </div>
            </div>

            {!verificationStatus.canTrade && verificationStatus.actionButton ? (
              <div className="flex flex-col gap-3">
                <div className="text-center text-sm text-gray-600 p-3 bg-gray-50 rounded-2xl">
                  {verificationStatus.statusMessage}
                </div>
                <Button
                  className="w-full rounded-3xl h-12 font-semibold"
                  variant={verificationStatus.actionButton.variant}
                  onClick={verificationStatus.actionButton.onClick}
                >
                  {verificationStatus.actionButton.text}
                </Button>
              </div>
            ) : verificationStatus.canTrade ? (
              <div className="flex items-center gap-3">
                <Button
                  className={
                    selectedAction === "buy"
                      ? "bg-green-600 hover:bg-green-500 flex-1 text-white rounded-3xl h-12 ring-green-400"
                      : "bg-green-600/20 hover:bg-green-600/40 flex-1 text-green-600 rounded-3xl h-12 border border-green-600"
                  }
                  onClick={() => setSelectedAction("buy")}
                >
                  {selectedAction === "buy" ? "BUY Selected" : "BUY"}
                </Button>
                <Button
                  className={
                    selectedAction === "sell"
                      ? "bg-red-600 hover:bg-red-500 flex-1 text-white rounded-3xl h-12 ring-red-400"
                      : "bg-red-600/20 hover:bg-red-600/40 flex-1 text-red-600 rounded-3xl h-12 border border-red-600"
                  }
                  onClick={() => setSelectedAction("sell")}
                >
                  {selectedAction === "sell" ? "SELL Selected" : "SELL"}
                </Button>
              </div>
            ) : (
              <div className="text-center text-sm text-gray-600 p-3 bg-gray-50 rounded-2xl">
                {verificationStatus.statusMessage}
              </div>
            )}

            <div className="border-[0.5px] border-border rounded-4xl p-6">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Price per Share</span>
                  <span className="font-medium">
                    $
                    {formatNumber(chartDatas.currentPrice, { decimals: 8 }) ||
                      "0.00"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span>24h Change</span>
                  <span
                    className={`font-medium ${
                      chartDatas.priceChange24h &&
                      parseFloat(String(chartDatas.priceChange24h)) >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {chartDatas.priceChange24h
                      ? `${formatNumber(chartDatas.priceChange24h, { decimals: 2 })}%`
                      : "0.00%"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span>Minimum Amount</span>
                  <span className="font-medium">
                    {formatNumber(assetInfo?.minimumAmount || 0, {
                      decimals: 0,
                      thousandSeparator: ",",
                    }) || "N/A"}{" "}
                    {assetInfo?.symbol}
                  </span>
                </div>

                {(() => {
                  const hasValidAmount =
                    selectedAction &&
                    currentAmount &&
                    parseFloat(currentAmount) > 0;

                  if (hasValidAmount) {
                    return (
                      <>
                        <Separator />
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {selectedAction === "buy"
                              ? "Total Cost"
                              : "Total Proceeds"}
                          </span>
                          <span className="font-medium">
                            $
                            {formatNumber(
                              (
                                parseFloat(currentAmount) *
                                parseFloat(
                                  String(chartDatas.currentPrice) || "1",
                                )
                              ).toFixed(2),
                              { decimals: 0, thousandSeparator: "," },
                            )}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Shares</span>
                          <span className="font-medium">
                            {formatNumber(currentAmount, {
                              decimals: 0,
                              thousandSeparator: ",",
                            })}{" "}
                            {asset.symbol}
                          </span>
                        </div>
                      </>
                    );
                  }

                  return (
                    <div className="text-sm text-center text-muted-foreground py-4">
                      Enter an amount and select BUY or SELL to see order
                      details
                    </div>
                  );
                })()}
              </div>
            </div>

            {selectedAction && verificationStatus.canTrade && (
              <Button
                className={
                  selectedAction === "buy"
                    ? "bg-green-600 hover:bg-green-700 w-full text-white rounded-3xl h-14 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700 w-full text-white rounded-3xl h-14 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                }
                disabled={(() => {
                  const amount = parseFloat(currentAmount);
                  const hasInvalidAmount =
                    !currentAmount || isNaN(amount) || amount <= 0;

                  if (selectedAction === "sell") {
                    const balance = Number(idrcBalance) || 0;

                    return hasInvalidAmount || amount > balance;
                  }

                  return hasInvalidAmount;
                })()}
                onClick={() => {
                  if (selectedAction === "buy") {
                    handleOpenDialogBuy();
                  } else if (selectedAction === "sell") {
                    handleSell();
                  }
                }}
              >
                {(() => {
                  const displayAmount = currentAmount || "0";

                  return selectedAction === "buy"
                    ? `Buy ${formatNumber(displayAmount, { decimals: 0, thousandSeparator: "," })} ${asset.symbol}`
                    : `Sell ${formatNumber(displayAmount, { decimals: 0, thousandSeparator: "," })} ${asset.symbol}`;
                })()}
              </Button>
            )}
          </div>
        </div>

        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border z-50">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              {!verificationStatus.canTrade &&
              verificationStatus.actionButton ? (
                <Button
                  className="w-full h-14 rounded-3xl font-semibold text-lg"
                  variant={verificationStatus.actionButton.variant}
                  onClick={() => {
                    setIsSheetOpen(false);
                    verificationStatus.actionButton?.onClick();
                  }}
                >
                  {verificationStatus.actionButton.text}
                </Button>
              ) : (
                <Button className="w-full h-14 rounded-3xl font-semibold text-lg bg-primary hover:bg-primary/90">
                  {verificationStatus.canTrade
                    ? `Buy/Sell ${asset.symbol}`
                    : verificationStatus.statusMessage}
                </Button>
              )}
            </SheetTrigger>
            <SheetContent
              className="h-[95vh] overflow-y-auto p-0"
              side="bottom"
            >
              <div className="p-6 flex flex-col gap-4">
                <SheetHeader>
                  <SheetTitle className="text-2xl">
                    {selectedAction === "sell" ? "Sell" : "Buy"} {asset.symbol}
                  </SheetTitle>
                </SheetHeader>

                {verificationStatus.canTrade ? (
                  <>
                    <div className="border-[0.5px] border-border rounded-4xl p-6">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <span>
                            {selectedAction === "sell" ? "Sell" : "Buy"}{" "}
                            {asset.symbol}
                          </span>
                          <div className="text-sm flex items-center gap-1">
                            <Fuel className="text-neutral-700" size={15} />
                            <span>
                              ~{" "}
                              {formatNumber(Number(1), {
                                compact: true,
                                decimals: 0,
                                prefix: "$",
                              })}
                            </span>
                          </div>
                        </div>
                        <input
                          className="w-full focus:outline-none focus:ring-0 focus:border-transparent h-12 text-4xl font-medium bg-transparent"
                          inputMode="decimal"
                          pattern="[0-9]*"
                          placeholder="0.00"
                          type="text"
                          value={formatInputDisplay(
                            selectedAction === "sell" ? sellAmount : buyAmount,
                          )}
                          onChange={(e) => {
                            const numericValue = handleNumberInput(
                              e.target.value,
                            );

                            if (selectedAction === "sell") {
                              setSellAmount(numericValue);
                            } else {
                              setBuyAmount(numericValue);
                            }
                          }}
                          onKeyDown={handleKeyDown}
                        />
                        <span className="text-sm text-muted-foreground">
                          {(() => {
                            return currentAmount &&
                              !isNaN(parseFloat(currentAmount))
                              ? `$${formatNumber(calculatedCurrentAmount)}`
                              : "$0.00";
                          })()}
                        </span>
                        <div className="flex items-center justify-between">
                          {selectedAction === "sell" && (
                            <div
                              className={`text-xs ${
                                Number(currentAmount) > Number(idrcBalance)
                                  ? "text-red-500 font-medium"
                                  : "text-gray-500"
                              }`}
                            >
                              You have:{" "}
                              {formatNumber(Number(idrcBalance), {
                                decimals: 2,
                                thousandSeparator: ",",
                              })}{" "}
                              {asset.symbol}
                              {Number(currentAmount) > Number(idrcBalance) && (
                                <span className="ml-1">
                                  (Insufficient balance)
                                </span>
                              )}
                            </div>
                          )}
                          {selectedAction === "buy" && (
                            <div className={`text-xs text-gray-500`}>
                              You have:{" "}
                              {formatNumber(Number(idrcBalance), {
                                decimals: 2,
                                thousandSeparator: ",",
                              })}{" "}
                              {asset.symbol}
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Button
                              className="rounded-full text-xs py-1 h-6 px-3"
                              variant={"secondary"}
                              onClick={() => {
                                if (selectedAction === "sell") {
                                  const balance = Number(idrcBalance) || 0;

                                  setSellAmount(balance.toString());
                                } else {
                                  setBuyAmount("1000000000");
                                }
                              }}
                            >
                              Max
                            </Button>
                            <FallbackImage
                              alt={asset.assetName}
                              className="w-4 h-4 object-cover rounded-full"
                              fallback={FALLBACK_IMAGE}
                              height={16}
                              src={asset.iconSrc}
                              width={16}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button
                        className={
                          selectedAction === "buy"
                            ? "bg-green-600 hover:bg-green-500 flex-1 text-white rounded-3xl h-12 ring-green-400"
                            : "bg-green-600/20 hover:bg-green-600/40 flex-1 text-green-600 rounded-3xl h-12 border border-green-600"
                        }
                        onClick={() => setSelectedAction("buy")}
                      >
                        {selectedAction === "buy" ? "BUY Selected" : "BUY"}
                      </Button>
                      <Button
                        className={
                          selectedAction === "sell"
                            ? "bg-red-600 hover:bg-red-500 flex-1 text-white rounded-3xl h-12 ring-red-400"
                            : "bg-red-600/20 hover:bg-red-600/40 flex-1 text-red-600 rounded-3xl h-12 border border-red-600"
                        }
                        onClick={() => setSelectedAction("sell")}
                      >
                        {selectedAction === "sell" ? "SELL Selected" : "SELL"}
                      </Button>
                    </div>

                    <div className="border-[0.5px] border-border rounded-4xl p-6">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between text-sm">
                          <span>Price per Share</span>
                          <span className="font-medium">
                            $
                            {formatNumber(chartDatas.currentPrice, {
                              decimals: 8,
                            }) || "0.00"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span>24h Change</span>
                          <span
                            className={`font-medium ${
                              chartDatas.priceChange24h &&
                              parseFloat(String(chartDatas.priceChange24h)) >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {chartDatas.priceChange24h
                              ? `${formatNumber(chartDatas.priceChange24h, { decimals: 2 })}%`
                              : "0.00%"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span>Minimum Amount</span>
                          <span className="font-medium">
                            {formatNumber(assetInfo?.minimumAmount || 0, {
                              decimals: 0,
                              thousandSeparator: ",",
                            }) || "N/A"}{" "}
                            {assetInfo?.symbol}
                          </span>
                        </div>

                        {(() => {
                          const hasValidAmount =
                            selectedAction &&
                            currentAmount &&
                            parseFloat(currentAmount) > 0;

                          if (hasValidAmount) {
                            return (
                              <>
                                <Separator />
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">
                                    {selectedAction === "buy"
                                      ? "Total Cost"
                                      : "Total Proceeds"}
                                  </span>
                                  <span className="font-medium">
                                    $
                                    {formatNumber(calculatedCurrentAmount, {
                                      decimals: 0,
                                      thousandSeparator: ",",
                                    })}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">
                                    Shares
                                  </span>
                                  <span className="font-medium">
                                    {formatNumber(currentAmount, {
                                      decimals: 0,
                                      thousandSeparator: ",",
                                    })}{" "}
                                    {asset.symbol}
                                  </span>
                                </div>
                              </>
                            );
                          }

                          return (
                            <div className="text-sm text-center text-muted-foreground py-4">
                              Enter an amount and select BUY or SELL to see
                              order details
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    {selectedAction && (
                      <Button
                        className={
                          selectedAction === "buy"
                            ? "bg-green-600 hover:bg-green-700 w-full text-white rounded-3xl h-14 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            : "bg-red-600 hover:bg-red-700 w-full text-white rounded-3xl h-14 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        }
                        disabled={(() => {
                          const amount = parseFloat(currentAmount);
                          const hasInvalidAmount =
                            !currentAmount || isNaN(amount) || amount <= 0;

                          if (selectedAction === "sell") {
                            const balance = Number(idrcBalance) || 0;

                            return hasInvalidAmount || amount > balance;
                          }

                          return hasInvalidAmount;
                        })()}
                        onClick={() => {
                          if (selectedAction === "buy") {
                            handleOpenDialogBuy();
                          } else if (selectedAction === "sell") {
                            handleSell();
                          }
                          setIsSheetOpen(false);
                        }}
                      >
                        {(() => {
                          const displayAmount = currentAmount || "0";

                          return selectedAction === "buy"
                            ? `Buy ${displayAmount} ${asset.symbol}`
                            : `Sell ${displayAmount} ${asset.symbol}`;
                        })()}
                      </Button>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col gap-4 items-center justify-center py-8">
                    <div className="text-center text-gray-600">
                      {verificationStatus.statusMessage}
                    </div>
                    {verificationStatus.actionButton && (
                      <Button
                        className="w-full h-12 rounded-3xl font-semibold"
                        variant={verificationStatus.actionButton.variant}
                        onClick={() => {
                          setIsSheetOpen(false);
                          verificationStatus.actionButton?.onClick();
                        }}
                      >
                        {verificationStatus.actionButton.text}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  );
}
