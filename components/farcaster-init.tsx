"use client";

import { sdk } from "@farcaster/miniapp-sdk";
import { useEffect } from "react";

export function FarcasterInit() {
  useEffect(() => {
    const initializeFarcaster = async () => {
      try {
        await sdk.actions.ready();
      } catch (error) {
        throw error;
      }
    };

    initializeFarcaster();
  }, []);

  return null;
}
