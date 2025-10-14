"use client";

import { Camera, Check, Edit2, Key, Mail, User, X } from "lucide-react";
import Image from "next/image";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";

import { useAuthContext } from "@/components/providers/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { InputFloating } from "@/components/ui/input-floating";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Separator } from "@/components/ui/separator";
import ImageUploadBox from "@/components/upload/image-upload-box";
import {
  useChangePassword,
  useSendVerificationEmail,
  useUpdateName,
  useUpdateProfileImage,
  useUpdateUsername,
  useUserSettings,
  useVerifyEmail,
} from "@/hooks/query/api/use-user-settings";
import { authClient } from "@/lib/auth-client";

function SettingsSkeleton() {
  return (
    <div className="flex flex-col gap-10 max-w-4xl">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Skeleton className="w-20 h-20 rounded-full" />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <div>
          <div className="flex pb-5">
            <Skeleton className="h-7 w-40" />
          </div>
          <Separator orientation="horizontal" />
          <div className="flex flex-col gap-3 py-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Separator orientation="horizontal" />

            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </div>
            <Separator orientation="horizontal" />

            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Separator orientation="horizontal" />
          </div>
        </div>

        <div>
          <div className="flex pb-5">
            <Skeleton className="h-7 w-40" />
          </div>
          <Separator orientation="horizontal" />
          <div className="flex flex-col gap-3 py-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-16" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </div>
            <Separator orientation="horizontal" />

            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </div>
            <Separator orientation="horizontal" />

            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </div>
            <Separator orientation="horizontal" />

            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Separator orientation="horizontal" />

            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-28" />
            </div>
            <Separator orientation="horizontal" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsContent() {
  const { user } = useAuthContext();
  const userId = user?.id;

  const { data: userSettings, isLoading: isLoadingInitial } =
    useUserSettings(userId);

  const updateUsernameMutation = useUpdateUsername();
  const changePasswordMutation = useChangePassword();
  const sendVerificationEmailMutation = useSendVerificationEmail();
  const verifyEmailMutation = useVerifyEmail();
  const updateProfileImageMutation = useUpdateProfileImage();
  const updateNameMutation = useUpdateName();

  const [isUsernameDialogOpen, setIsUsernameDialogOpen] = useState(false);
  const [isVerifyEmailDialogOpen, setIsVerifyEmailDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isProfileImageDialogOpen, setIsProfileImageDialogOpen] =
    useState(false);
  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newName, setNewName] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [hasProfileImageBeenUpdated, setHasProfileImageBeenUpdated] =
    useState(false);
  const [otp, setOtp] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const hasPassword = userSettings?.hasPassword || false;
  const isEmailVerified = userSettings?.emailVerified || false;

  useEffect(() => {
    const latestImage = userSettings?.image || user?.image || "";

    if (hasProfileImageBeenUpdated) {
      return;
    }

    if (!profileImage && latestImage) {
      setProfileImage(latestImage);
    } else if (
      latestImage &&
      latestImage !== profileImage &&
      !hasProfileImageBeenUpdated
    ) {
      setProfileImage(latestImage);
    }
  }, [
    userSettings?.image,
    user?.image,
    profileImage,
    hasProfileImageBeenUpdated,
  ]);

  const getUserDisplayName = () => {
    if (userSettings?.name || user?.name) {
      return userSettings?.name || user?.name;
    }
    if (userSettings?.email || user?.email) {
      return (userSettings?.email || user?.email)?.split("@")[0];
    }

    return "User";
  };

  const getUserType = () => {
    return "Individual";
  };

  const handleChangeUsername = async () => {
    if (!newUsername.trim()) {
      toast.error("Username cannot be empty");

      return;
    }

    try {
      const { data: availabilityData, error: availabilityError } =
        await authClient.isUsernameAvailable({
          username: newUsername,
        });

      if (availabilityError) {
        toast.error(
          availabilityError.message || "Failed to check username availability",
        );

        return;
      }

      if (!availabilityData?.available) {
        toast.error("Username is already taken");

        return;
      }

      await updateUsernameMutation.mutateAsync({ username: newUsername });
      toast.success("Username updated successfully!");
      setIsUsernameDialogOpen(false);
      setNewUsername("");
      await authClient.getSession();
    } catch (err: any) {
      toast.error(err?.message || "An unexpected error occurred");
    }
  };

  const handleSendVerificationEmail = async () => {
    if (!user?.email) {
      toast.error("No email address found");

      return;
    }

    try {
      await sendVerificationEmailMutation.mutateAsync({ email: user.email });
      toast.success("Verification code sent to your email!");
      setOtpSent(true);
    } catch (err: any) {
      toast.error(err?.message || "An unexpected error occurred");
    }
  };

  const handleChangePassword = async () => {
    try {
      if (hasPassword) {
        if (!newPassword.trim() || !confirmPassword.trim()) {
          toast.error("Please fill in all password fields");

          return;
        }

        if (newPassword !== confirmPassword) {
          toast.error("Passwords do not match");

          return;
        }

        if (newPassword.length < 8) {
          toast.error("Password must be at least 8 characters");

          return;
        }

        if (!currentPassword.trim()) {
          toast.error("Please enter your current password");

          return;
        }

        await changePasswordMutation.mutateAsync({
          newPassword,
          currentPassword,
          revokeOtherSessions: false,
        });

        toast.success("Password changed successfully!");
        setIsPasswordDialogOpen(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        if (!user?.email) {
          toast.error("No email address found");

          return;
        }

        const { data, error } = await authClient.forgetPassword({
          email: user.email,
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });

        if (error) {
          toast.error(error.message || "Failed to send password setup email");

          return;
        }

        if (data) {
          toast.success(
            "Password setup link sent to your email! Please check your inbox.",
          );
          setIsPasswordDialogOpen(false);
          setNewPassword("");
          setConfirmPassword("");
        }
      }
    } catch (err: any) {
      toast.error(err?.message || "An unexpected error occurred");
    }
  };

  const handleVerifyEmail = async () => {
    if (!user?.email) {
      toast.error("No email address found");

      return;
    }

    if (!otp.trim()) {
      toast.error("Please enter the verification code");

      return;
    }

    try {
      await verifyEmailMutation.mutateAsync({
        email: user.email,
        otp: otp,
      });

      toast.success("Email verified successfully!");
      setIsVerifyEmailDialogOpen(false);
      setOtp("");
      setOtpSent(false);
    } catch (err: any) {
      toast.error(err?.message || "An unexpected error occurred");
    }
  };

  const handleUpdateProfileImage = async () => {
    if (!profileImage.trim()) {
      toast.error("Please select an image");

      return;
    }

    try {
      await updateProfileImageMutation.mutateAsync({ image: profileImage });
      toast.success("Profile image updated successfully!");
      setIsProfileImageDialogOpen(false);

      setHasProfileImageBeenUpdated(true);
      setTimeout(() => {
        setHasProfileImageBeenUpdated(false);
      }, 2000);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update profile image");
    }
  };

  const handleUpdateName = async () => {
    if (!newName.trim()) {
      toast.error("Name cannot be empty");

      return;
    }

    try {
      await updateNameMutation.mutateAsync({ name: newName });
      toast.success("Name updated successfully!");
      setIsNameDialogOpen(false);
      setNewName("");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update name");
    }
  };

  if (isLoadingInitial) {
    return <SettingsSkeleton />;
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <p className="text-gray-500">
          Please sign in to view account settings.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 max-w-4xl">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-gray-200">
            {profileImage || userSettings?.image ? (
              <Image
                alt="Profile"
                className="w-full h-full object-cover"
                height={80}
                src={profileImage || userSettings?.image || "/placeholder.jpg"}
                width={80}
              />
            ) : (
              <User className="w-8 h-8 text-gray-400" />
            )}
          </div>
          <Button
            className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-blue-600 hover:bg-blue-700"
            size="sm"
            onClick={() => {
              setIsProfileImageDialogOpen(true);
            }}
          >
            <Camera className="w-4 h-4 text-white" />
          </Button>
        </div>
        <div>
          <span className="text-black text-2xl font-medium">
            Account Settings
          </span>
          <p className="text-sm text-gray-600">
            Manage your account preferences
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <div>
          <div className="flex pb-5">
            <span className="text-lg text-black font-medium">
              Investor Details
            </span>
          </div>
          <Separator orientation="horizontal" />
          <div className="flex flex-col gap-3 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Investor Type</span>
              <p className="text-sm text-black font-medium">{getUserType()}</p>
            </div>
            <Separator orientation="horizontal" />
            <div className="flex items-center justify-between">
              <span className="text-sm">Legal Name</span>
              <div className="flex items-center gap-2">
                <p className="text-sm text-black font-medium">
                  {getUserDisplayName()}
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setNewName(userSettings?.name || user?.name || "");
                    setIsNameDialogOpen(true);
                  }}
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <Separator orientation="horizontal" />
            <div className="flex items-center justify-between">
              <span className="text-sm">Country of Residence</span>
              <p className="text-sm text-black font-medium">-</p>
            </div>
            <Separator orientation="horizontal" />
          </div>
        </div>

        <div>
          <div className="flex pb-5">
            <span className="text-lg text-black font-medium">
              User Preferences
            </span>
          </div>
          <Separator orientation="horizontal" />
          <div className="flex flex-col gap-3 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Email</span>
              <div className="flex items-center gap-2">
                <p className="text-sm text-black font-medium">
                  {user?.email || "Not provided"}
                </p>
                <Badge
                  className="mt-1 flex items-center gap-1"
                  variant={isEmailVerified ? "success" : "destructive"}
                >
                  {isEmailVerified ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <X className="h-3 w-3" />
                  )}
                  {isEmailVerified && <p>Verified</p>}
                </Badge>
              </div>
            </div>
            <Separator orientation="horizontal" />
            {!isEmailVerified && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Verify Email</span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setIsVerifyEmailDialogOpen(true)}
                    >
                      <span>Verify Now</span>
                      <Mail className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <Separator orientation="horizontal" />
              </>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm">Username</span>
              <div className="flex items-center gap-2">
                <p className="text-sm text-black font-medium">
                  {(user as any)?.username || "Not set"}
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setIsUsernameDialogOpen(true)}
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <Separator orientation="horizontal" />
            <div className="flex items-center justify-between">
              <span className="text-sm">Password</span>
              <div className="flex items-center gap-2">
                <p className="text-sm text-black font-medium">
                  {hasPassword ? "••••••••" : "Not set"}
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setIsPasswordDialogOpen(true)}
                >
                  <Key className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <Separator orientation="horizontal" />
            <div className="flex items-center justify-between">
              <span className="text-sm">Full Name</span>
              <p className="text-sm text-black font-medium">
                {getUserDisplayName()}
              </p>
            </div>
            <Separator orientation="horizontal" />
            <div className="flex items-center justify-between">
              <span className="text-sm">Account Created</span>
              <p className="text-sm text-black font-medium">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "Unknown"}
              </p>
            </div>
            <Separator orientation="horizontal" />
          </div>
        </div>
      </div>

      <Dialog
        open={isUsernameDialogOpen}
        onOpenChange={setIsUsernameDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Username</DialogTitle>
            <DialogDescription>
              Enter your new username. It must be unique and can only contain
              letters, numbers, underscores, and hyphens.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <InputFloating
              className="text-sm"
              disabled={updateUsernameMutation.isPending}
              id="username"
              label="Enter new username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              disabled={updateUsernameMutation.isPending}
              variant="outline"
              onClick={() => {
                setIsUsernameDialogOpen(false);
                setNewUsername("");
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={updateUsernameMutation.isPending || !newUsername.trim()}
              onClick={handleChangeUsername}
            >
              {updateUsernameMutation.isPending
                ? "Updating..."
                : "Update Username"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isVerifyEmailDialogOpen}
        onOpenChange={(open) => {
          setIsVerifyEmailDialogOpen(open);
          if (!open) {
            setOtp("");
            setOtpSent(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg w-full">
          <DialogHeader>
            <DialogTitle>Verify Email Address</DialogTitle>
            <DialogDescription>
              {!otpSent
                ? "We'll send a verification code to your email address."
                : "Enter the 6-digit code sent to your email."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            {!otpSent ? (
              <div className="text-sm text-gray-600">
                Click the button below to receive a verification code at{" "}
                <strong>{user?.email}</strong>
              </div>
            ) : (
              <div className="flex justify-center">
                <InputOTP
                  disabled={verifyEmailMutation.isPending}
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              disabled={
                sendVerificationEmailMutation.isPending ||
                verifyEmailMutation.isPending
              }
              variant="outline"
              onClick={() => {
                setIsVerifyEmailDialogOpen(false);
                setOtp("");
                setOtpSent(false);
              }}
            >
              Cancel
            </Button>
            {!otpSent ? (
              <Button
                disabled={sendVerificationEmailMutation.isPending}
                onClick={handleSendVerificationEmail}
              >
                {sendVerificationEmailMutation.isPending
                  ? "Sending..."
                  : "Send Code"}
              </Button>
            ) : (
              <>
                <Button
                  disabled={
                    sendVerificationEmailMutation.isPending ||
                    verifyEmailMutation.isPending
                  }
                  variant="outline"
                  onClick={handleSendVerificationEmail}
                >
                  {sendVerificationEmailMutation.isPending
                    ? "Sending..."
                    : "Resend Code"}
                </Button>
                <Button
                  disabled={verifyEmailMutation.isPending || !otp.trim()}
                  onClick={handleVerifyEmail}
                >
                  {verifyEmailMutation.isPending ? "Verifying..." : "Verify"}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {hasPassword && (
        <Dialog
          open={isPasswordDialogOpen}
          onOpenChange={(open) => {
            setIsPasswordDialogOpen(open);
            if (!open) {
              setCurrentPassword("");
              setNewPassword("");
              setConfirmPassword("");
            }
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Change Password</DialogTitle>
              <DialogDescription>
                Enter your current password and choose a new one.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <InputFloating
                className="text-sm"
                disabled={changePasswordMutation.isPending}
                id="current-password"
                label="Current password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <InputFloating
                className="text-sm"
                disabled={changePasswordMutation.isPending}
                id="new-password"
                label="New password (min 8 characters)"
                minLength={8}
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <InputFloating
                className="text-sm"
                disabled={changePasswordMutation.isPending}
                id="confirm-password"
                label="Confirm new password"
                minLength={8}
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button
                disabled={changePasswordMutation.isPending}
                variant="outline"
                onClick={() => {
                  setIsPasswordDialogOpen(false);
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
              >
                Cancel
              </Button>
              <Button
                disabled={
                  changePasswordMutation.isPending ||
                  !newPassword.trim() ||
                  !confirmPassword.trim() ||
                  !currentPassword.trim()
                }
                onClick={handleChangePassword}
              >
                {changePasswordMutation.isPending
                  ? "Changing..."
                  : "Change Password"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {!hasPassword && (
        <Dialog
          open={isPasswordDialogOpen}
          onOpenChange={(open) => {
            setIsPasswordDialogOpen(open);
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Password</DialogTitle>
              <DialogDescription>
                Set up a password to sign in with email and password in addition
                to Google.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-blue-900 mb-1">
                      How it works
                    </h4>
                    <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                      <li>We&apos;ll send a secure link to your email</li>
                      <li>Click the link to create your password</li>
                      <li>Use either Google or email/password to sign in</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <p className="flex items-center gap-2">
                  <span className="font-medium">Email:</span>
                  <span className="text-black">{user?.email}</span>
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                disabled={changePasswordMutation.isPending}
                variant="outline"
                onClick={() => setIsPasswordDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                disabled={changePasswordMutation.isPending}
                onClick={handleChangePassword}
              >
                {changePasswordMutation.isPending ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        fill="currentColor"
                      />
                    </svg>
                    Sending...
                  </>
                ) : (
                  "Send Setup Email"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog
        open={isProfileImageDialogOpen}
        onOpenChange={setIsProfileImageDialogOpen}
      >
        <DialogPortal>
          <div className="bg-background text-black data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Update Profile Image</DialogTitle>
              <DialogDescription>
                Upload a new profile image. Supported formats: JPG, PNG, GIF.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <div className="flex justify-center">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                  {profileImage ? (
                    <Image
                      alt="Profile Preview"
                      className="w-full h-full object-cover"
                      height={128}
                      src={profileImage}
                      width={128}
                    />
                  ) : (
                    <User className="w-12 h-12 text-gray-400" />
                  )}
                </div>
              </div>
              <ImageUploadBox
                value={profileImage}
                onChange={(url) => {
                  setProfileImage(url);

                  setHasProfileImageBeenUpdated(true);
                }}
              />
            </div>
            <DialogFooter>
              <Button
                disabled={updateProfileImageMutation.isPending}
                variant="outline"
                onClick={() => {
                  setIsProfileImageDialogOpen(false);

                  const originalImage =
                    userSettings?.image || user?.image || "";

                  setProfileImage(originalImage);
                  setHasProfileImageBeenUpdated(false);
                }}
              >
                Cancel
              </Button>
              <Button
                disabled={
                  updateProfileImageMutation.isPending || !profileImage.trim()
                }
                onClick={handleUpdateProfileImage}
              >
                {updateProfileImageMutation.isPending
                  ? "Updating..."
                  : "Update Image"}
              </Button>
            </DialogFooter>
          </div>
        </DialogPortal>
      </Dialog>

      <Dialog open={isNameDialogOpen} onOpenChange={setIsNameDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Name</DialogTitle>
            <DialogDescription>
              Enter your full name as you&apos;d like it to appear on your
              profile.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <InputFloating
              className="text-sm"
              disabled={updateNameMutation.isPending}
              id="name"
              label="Full Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              disabled={updateNameMutation.isPending}
              variant="outline"
              onClick={() => {
                setIsNameDialogOpen(false);
                setNewName("");
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={updateNameMutation.isPending || !newName.trim()}
              onClick={handleUpdateName}
            >
              {updateNameMutation.isPending ? "Updating..." : "Update Name"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function Settings() {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <SettingsContent />
    </Suspense>
  );
}
