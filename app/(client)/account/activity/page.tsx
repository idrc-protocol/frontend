import React from "react";
import { Metadata } from "next";

import {
  generatePageMetadata,
  pageMetadataConfigs,
} from "@/lib/utils/metadata";

import Activity from "./_components/activity";

export const metadata: Metadata = generatePageMetadata(
  pageMetadataConfigs.accountActivity,
);

export default function page() {
  return <Activity />;
}
