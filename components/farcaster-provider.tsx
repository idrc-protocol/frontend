"use client";

import { sdk } from "@farcaster/miniapp-sdk";
import { useEffect } from "react";

export function FarcasterProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    sdk.actions.ready();
  }, []);

  return <>{children}</>;
}
