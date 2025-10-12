import type { Metadata } from "next/types";

export function createMetadata(override: Metadata): Metadata {
  return {
    ...override,
    openGraph: {
      title: override.title ?? undefined,
      description: override.description ?? undefined,
      url: process.env.NEXT_PUBLIC_APP_URL,
      images: "https://demo.better-auth.com/og.png",
      siteName: "Better Auth",
      ...override.openGraph,
    },
  };
}

export const baseUrl =
  process.env.NODE_ENV === "development"
    ? new URL("http://localhost:3000")
    : new URL(`https://${process.env.VERCEL_URL!}`);
