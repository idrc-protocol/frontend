import React, { Suspense } from "react";

import Loading from "@/components/loader/loading";

import Asset from "./_components/asset";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function page({ params }: PageProps) {
  const { slug } = await params;
  const symbol = slug;

  return (
    <Suspense fallback={<Loading />}>
      <Asset symbol={symbol} />
    </Suspense>
  );
}
