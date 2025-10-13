"use client";

// import "@/lib/polyfills";
import "@rainbow-me/rainbowkit/styles.css";

import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import React from "react";

import { config } from "@/lib/wagmi";

import { LocaleProvider } from "../contexts/locale-context";

import { AuthProvider } from "./providers/auth-provider";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "./ui/sonner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      enabled: typeof window !== "undefined",
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      disableTransitionOnChange
      enableSystem
      attribute="class"
      defaultTheme="light"
    >
      <LocaleProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <WagmiProvider config={config}>
              <RainbowKitProvider
                initialChain={baseSepolia}
                modalSize="compact"
              >
                <Toaster />
                {children}
              </RainbowKitProvider>
            </WagmiProvider>
          </AuthProvider>
        </QueryClientProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}
