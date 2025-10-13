import React from "react";
import { Metadata } from "next";

import {
  generatePageMetadata,
  pageMetadataConfigs,
} from "@/lib/utils/metadata";

import Overview from "./_components/overview";

export const metadata: Metadata = generatePageMetadata(
  pageMetadataConfigs.accountOverview,
);

export default function page() {
  return <Overview />;
}
