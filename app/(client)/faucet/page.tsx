import { Metadata } from "next";

import {
  generatePageMetadata,
  pageMetadataConfigs,
} from "@/lib/utils/metadata";

import Faucet from "./_components/faucet";

export const metadata: Metadata = generatePageMetadata(
  pageMetadataConfigs.faucet,
);

export default function page() {
  return <Faucet />;
}
