import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";

import GeneratedAvatar from "./generated-avatar";

const ButtonCustom = ({
  children,
  onClick,
  variant = "gradient",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "gradient" | "ghost";
}) => (
  <Button
    className="flex items-center justify-center px-4 py-6 rounded-full !font-ibm-plex-mono font-normal uppercase tracking-caption font-base truncate"
    variant={variant}
    onClick={onClick}
  >
    {children}
  </Button>
);

const ButtonCustomConnected = ({
  children,
  onClick,
  variant = "secondary",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "secondary" | "ghost";
}) => (
  <Button
    className="flex items-center justify-center px-2 py-6 rounded-full !font-ibm-plex-mono font-normal uppercase tracking-caption font-base truncate"
    variant={variant}
    onClick={onClick}
  >
    {children}
  </Button>
);

export const ConnectButtonCustom = () => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        if (!mounted) {
          return (
            <div
              aria-hidden="true"
              style={{
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              }}
            />
          );
        }

        const connected = account && chain;

        if (!connected) {
          return (
            <ButtonCustom variant="gradient" onClick={openConnectModal}>
              Connect Wallet
            </ButtonCustom>
          );
        }

        if (chain?.unsupported) {
          return (
            <ButtonCustom onClick={openChainModal}>Wrong network</ButtonCustom>
          );
        }

        return (
          <div className="flex gap-3 z-50">
            <ButtonCustomConnected onClick={openAccountModal}>
              <GeneratedAvatar
                address={account.address as string}
                size="35px"
              />
              <div className="flex flex-col items-start">
                <span className="text-xs">{account.displayName}</span>
                <div className="capitalize text-xs flex items-center">
                  <div className="bg-green-500 w-1.5 h-1.5 rounded-full mr-1.5" />
                  <span className="text-green-500">wallet connected</span>
                </div>
              </div>
              <ChevronDown className="" />
            </ButtonCustomConnected>
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};
