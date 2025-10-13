"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import ButtonTooltip from "@/components/tooltip/button-tooltip";
import { Button } from "@/components/ui/button";
import FallbackImage from "@/components/fallback-image";
import { FALLBACK_IMAGE } from "@/lib/constants";
import { assetData } from "@/data/asset.data";
import { useSession } from "@/lib/auth-client";
import { useOnboardingStatus } from "@/hooks/query/api/use-onboarding-status";

function OnboardingSkeleton() {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-40" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[1, 2].map((index) => (
          <Card key={index} className="p-5">
            <CardContent className="flex flex-col gap-5">
              <div>
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <Skeleton className="w-10 h-10 rounded" />
                    <div className="flex flex-col gap-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-10 w-24" />
                </div>

                <Separator className="my-5" orientation="horizontal" />

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-sm">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-32" />
                  </div>

                  <div className="flex justify-between text-sm">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>

                  <div className="flex justify-between text-sm">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-28" />
                  </div>

                  <div className="flex justify-between text-sm">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>

                  <div className="flex justify-between text-sm">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-56" />
                  </div>

                  <div className="flex justify-between text-sm">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function Onboarding() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const userId = session?.user?.id;

  const { data: userStatus, isLoading, error } = useOnboardingStatus(userId);

  const assets = assetData;

  useEffect(() => {
    if (isPending || isLoading) {
      return;
    }

    if (!session?.user) {
      router.push("/auth/auth/login");

      return;
    }

    if (error) {
      router.push("/onboard");

      return;
    }
  }, [session, isPending, isLoading, error, router]);

  const handleBuyClick = (assetSymbol: string) => {
    router.push(`/assets/${assetSymbol}`);
  };

  const handleVerifyClick = () => {
    router.push("/account/settings");
  };

  const handleStartKycClick = () => {
    router.push("/onboard");
  };

  const handleAddWalletClick = () => {
    router.push("/onboard");
  };

  if (isPending || isLoading || !userStatus) {
    return <OnboardingSkeleton />;
  }

  const getActionButton = () => {
    if (!userStatus.isEmailVerified) {
      return {
        text: "Verify",
        onClick: handleVerifyClick,
        variant: "destructive" as const,
      };
    }
    if (!userStatus.hasKyc) {
      return {
        text: "Start KYC",
        onClick: handleStartKycClick,
        variant: "secondary" as const,
      };
    }
    if (!userStatus.hasWallet) {
      return {
        text: "Add Wallet",
        onClick: handleAddWalletClick,
        variant: "secondary" as const,
      };
    }

    return null;
  };

  const actionButton = getActionButton();

  const getStatusInfo = () => {
    if (!userStatus.isEmailVerified) {
      return {
        status: "Email Verification Required",
        statusColor: "text-red-600",
        emailStatus: "Not Verified",
        emailColor: "text-red-600",
        kycStatus: "Pending",
        kycColor: "text-gray-500",
        walletStatus: "Pending",
        walletColor: "text-gray-500",
      };
    }
    if (!userStatus.hasKyc) {
      return {
        status: "KYC Verification Required",
        statusColor: "text-orange-600",
        emailStatus: "Verified",
        emailColor: "text-green-600",
        kycStatus: "Not Completed",
        kycColor: "text-red-600",
        walletStatus: "Pending",
        walletColor: "text-gray-500",
      };
    }
    if (!userStatus.hasWallet) {
      return {
        status: "Wallet Connection Required",
        statusColor: "text-orange-600",
        emailStatus: "Verified",
        emailColor: "text-green-600",
        kycStatus: "Verified",
        kycColor: "text-green-600",
        walletStatus: "Not Connected",
        walletColor: "text-red-600",
      };
    }

    return {
      status: "Ready to Buy",
      statusColor: "text-green-600",
      emailStatus: "Verified",
      emailColor: "text-green-600",
      kycStatus: "Verified",
      kycColor: "text-green-600",
      walletStatus: "Connected",
      walletColor: "text-green-600",
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center gap-2">
        <span className="text-black text-2xl font-medium">Onboarding</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {assets.map((asset) => (
          <Card key={asset.symbol} className="p-5">
            <CardContent className="flex flex-col gap-5">
              <div>
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <FallbackImage
                      alt="Token"
                      className="w-10 h-10"
                      fallback={FALLBACK_IMAGE}
                      height={150}
                      src={asset.iconSrc}
                      width={150}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">
                        {asset.symbol}
                      </span>
                      <p className="text-xs">{asset.assetName}</p>
                    </div>
                  </div>

                  {actionButton ? (
                    <Button
                      variant={actionButton.variant}
                      onClick={actionButton.onClick}
                    >
                      {actionButton.text}
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      onClick={() => handleBuyClick(asset.symbol)}
                    >
                      Buy
                    </Button>
                  )}
                </div>

                <Separator className="my-5" orientation="horizontal" />

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-sm">
                    <span>Status</span>
                    <span className={`${statusInfo.statusColor} font-medium`}>
                      {statusInfo.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Email Verification</span>
                    <span className={statusInfo.emailColor}>
                      {statusInfo.emailStatus}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>KYC Status</span>
                    <span className={statusInfo.kycColor}>
                      {statusInfo.kycStatus}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Wallet</span>
                    <span className={statusInfo.walletColor}>
                      {statusInfo.walletStatus}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Eligibility</span>
                    <span className="underline">
                      Global (Non-US); other restrictions apply
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Minimum Purchase</span>
                    <div className="flex items-center gap-1">
                      <span>100 USDC</span>
                      <ButtonTooltip text="For bank wire or direct stablecoin transfer subscriptions, the minimum purchase is $100,000 USD." />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
