import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { useSession, authClient } from "@/lib/auth-client";

import {
  invalidateUserProfileCache,
  invalidateUserDataCache,
} from "../utils/cache-invalidation";

interface UserSettings {
  hasPassword: boolean;
  emailVerified: boolean;
  username?: string;
  email?: string;
  name?: string;
  image?: string | null;
  createdAt?: string;
}

export const useUserSettings = (userId?: string) => {
  const { data: session } = useSession();

  return useQuery<UserSettings>({
    queryKey: ["userSettings", userId],
    queryFn: async (): Promise<UserSettings> => {
      const hasPasswordResponse = await fetch("/api/user/has-password");

      const hasPasswordData = hasPasswordResponse.ok
        ? await hasPasswordResponse.json()
        : { hasPassword: false };

      return {
        hasPassword: hasPasswordData.hasPassword || false,
        emailVerified: session?.user?.emailVerified || false,
        username: session?.user?.username || undefined,
        email: session?.user?.email,
        name: session?.user?.name,
        image: session?.user?.image,
        createdAt: session?.user?.createdAt?.toISOString(),
      };
    },
    enabled: !!userId && !!session,
    staleTime: 300000,
  });
};

export const useUpdateUsername = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { username: string }) => {
      const { data: result, error } = await authClient.updateUser({
        username: data.username,
      });

      if (error) {
        throw new Error(error.message || "Failed to update username");
      }

      return result;
    },
    onSuccess: () => {
      invalidateUserDataCache(queryClient);
    },
  });
};

export const useChangePassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      currentPassword?: string;
      newPassword: string;
      revokeOtherSessions?: boolean;
    }) => {
      const { data: result, error } = await authClient.changePassword({
        newPassword: data.newPassword,
        currentPassword: data.currentPassword || "",
        revokeOtherSessions: data.revokeOtherSessions || false,
      });

      if (error) {
        throw new Error(error.message || "Failed to change password");
      }

      return result;
    },
    onSuccess: () => {
      invalidateUserDataCache(queryClient);
    },
  });
};

export const useSendVerificationEmail = () => {
  return useMutation({
    mutationFn: async (data: { email: string }) => {
      const { data: result, error } =
        await authClient.emailOtp.sendVerificationOtp({
          email: data.email,
          type: "email-verification",
        });

      if (error) {
        throw new Error(error.message || "Failed to send verification email");
      }

      return result;
    },
  });
};

export const useVerifyEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { email: string; otp: string }) => {
      const { data: result, error } = await authClient.emailOtp.verifyEmail({
        email: data.email,
        otp: data.otp,
      });

      if (error) {
        throw new Error(error.message || "Invalid verification code");
      }

      return result;
    },
    onSuccess: () => {
      invalidateUserDataCache(queryClient);
    },
  });
};

export const useUpdateProfileImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { image: string }) => {
      const { data: result, error } = await authClient.updateUser({
        image: data.image,
      });

      if (error) {
        throw new Error(error.message || "Failed to update profile image");
      }

      return result;
    },
    onSuccess: (_result, variables) => {
      queryClient.setQueryData(["session"], (oldData: any) => {
        if (oldData?.user) {
          return {
            ...oldData,
            user: {
              ...oldData.user,
              image: variables.image,
            },
          };
        }

        return oldData;
      });

      queryClient.setQueriesData(
        { queryKey: ["userSettings"] },
        (oldData: any) => {
          if (oldData) {
            return {
              ...oldData,
              image: variables.image,
            };
          }

          return oldData;
        },
      );

      setTimeout(() => {
        invalidateUserProfileCache(queryClient);
        invalidateUserDataCache(queryClient);
      }, 1000);
    },
  });
};

export const useUpdateName = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string }) => {
      const { data: result, error } = await authClient.updateUser({
        name: data.name,
      });

      if (error) {
        throw new Error(error.message || "Failed to update name");
      }

      return result;
    },
    onSuccess: () => {
      invalidateUserProfileCache(queryClient);
    },
  });
};
