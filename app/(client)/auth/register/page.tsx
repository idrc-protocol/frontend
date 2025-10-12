import React from "react";
import { Metadata } from "next";

import {
  generatePageMetadata,
  pageMetadataConfigs,
} from "@/lib/utils/metadata";

import Register from "./_components/register";

export const metadata: Metadata = generatePageMetadata(
  pageMetadataConfigs.auth,
);
export default function page() {
  return <Register />;
}
