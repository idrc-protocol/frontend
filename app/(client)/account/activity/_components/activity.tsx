"use client";

import React from "react";
import { IconTransfer } from "@tabler/icons-react";
import { ExternalLink } from "lucide-react";

import ButtonTooltip from "@/components/tooltip/button-tooltip";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import FallbackImage from "@/components/fallback-image";
import { FALLBACK_IMAGE } from "@/lib/constants";
import { useRequestRedemptions } from "@/hooks/query/graphql/use-request-redemptions";
import { useRequestSubscriptions } from "@/hooks/query/graphql/use-request-subscriptions";
import { assetsInfo } from "@/data/asset-info";
import { formatNumber } from "@/lib/helper/number";
import { Badge } from "@/components/ui/badge";

interface Transaction {
  id: string;
  type: "subscription" | "redemption";
  amount: string;
  shares: string;
  blockTimestamp: string;
  transactionHash: string;
  user: string;
}

function ActivitySkeleton() {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-5 rounded-full mt-1" />
      </div>

      <Card className="p-5">
        <CardContent className="flex flex-col gap-5">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <colgroup>
                <col className="w-[15%]" />
                <col className="w-[15%]" />
                <col className="w-[12%]" />
                <col className="w-[15%]" />
                <col className="w-[18%]" />
                <col className="w-[15%]" />
                <col className="w-[10%]" />
              </colgroup>

              <thead>
                <tr className="border-b">
                  <th className="text-left text-sm font-normal pb-2">
                    <Skeleton className="h-4 w-12" />
                  </th>
                  <th className="text-left text-sm font-normal pb-2">
                    <Skeleton className="h-4 w-14" />
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
                      <Skeleton className="h-4 w-14" />
                    </div>
                  </th>
                  <th className="text-center text-sm font-normal pb-2">
                    <div className="flex justify-center">
                      <Skeleton className="h-4 w-12" />
                    </div>
                  </th>
                  <th className="text-center text-sm font-normal pb-2">
                    <div className="flex justify-center">
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </th>
                </tr>
              </thead>

              <tbody>
                {[1, 2, 3, 4, 5].map((index) => (
                  <tr key={index} className="border-b">
                    <td className="py-3">
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </td>

                    <td className="py-3">
                      <div className="flex items-center gap-1">
                        <Skeleton className="h-4 w-4 rounded" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </td>

                    <td className="py-3 text-center">
                      <div className="flex justify-center">
                        <Skeleton className="h-4 w-4 rounded" />
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

                    <td className="py-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </td>

                    <td className="py-3 text-center">
                      <div className="flex justify-center">
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Activity() {
  const { data: subscriptions, isLoading: isLoadingSubscriptions } =
    useRequestSubscriptions();
  const { data: redemptions, isLoading: isLoadingRedemptions } =
    useRequestRedemptions();

  const transactions: Transaction[] = React.useMemo(() => {
    const subs = subscriptions.map((sub) => ({
      ...sub,
      type: "subscription" as const,
    }));
    const redems = redemptions.map((redem) => ({
      ...redem,
      type: "redemption" as const,
    }));

    return [...subs, ...redems].sort(
      (a, b) => Number(b.blockTimestamp) - Number(a.blockTimestamp),
    );
  }, [subscriptions, redemptions]);

  const isLoading = isLoadingSubscriptions || isLoadingRedemptions;
  const assetInfo = assetsInfo[0];

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center gap-2">
        <span className="text-black text-2xl font-medium">
          Account Activity
        </span>
        <ButtonTooltip
          className="mt-1"
          iconSize={5}
          text="This section displays all mint and redeem activities within IDRC Protocol. Please note that bridge, convert, and transfer transactions are not included."
        />
      </div>

      {isLoading ? (
        <ActivitySkeleton />
      ) : (
        <Card className="p-5">
          <CardContent className="flex flex-col gap-5">
            {transactions.length === 0 ? (
              <div className="flex flex-col justify-center items-center min-h-40 gap-2">
                <IconTransfer className="bg-neutral-100 h-10 w-10 p-2 rounded-full text-neutral-700" />
                <p className="text-sm text-neutral-500 max-w-sm text-center">
                  No transactions yet. When you make your first transaction, it
                  will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-fixed">
                  <colgroup>
                    <col className="w-[15%]" />
                    <col className="w-[15%]" />
                    <col className="w-[12%]" />
                    <col className="w-[15%]" />
                    <col className="w-[18%]" />
                    <col className="w-[15%]" />
                    <col className="w-[10%]" />
                  </colgroup>

                  <thead>
                    <tr className="border-b">
                      <th className="text-left text-sm font-normal pb-2">
                        Type
                      </th>
                      <th className="text-left text-sm font-normal pb-2">
                        Asset
                      </th>
                      <th className="text-center text-sm font-normal pb-2">
                        Network
                      </th>
                      <th className="text-right text-sm font-normal pb-2">
                        Amount
                      </th>
                      <th className="text-right text-sm font-normal pb-2">
                        Shares
                      </th>
                      <th className="text-center text-sm font-normal pb-2">
                        Date
                      </th>
                      <th className="text-center text-sm font-normal pb-2">
                        Tx Hash
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {transactions.map((tx) => {
                      const amount = Number(tx.amount) / 1e18;
                      const shares = Number(tx.shares) / 1e18;
                      const date = new Date(Number(tx.blockTimestamp) * 1000);
                      const shortHash = `${tx.transactionHash.slice(0, 6)}...${tx.transactionHash.slice(-4)}`;

                      return (
                        <tr key={tx.id} className="border-b hover:bg-gray-50">
                          <td className="py-3">
                            <Badge
                              className="text-xs"
                              variant={
                                tx.type === "subscription"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {tx.type === "subscription" ? "Buy" : "Sell"}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-1">
                              <FallbackImage
                                alt={assetInfo.symbol}
                                className="inline w-4 h-4"
                                fallback={FALLBACK_IMAGE}
                                height={200}
                                src={assetInfo.iconSrc}
                                width={200}
                              />
                              <span className="font-medium text-sm truncate">
                                {assetInfo.symbol}
                              </span>
                            </div>
                          </td>

                          <td className="py-3 text-center">
                            <FallbackImage
                              alt="Chain"
                              className="inline w-4 h-4"
                              fallback={FALLBACK_IMAGE}
                              height={200}
                              src="/images/chains/base.webp"
                              width={200}
                            />
                          </td>

                          <td className="py-3 text-sm font-medium text-right">
                            {formatNumber(amount, {
                              decimals: 2,
                              thousandSeparator: ",",
                            })}
                          </td>

                          <td className="py-3 text-sm font-medium text-right">
                            {formatNumber(shares, {
                              decimals: 2,
                              thousandSeparator: ",",
                            })}
                          </td>

                          <td className="py-3 text-xs text-center text-gray-600">
                            <div className="flex flex-col">
                              <span>{date.toLocaleDateString()}</span>
                              <span className="text-gray-400">
                                {date.toLocaleTimeString()}
                              </span>
                            </div>
                          </td>

                          <td className="py-3 text-center">
                            <a
                              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
                              href={`https://sepolia.basescan.org/tx/${tx.transactionHash}`}
                              rel="noopener noreferrer"
                              target="_blank"
                            >
                              {shortHash}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
