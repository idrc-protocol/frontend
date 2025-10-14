"use client";
import { ChevronRight } from "lucide-react";
import React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import ButtonTooltip from "@/components/tooltip/button-tooltip";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import FallbackImage from "@/components/fallback-image";
import { FALLBACK_IMAGE } from "@/lib/constants";
import { useWalletBalances } from "@/hooks/query/api/use-wallet-balances";
import { usePriceFeed } from "@/hooks/query/api/use-price-feed";
import { formatNumber } from "@/lib/helper/number";
import { assetsInfo } from "@/data/asset-info";
import { useSession } from "@/lib/auth-client";

function OverviewSkeleton() {
  return (
    <div className="flex flex-col py-5 gap-6">
      <div className="h-30">
        <div className="px-10 relative bg-[#e0ecff] rounded-2xl items-center justify-between flex h-30 overflow-hidden">
          <div className="z-10 flex flex-col gap-1">
            <Skeleton className="h-6 w-64 bg-blue-200" />
            <Skeleton className="h-4 w-56 bg-blue-200" />
          </div>
          <Skeleton className="h-10 w-32 z-10 bg-blue-300" />
        </div>
      </div>

      <div>
        <div className="flex items-center gap-1 mb-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-4 rounded-full" />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-end gap-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      <Card className="p-5">
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col">
            <div className="flex items-center gap-1 mb-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
            <div className="flex flex-col gap-0.5">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <table className="w-full table-fixed">
            <colgroup>
              <col className="w-1/4" />
              <col className="w-1/4" />
              <col className="w-1/4" />
              <col className="w-1/4" />
            </colgroup>

            <thead>
              <tr className="border-b">
                <th className="text-left text-sm font-normal pb-2">
                  <Skeleton className="h-4 w-12" />
                </th>
                <th className="text-center text-sm font-normal pb-2">
                  <div className="flex justify-center">
                    <Skeleton className="h-4 w-16" />
                  </div>
                </th>
                <th className="text-center text-sm font-normal pb-2">
                  <div className="flex justify-center">
                    <Skeleton className="h-4 w-16" />
                  </div>
                </th>
                <th className="text-end text-sm font-normal pb-2">
                  <div className="flex justify-end">
                    <Skeleton className="h-4 w-16" />
                  </div>
                </th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td className="py-2">
                  <div className="flex items-center gap-1">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </td>
                <td className="py-2 text-center">
                  <div className="flex justify-center">
                    <Skeleton className="h-4 w-4 rounded" />
                  </div>
                </td>
                <td className="py-2 text-center">
                  <div className="flex justify-center">
                    <Skeleton className="h-4 w-20" />
                  </div>
                </td>
                <td className="py-2 text-end">
                  <div className="flex justify-end">
                    <Skeleton className="h-4 w-24" />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card className="p-5">
        <CardContent className="flex flex-col gap-5">
          <div className="flex items-center gap-1">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </div>

          <table className="w-full table-fixed">
            <colgroup>
              <col className="w-[30%]" />
              <col className="w-[20%]" />
              <col className="w-[25%]" />
              <col className="w-[25%]" />
            </colgroup>

            <thead>
              <tr className="border-b">
                <th className="text-left text-sm font-normal pb-2">
                  <Skeleton className="h-4 w-16" />
                </th>
                <th className="text-center text-sm font-normal pb-2">
                  <div className="flex justify-center">
                    <Skeleton className="h-4 w-16" />
                  </div>
                </th>
                <th className="text-right text-sm font-normal pb-2">
                  <div className="flex justify-end">
                    <Skeleton className="h-4 w-24" />
                  </div>
                </th>
                <th className="text-right text-sm font-normal pb-2">
                  <div className="flex justify-end">
                    <Skeleton className="h-4 w-24" />
                  </div>
                </th>
              </tr>
            </thead>

            <tbody>
              {[1, 2].map((index) => (
                <tr key={index} className="border-b last:border-b-0">
                  <td className="py-3">
                    <Skeleton className="h-4 w-28" />
                  </td>
                  <td className="py-3 text-center">
                    <div className="flex justify-center">
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex justify-end">
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex justify-end">
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card className="p-5">
        <CardContent className="flex flex-col gap-5">
          <div className="flex items-center gap-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </div>

          <table className="w-full table-fixed">
            <colgroup>
              <col className="w-[30%]" />
              <col className="w-[20%]" />
              <col className="w-[25%]" />
              <col className="w-[25%]" />
            </colgroup>

            <thead>
              <tr className="border-b">
                <th className="text-left text-sm font-normal pb-2">
                  <Skeleton className="h-4 w-12" />
                </th>
                <th className="text-center text-sm font-normal pb-2">
                  <div className="flex justify-center">
                    <Skeleton className="h-4 w-16" />
                  </div>
                </th>
                <th className="text-right text-sm font-normal pb-2">
                  <div className="flex justify-end">
                    <Skeleton className="h-4 w-16" />
                  </div>
                </th>
                <th className="text-right text-sm font-normal pb-2">
                  <div className="flex justify-end">
                    <Skeleton className="h-4 w-16" />
                  </div>
                </th>
              </tr>
            </thead>

            <tbody>
              {[1].map((index) => (
                <tr key={index} className="border-b last:border-b-0">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="flex flex-col gap-1">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-center">
                    <div className="flex justify-center">
                      <Skeleton className="h-5 w-5 rounded" />
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex justify-end">
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex flex-col items-end gap-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Overview() {
  const { data: session, isPending: isSessionPending } = useSession();
  const userId = session?.user?.id;

  const { data: balanceData, isLoading: isLoadingBalances } =
    useWalletBalances(userId);

  const idrxBalanceNumber = Number(balanceData?.balances.idrx) || 0;
  const idrcBalanceNumber = Number(balanceData?.balances.idrc) || 0;

  const { data: priceFeed, convertedToUsd } = usePriceFeed({
    amountFromIdr: idrxBalanceNumber,
  });

  const isLoading = isSessionPending || isLoadingBalances;

  if (isLoading) {
    return <OverviewSkeleton />;
  }

  const totalAssetValueUsd = assetsInfo.reduce((total, asset) => {
    const assetPrice = parseFloat(asset.primaryMarket.price);

    return total + idrcBalanceNumber * assetPrice;
  }, 0);

  const idrxUsdValue = Number(convertedToUsd) || 0;

  const totalPortfolioUsd = idrxUsdValue + totalAssetValueUsd;

  return (
    <div className="flex flex-col py-5 gap-6">
      <div className="h-30">
        <div className="px-10 relative bg-[#e0ecff] rounded-2xl items-center justify-between flex h-30 overflow-hidden">
          <div className="z-10">
            <span className="font-medium text-black text-xl">
              Introducing IDRC Protocol
            </span>
            <p className="text-xs">
              Bridging traditional finance to modern finance.
            </p>
          </div>
          <div className="absolute left-1/2 -translate-x-1/2">
            <FallbackImage
              alt="Profile"
              className="w-auto h-auto opacity-35"
              draggable={false}
              fallback={FALLBACK_IMAGE}
              height={1080}
              src="/images/background/map.png"
              width={1920}
            />
          </div>
          <Link className="z-10" href={"/explore"}>
            <Button className="text-sm py-5 px-3 flex items-center z-10">
              Explore Now
              <ChevronRight className="h-10 w-10" />
            </Button>
          </Link>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-1">
          <span className="text-sm font-normal">Total Portfolio Balance</span>
          <ButtonTooltip text="The total value of all your assets in IDRX. This includes your IDRX stablecoin balance and the value of your tokenized assets (IDRC)." />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-end gap-2">
            <span className="text-4xl text-black font-medium">
              {formatNumber(totalPortfolioUsd, {
                decimals: 2,
                thousandSeparator: ",",
                prefix: "$",
              })}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <p className="text-sm text-gray-500">
              1 USD ≈{" "}
              {formatNumber(priceFeed?.usdToIdr || 0, {
                decimals: 0,
                thousandSeparator: ",",
              })}{" "}
              IDR
            </p>
          </div>
        </div>
      </div>

      <Card className="p-5">
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-black">
                  Crypto Balance
                </span>
                <ButtonTooltip text="Total USDC balance available in your connected wallet(s)." />
              </div>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-2xl text-black font-medium">
                {formatNumber(idrxUsdValue, {
                  decimals: 2,
                  thousandSeparator: ",",
                  prefix: "$",
                })}
              </span>
            </div>
          </div>
          <table className="w-full table-fixed">
            <colgroup>
              <col className="w-1/4" />
              <col className="w-1/4" />
              <col className="w-1/4" />
              <col className="w-1/4" />
            </colgroup>

            <thead>
              <tr className="border-b">
                <th className="text-left text-sm font-normal pb-2">Asset</th>
                <th className="text-center text-sm font-normal pb-2">
                  Network
                </th>
                <th className="text-center text-sm font-normal pb-2">
                  Price ($)
                </th>
                <th className="text-end text-sm font-normal pb-2">Balance</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td className="py-2">
                  <div className="flex items-center gap-1">
                    <FallbackImage
                      alt="Token"
                      className="inline w-5 h-5"
                      fallback={FALLBACK_IMAGE}
                      height={200}
                      src="/images/token/idrx.webp"
                      width={200}
                    />
                    <span className="font-medium text-sm -mt-0.5">IDRX</span>
                  </div>
                </td>

                <td className="py-2 text-center">
                  <FallbackImage
                    alt="Chain"
                    className="inline w-5 h-5"
                    fallback={FALLBACK_IMAGE}
                    height={200}
                    src="/images/chains/base.webp"
                    width={200}
                  />
                </td>

                <td className="py-2 text-sm font-medium text-center">
                  {formatNumber(priceFeed?.idrToUsd || 0, {
                    decimals: 6,
                    thousandSeparator: ",",
                  })}
                </td>

                <td className="py-3 text-sm font-medium text-right">
                  <div className="flex flex-col items-end">
                    <span>
                      {formatNumber(idrxBalanceNumber, {
                        decimals: 2,
                        thousandSeparator: ",",
                      })}
                    </span>
                    <span className="text-xs text-gray-500">
                      ≈ $
                      {formatNumber(idrxUsdValue, {
                        decimals: 2,
                        thousandSeparator: ",",
                      })}
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card className="p-5">
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-black">
                  Asset Portfolio
                </span>
                <ButtonTooltip text="Your holdings of tokenized real-world assets in the IDRC Protocol." />
              </div>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-2xl text-black font-medium">
                {formatNumber(totalAssetValueUsd, {
                  decimals: 2,
                  thousandSeparator: ",",
                  prefix: "$",
                })}
              </span>
            </div>
          </div>

          <table className="w-full table-fixed">
            <colgroup>
              <col className="w-[30%]" />
              <col className="w-[20%]" />
              <col className="w-[25%]" />
              <col className="w-[25%]" />
            </colgroup>

            <thead>
              <tr className="border-b">
                <th className="text-left text-sm font-normal pb-2">Asset</th>
                <th className="text-center text-sm font-normal pb-2">
                  Network
                </th>
                <th className="text-center text-sm font-normal pb-2">
                  Price ($)
                </th>
                <th className="text-right text-sm font-normal pb-2">Balance</th>
              </tr>
            </thead>

            <tbody>
              {assetsInfo.map((asset) => (
                <tr key={asset.symbol} className="border-b last:border-b-0">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <FallbackImage
                        alt={asset.symbol}
                        className="rounded-full w-5 h-5"
                        fallback={FALLBACK_IMAGE}
                        height={32}
                        src={asset.iconSrc}
                        width={32}
                      />
                      <span className="font-medium text-sm -mt-0.5">
                        {asset.symbol}
                      </span>
                    </div>
                  </td>

                  <td className="py-3 text-center">
                    <FallbackImage
                      alt="Base"
                      className="inline w-5 h-5"
                      fallback={FALLBACK_IMAGE}
                      height={20}
                      src="/images/chains/base.webp"
                      width={20}
                    />
                  </td>

                  <td className="py-3 text-sm font-medium text-center">
                    {formatNumber(parseFloat(asset.primaryMarket.price), {
                      decimals: 2,
                      thousandSeparator: ",",
                    })}
                  </td>

                  <td className="py-3 text-sm font-medium text-right">
                    <div className="flex flex-col items-end">
                      <span>
                        {formatNumber(Number(idrcBalanceNumber) || 0, {
                          decimals: 2,
                          thousandSeparator: ",",
                        })}
                      </span>
                      <span className="text-xs text-gray-500">
                        ≈ $
                        {formatNumber(
                          (Number(idrcBalanceNumber) || 0) *
                            parseFloat(asset.primaryMarket.price),
                          {
                            decimals: 2,
                            thousandSeparator: ",",
                          },
                        )}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
