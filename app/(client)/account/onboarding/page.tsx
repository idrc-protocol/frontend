import React from "react";
import { Metadata } from "next";

import {
  generatePageMetadata,
  pageMetadataConfigs,
} from "@/lib/utils/metadata";

import Onboarding from "./_components/onboarding";

export const metadata: Metadata = generatePageMetadata(
  pageMetadataConfigs.accountOnboarding,
);

export default function page() {
  return <Onboarding />;
}
