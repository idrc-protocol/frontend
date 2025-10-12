"use client";
import { ChevronRight } from "lucide-react";
import React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import ButtonTooltip from "@/components/tooltip/button-tooltip";
import { Card, CardContent } from "@/components/ui/card";
import FallbackImage from "@/components/fallback-image";
import { FALLBACK_IMAGE } from "@/lib/constants";
import { useBalanceCustom } from "@/hooks/query/contract/use-balance-custom";
import { usePriceFeed } from "@/hooks/query/api/use-price-feed";
import { formatNumber } from "@/lib/helper/number";

export default function Overview() {
  const { balance } = useBalanceCustom({
    tokenIDRX: true,
  });

  const idrBalance = Number(balance) || 0;
  const formattedIdrBalance = formatNumber(idrBalance, {
    decimals: 2,
    thousandSeparator: ",",
  });

  const { data: priceFeed, convertedToUsd } = usePriceFeed({
    amountFromIdr: idrBalance,
  });

  const usdBalance = Number(convertedToUsd) || 0;
  const formattedUsdBalance = formatNumber(usdBalance, {
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
          <ButtonTooltip text="The total USD value of all your assets in your IDRC portfolio. Your IDRC portfolio is limited to Global Markets Assets, Yield Assets, and USDC." />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-end gap-2">
            <span className="text-4xl text-black font-medium">
              Rp {formattedIdrBalance}
            </span>
            <span className="text-lg text-gray-600 pb-1">
              ≈ ${formattedUsdBalance}
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
                Rp {formattedIdrBalance}
              </span>
              <span className="text-sm text-gray-600">
                ≈ ${formattedUsdBalance}
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
                  {formatNumber(Number(balance), {
                    decimals: 2,
                    thousandSeparator: ",",
                  })}
                </td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
