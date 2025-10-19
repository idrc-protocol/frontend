import { useQuery } from "@tanstack/react-query";

import { useSession } from "@/lib/auth-client";

interface KycStatusResponse {
  kycVerified: boolean;
  applicantId?: string;
  user?: {
    emailVerified: boolean;
  };
}

interface OnboardingStatus {
  isEmailVerified: boolean;
  hasKyc: boolean;
  hasWallet: boolean;
}

export const useKycStatus = (userId?: string) => {
  return useQuery<KycStatusResponse>({
    queryKey: ["kycStatus", userId],
    queryFn: async () => {
      const response = await fetch("/api/user/kyc-status");

      if (!response.ok) {
        throw new Error(`KYC status check failed: ${response.status}`);
      }

      return response.json();
    },
    enabled: !!userId,
    staleTime: 300000,
  });
};

export const useOnboardingStatus = (userId?: string) => {
  const { data: session } = useSession();

  return useQuery<OnboardingStatus>({
    queryKey: ["onboardingStatus", userId],
    queryFn: async () => {
      const [kycResponse, walletResponse] = await Promise.all([
        fetch("/api/user/kyc-status"),
        fetch("/api/user/wallet"),
      ]);

      if (!kycResponse.ok) {
        throw new Error(`KYC status check failed: ${kycResponse.status}`);
      }

      if (!walletResponse.ok) {
        throw new Error(`Wallet status check failed: ${walletResponse.status}`);
      }

      const kycData = await kycResponse.json();
      const walletData = await walletResponse.json();

      return {
        isEmailVerified: session?.user?.emailVerified || false,
        hasKyc: kycData.kycVerified || false,
        hasWallet: walletData.wallets && walletData.wallets.length > 0,
      };
    },
    enabled: !!userId && !!session,
    staleTime: 300000,
  });
};
