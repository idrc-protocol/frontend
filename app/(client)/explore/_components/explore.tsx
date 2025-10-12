"use client";

import React from "react";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { assetData } from "@/data/asset.data";
import { generateChartPath } from "@/components/chart/generate-chart-path";
import FallbackImage from "@/components/fallback-image";
import { AnimatedNumber } from "@/components/animations/animated-number";

export default function Explore() {
  return (
    <div className="flex flex-col gap-10 mt-5">
      <div className="flex items-center gap-2">
        <span className="text-black text-2xl font-medium">Explore Assets</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {assetData.map((asset, idx) => {
          const price = parseFloat(asset.primaryMarket.price);

          const change = Math.abs(
            parseFloat(asset.primaryMarket.priceChange24h),
          );
          const changePercent = Math.abs(
            parseFloat(asset.primaryMarket.priceChangePct24h),
          );

          const isPositive = true;

          const generateStraightUpwardData = (
            basePrice: number,
            points: number = 24,
          ) => {
            const data = [];
            const startPrice = basePrice * 0.95;
            const endPrice = basePrice * 1.05;
            const increment = (endPrice - startPrice) / (points - 1);

            for (let i = 0; i < points; i++) {
              const value = startPrice + increment * i;

              data.push(value);
            }

            return data;
          };

          const straightUpwardData = generateStraightUpwardData(price);
          const { linePath, areaPath } = generateChartPath(
            straightUpwardData,
            285.5,
            127,
          );

          const ArrowIcon = () => (
            <svg
              className={`${isPositive ? "rotate-0" : "rotate-180"}`}
              fill="none"
              height="10"
              viewBox="0 0 9 8"
              width="12"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3.55664 1.03405C3.96466 0.455283 4.83534 0.455284 5.24337 1.03405L8.61559 5.81746C9.08702 6.48617 8.60003 7.39998 7.77223 7.39998H1.02777C0.199975 7.39998 -0.287019 6.48617 0.184406 5.81746L3.55664 1.03405Z"
                fill="currentColor"
              />
            </svg>
          );

          return (
            <Link
              key={idx}
              className="cursor-pointer group"
              href={`/assets/${asset.symbol}`}
            >
              <Card className="p-5">
                <CardContent className="flex flex-col gap-5">
                  <div className="flex items-center gap-3">
                    <FallbackImage
                      alt={asset.assetName}
                      className="rounded-full w-11 h-11"
                      height={40}
                      src={asset.iconSrc}
                      width={40}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{asset.symbol}</span>
                      <p className="text-sm">{asset.assetName}</p>
                    </div>
                  </div>

                  <div
                    className={`bg-opacity-70 rounded-3xl mt-2 overflow-hidden transition-colors ${
                      isPositive
                        ? "bg-green-50 group-hover:bg-green-100"
                        : "bg-red-50 group-hover:bg-red-100"
                    }`}
                  >
                    <div className="pt-6 px-6 h-32 flex flex-col">
                      <h2 className="mb-1.5 text-2xl sm:text-[28px] font-medium leading-none tracking-tight">
                        $<AnimatedNumber value={price.toFixed(2)} />
                      </h2>
                      <div
                        className={`flex items-center gap-1 ${
                          isPositive ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        <ArrowIcon />
                        <p className="text-sm font-normal leading-[132%] font-mono">
                          {change.toFixed(2)} ({changePercent.toFixed(2)}%) 24H
                        </p>
                      </div>
                    </div>

                    <div className="h-32">
                      <svg
                        aria-label="Price Chart"
                        className="w-full h-full"
                        height="127"
                        preserveAspectRatio="none"
                        viewBox="0 0 285.5 127"
                        width="285.5"
                      >
                        <defs>
                          <linearGradient
                            id={`gradient-${idx}`}
                            x1="0"
                            x2="0"
                            y1="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor={isPositive ? "#1DA66A" : "#EF4444"}
                              stopOpacity="0.24"
                            />
                            <stop
                              offset="100%"
                              stopColor={isPositive ? "#1DA66A" : "#EF4444"}
                              stopOpacity="0"
                            />
                          </linearGradient>
                        </defs>

                        <path
                          d={areaPath}
                          fill={`url(#gradient-${idx})`}
                          stroke="transparent"
                        />
                        <path
                          d={linePath}
                          fill="transparent"
                          stroke={isPositive ? "#1DA66A" : "#EF4444"}
                          strokeWidth="2"
                        />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
