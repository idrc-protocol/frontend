import React from "react";
import { Metadata } from "next";

import {
  generatePageMetadata,
  pageMetadataConfigs,
} from "@/lib/utils/metadata";

import Settings from "./_components/settings";

export const metadata: Metadata = generatePageMetadata(
  pageMetadataConfigs.accountSettings,
);

export default function page() {
  return <Settings />;
}
