import { ConnectButton } from "@rainbow-me/rainbowkit";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const ButtonCustom = ({
  children,
  onClick,
  variant = "outline",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "outline" | "ghost";
}) => (
  <Button
    className="flex items-center justify-center px-4 py-7 !font-ibm-plex-mono font-normal uppercase tracking-caption font-base truncate text-dark-500 light:text-light-500"
    variant={variant}
    onClick={onClick}
  >
    {children}
  </Button>
);

export const ConnectButtonCustom = () => {
  return (
    <ConnectButton.Custom>
      {({ chain, openChainModal, openConnectModal, mounted }) => {
        if (!mounted) {
          return <Skeleton className="h-10 px-4 py-2 rounded-md w-32" />;
        }

        if (chain?.unsupported) {
          return (
            <ButtonCustom onClick={openChainModal}>Wrong network</ButtonCustom>
          );
        }

        return (
          <ButtonCustom variant="outline" onClick={openConnectModal}>
            Connect Wallet
          </ButtonCustom>
        );
      }}
    </ConnectButton.Custom>
  );
};
