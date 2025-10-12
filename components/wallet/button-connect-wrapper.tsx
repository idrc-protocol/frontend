import { useConnectModal } from "@rainbow-me/rainbowkit";
import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";

import { Button } from "../ui/button";

export default function ButtonConnectWrapper({
  children,
  className = "",
  variant = "default",
  disabled = false,
}: {
  children?: React.ReactNode;
  className?: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "gradient";
  disabled?: boolean;
}) {
  const { openConnectModal } = useConnectModal();
  const { isConnected } = useAccount();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return !isConnected ? (
    <Button
      className={className}
      disabled={disabled || false}
      variant={variant}
      onClick={openConnectModal}
    >
      Connect Wallet
    </Button>
  ) : (
    <>{children}</>
  );
}
