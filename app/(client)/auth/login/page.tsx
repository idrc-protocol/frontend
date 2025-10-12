import React from "react";
import { Metadata } from "next";

import {
  generatePageMetadata,
  pageMetadataConfigs,
} from "@/lib/utils/metadata";

import Login from "./_components/login";

export const metadata: Metadata = generatePageMetadata(
  pageMetadataConfigs.auth,
);

export default function page() {
  return <Login />;
}
