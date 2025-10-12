import { Metadata } from "next";
import { redirect } from "next/navigation";

import {
  generatePageMetadata,
  pageMetadataConfigs,
} from "@/lib/utils/metadata";

export const metadata: Metadata = generatePageMetadata(
  pageMetadataConfigs.auth,
);

export default function Page() {
  redirect("/auth/login");
}
