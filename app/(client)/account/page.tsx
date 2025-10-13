import { Metadata } from "next";
import { redirect } from "next/navigation";

import {
  generatePageMetadata,
  pageMetadataConfigs,
} from "@/lib/utils/metadata";

export const metadata: Metadata = generatePageMetadata(
  pageMetadataConfigs.account,
);

export default function Page() {
  redirect("/account/overview");
}
