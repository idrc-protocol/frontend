import type { Session, User } from "./auth";

import { createAuthClient } from "better-auth/react";
import {
  usernameClient,
  emailOTPClient,
  oneTapClient,
} from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL!,
  plugins: [
    usernameClient(),
    emailOTPClient(),
    oneTapClient({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      autoSelect: false,
      cancelOnTapOutside: true,
      context: "signin",
    }),
  ],
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  forgetPassword,
  resetPassword,
} = authClient;

export type { Session, User };
