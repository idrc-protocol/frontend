import React, { Suspense } from "react";
import { Metadata } from "next";

import {
  generatePageMetadata,
  pageMetadataConfigs,
} from "@/lib/utils/metadata";
import Loading from "@/components/loader/loading";

import Settings from "./_components/settings";

export const metadata: Metadata = generatePageMetadata(
  pageMetadataConfigs.accountSettings,
);

export default function page() {
  return (
    <Suspense fallback={<Loading />}>
      <Settings />
    </Suspense>
  );
}
