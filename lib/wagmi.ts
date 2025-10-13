import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { createStorage } from "wagmi";

import { siteConfig } from "@/config/site";

const config = getDefaultConfig({
  appName: siteConfig.name,
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || "",
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http("https://base-sepolia.drpc.org"),
  },
  ssr: true,
  storage: createStorage({
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  }),
});

export { config };
