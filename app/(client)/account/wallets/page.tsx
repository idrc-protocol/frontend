import React from "react";
import { Metadata } from "next";

import {
  generatePageMetadata,
  pageMetadataConfigs,
} from "@/lib/utils/metadata";

import Wallets from "./_components/wallets";

export const metadata: Metadata = generatePageMetadata(
  pageMetadataConfigs.accountWallets,
);

export default function page() {
  return <Wallets />;
}
