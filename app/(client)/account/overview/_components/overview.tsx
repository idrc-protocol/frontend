"use client";
import { ChevronRight } from "lucide-react";
import React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import ButtonTooltip from "@/components/tooltip/button-tooltip";
import { Card, CardContent } from "@/components/ui/card";
import FallbackImage from "@/components/fallback-image";
import { FALLBACK_IMAGE } from "@/lib/constants";
import { useWallets } from "@/hooks/query/api/use-wallets";
import { useWalletBalances } from "@/hooks/query/api/use-wallet-balances";
import { usePriceFeed } from "@/hooks/query/api/use-price-feed";
import { formatNumber } from "@/lib/helper/number";
import { assetsInfo } from "@/data/asset-info";
import { useSession } from "@/lib/auth-client";

export default function Overview() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const { data: wallets, isLoading: isLoadingWallets } = useWallets(userId);
  const { data: balanceData, isLoading: isLoadingBalances } =
    useWalletBalances(userId);

  const idrxBalanceNumber = Number(balanceData?.balances.idrx) || 0;
  const formattedIdrxBalance = formatNumber(idrxBalanceNumber, {
    decimals: 2,
    thousandSeparator: ",",
  });

  const idrcBalanceNumber = Number(balanceData?.balances.idrc) || 0;
  const totalAssetValueUsd = assetsInfo.reduce((total, asset) => {
    const assetPrice = parseFloat(asset.primaryMarket.price);

    return total + idrcBalanceNumber * assetPrice;
  }, 0);

  const { data: priceFeed, convertedToUsd } = usePriceFeed({
    amountFromIdr: idrxBalanceNumber,
  });

  const idrxUsdValue = Number(convertedToUsd) || 0;
  const formattedIdrxUsdBalance = formatNumber(idrxUsdValue, {
    decimals: 2,
    thousandSeparator: ",",
  });

  const assetValueInIdrx = totalAssetValueUsd * (priceFeed?.usdToIdr || 0);
  const totalPortfolioIdrx = idrxBalanceNumber + assetValueInIdrx;

  const formattedTotalPortfolioIdrx = formatNumber(totalPortfolioIdrx, {
    decimals: 2,
    thousandSeparator: ",",
  });

  const totalPortfolioUsd = idrxUsdValue + totalAssetValueUsd;
  const formattedTotalPortfolioUsd = formatNumber(totalPortfolioUsd, {
    decimals: 2,
    thousandSeparator: ",",
  });

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
              {formattedTotalPortfolioIdrx} IDRX
            </span>
            <span className="text-lg text-gray-600 pb-1">
              ≈ ${formattedTotalPortfolioUsd}
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
                {formattedIdrxBalance} IDRX
              </span>
              <span className="text-sm text-gray-600">
                ≈ ${formattedIdrxUsdBalance}
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
                      className="inline w-4 h-4"
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
                    className="inline w-4 h-4"
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

                <td className="py-2 text-sm font-medium text-end">
                  {formatNumber(idrxBalanceNumber, {
                    decimals: 2,
                    thousandSeparator: ",",
                  })}
                </td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card className="p-5">
        <CardContent className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-black">
                Connected Wallets
              </span>
              <ButtonTooltip text="Wallets from your account stored in the database via API." />
            </div>
          </div>

          {isLoadingWallets || isLoadingBalances ? (
            <div className="text-sm text-gray-500">Loading wallets...</div>
          ) : !wallets || wallets.length === 0 ? (
            <div className="text-sm text-gray-500">No wallets connected</div>
          ) : (
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
                    Address
                  </th>
                  <th className="text-center text-sm font-normal pb-2">
                    Network
                  </th>
                  <th className="text-right text-sm font-normal pb-2">
                    IDRX Balance
                  </th>
                  <th className="text-right text-sm font-normal pb-2">
                    IDRC Balance
                  </th>
                </tr>
              </thead>

              <tbody>
                {wallets.map((wallet) => {
                  const walletBalance = balanceData?.walletBalances.find(
                    (wb) => wb.walletId === wallet.id,
                  );

                  return (
                    <tr key={wallet.id} className="border-b last:border-b-0">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono truncate">
                            {wallet.address.slice(0, 6)}...
                            {wallet.address.slice(-4)}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 text-center">
                        <span className="text-sm">
                          {wallet.chain?.network || "Unknown"}
                        </span>
                      </td>

                      <td className="py-3 text-sm text-right font-medium">
                        {formatNumber(Number(walletBalance?.idrx) || 0, {
                          decimals: 2,
                          thousandSeparator: ",",
                        })}
                      </td>

                      <td className="py-3 text-sm text-right font-medium">
                        {formatNumber(Number(walletBalance?.idrc) || 0, {
                          decimals: 2,
                          thousandSeparator: ",",
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Card className="p-5">
        <CardContent className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-black">
                Asset Portfolio
              </span>
              <ButtonTooltip text="Your holdings of tokenized real-world assets in the IDRC Protocol." />
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
                <th className="text-right text-sm font-normal pb-2">
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
                        className="rounded-full w-8 h-8"
                        fallback={FALLBACK_IMAGE}
                        height={32}
                        src={asset.iconSrc}
                        width={32}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">
                          {asset.symbol}
                        </span>
                        <span className="text-xs text-gray-500">
                          {asset.tokenName}
                        </span>
                      </div>
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

                  <td className="py-3 text-sm font-medium text-right">
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
