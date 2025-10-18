"use client";
import React from "react";
import Link from "next/link";

import WorldMap from "@/components/ui/world-map";
import FallbackImage from "@/components/fallback-image";
import RotatingText from "@/components/rotating-text";
import { Button } from "@/components/ui/button";
import { usePriceFeed } from "@/hooks/query/api/use-price-feed";
import { formatNumber } from "@/lib/helper/number";

export default function Idrc() {
  const { data } = usePriceFeed();

  return (
    <div className="w-screen min-h-svh pt-20 relative px-10 bg-[#e8f0ff]">
      <div className="absolute top-0 left-0 w-full h-[35vh] bg-gradient-to-b from-white/60 via-transparent to-transparent z-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-[35vh] bg-gradient-to-t from-white/60 via-transparent to-transparent z-20 pointer-events-none" />
      <div className="flex flex-col gap-5 h-full z-10 relative max-w-xl pt-20">
        <div className="flex items-center gap-2">
          <FallbackImage
            alt="IDRC Logo"
            className="h-12 w-auto"
            height={150}
            src="/idrc-token.png"
            width={150}
          />
          <div className="flex flex-col -mt-1">
            <h2 className="text-2xl font-medium">IDRC</h2>
            <span className="text-sm font-medium">Indonesia Rupiah Coin</span>
          </div>
        </div>

        <div className="flex flex-col">
          <span className="text-[60px]">The Global Standard</span>
          <div className="text-[60px] leading-10 flex items-center gap-2">
            <span>for </span>
            <RotatingText
              animate={{ y: 0 }}
              exit={{ y: "-140%" }}
              initial={{ y: "140%" }}
              mainClassName="px-2 sm:px-2 md:px-3 bg-cyan-300 text-black font-semibold overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg"
              rotationInterval={4500}
              splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-3"
              staggerDuration={0.05}
              staggerFrom="last"
              texts={[
                "Payment",
                "DeFi",
                "Remittance",
                "Stable Asset",
                "Collateral",
                "Loyalty",
                "Yield",
              ]}
              transition={{
                type: "spring",
                damping: 40,
                stiffness: 300,
                mass: 1.2,
                duration: 0.8,
              }}
            />
          </div>
        </div>

        <span className="text-neutral-700">
          The world&apos;s leading permissionless yieldcoin combining the trust
          of stablecoins with the power of DeFi.
        </span>

        <div className="flex items-center gap-2">
          <Link href={"/assets/IDRC"}>
            <Button className="py-5 px-5" variant={"default"}>
              Buy IDRC
            </Button>
          </Link>
          <Link href={"/assets/IDRC"}>
            <Button
              className="py-5 px-5 bg-neutral-400/30 hover:bg-neutral-400/50"
              variant={"secondary"}
            >
              Redeem IDRC
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-5">
          <div>
            <span className="text-sm">Price</span>
            <h2 className="text-4xl font-medium">
              {formatNumber(data?.idrToUsd || 0, {
                decimals: 5,
                prefix: "$",
              })}
            </h2>
          </div>
          <div>
            <span className="text-sm">APY</span>
            <h2 className="text-4xl font-medium">
              {formatNumber(4.56, { decimals: 2, suffix: "%" })}
            </h2>
          </div>
          <div>
            <span className="text-sm">TVL</span>
            <h2 className="text-4xl font-medium">
              {formatNumber(67000000, {
                decimals: 0,
                prefix: "$",
                compact: true,
              })}
            </h2>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="font-medium">Available on</span>
          <div>
            <FallbackImage
              alt="Chain Logo"
              className="h-7 w-auto"
              height={40}
              src="/images/brands/base.webp"
              width={40}
            />
          </div>
        </div>
      </div>

      <div className="absolute top-1/2  -translate-y-1/2 right-0 w-[60vw] z-0">
        <WorldMap
          dots={[
            {
              start: {
                lat: 64.2008,
                lng: -149.4937,
              },
              end: {
                lat: 34.0522,
                lng: -118.2437,
              },
            },
            {
              start: { lat: 64.2008, lng: -149.4937 },
              end: { lat: -15.7975, lng: -47.8919 },
            },
            {
              start: { lat: -15.7975, lng: -47.8919 },
              end: { lat: 38.7223, lng: -9.1393 },
            },
            {
              start: { lat: 51.5074, lng: -0.1278 },
              end: { lat: 28.6139, lng: 77.209 },
            },
            {
              start: { lat: 28.6139, lng: 77.209 },
              end: { lat: 43.1332, lng: 131.9113 },
            },
            {
              start: { lat: 28.6139, lng: 77.209 },
              end: { lat: -1.2921, lng: 36.8219 },
            },
          ]}
        />
      </div>
    </div>
  );
}
