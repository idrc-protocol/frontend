import React from "react";
import { Metadata } from "next";

import {
  generatePageMetadata,
  pageMetadataConfigs,
} from "@/lib/utils/metadata";

import Onboard from "./_components/onboard";

export const metadata: Metadata = generatePageMetadata(
  pageMetadataConfigs.onboard,
);

export default function page() {
  return <Onboard />;
}
