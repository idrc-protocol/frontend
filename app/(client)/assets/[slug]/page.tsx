import React, { Suspense } from "react";
import { Metadata } from "next";

import {
  generatePageMetadata,
  pageMetadataConfigs,
} from "@/lib/utils/metadata";

import Asset, { AssetSkeleton } from "./_components/asset";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const symbol = slug.toUpperCase();

  return generatePageMetadata({
    ...pageMetadataConfigs.asset,
    title: `${symbol} - Asset Details`,
    description: `View detailed information about ${symbol} token.`,
    keywords: ["asset", "token", symbol, "details", "crypto"],
  });
}

export default async function page({ params }: PageProps) {
  const { slug } = await params;
  const symbol = slug;

  return (
    <Suspense fallback={<AssetSkeleton />}>
      <Asset symbol={symbol} />
    </Suspense>
  );
}
