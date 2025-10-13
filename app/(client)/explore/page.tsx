import React from "react";
import { Metadata } from "next";

import {
  generatePageMetadata,
  pageMetadataConfigs,
} from "@/lib/utils/metadata";

import Explore from "./_components/explore";

export const metadata: Metadata = generatePageMetadata(
  pageMetadataConfigs.explore,
);

export default function page() {
  return <Explore />;
}
