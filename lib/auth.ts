import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { username, emailOTP, oneTap, captcha } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";

import { sendPasswordResetEmail } from "./resend";
import { sendVerificationOTP } from "./resend";

if (process.env.NODE_ENV === "production" && typeof window === "undefined") {
  try {
    require("dotenv").config({ path: ".env" });
  } catch {}
}

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, token }) => {
      const resetUrl = `${process.env.BETTER_AUTH_URL}/auth/reset-password?token=${token}`;

      await sendPasswordResetEmail(user.email, resetUrl, user.name);
    },
  },
  socialProviders: {
    google: {
      enabled: true,
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,
  plugins: [
    ...(process.env.NODE_ENV === "production"
      ? [
          captcha({
            provider: "cloudflare-turnstile",
            secretKey: process.env.TURNSTILE_SECRET_KEY!,
          }),
        ]
      : []),
    username(),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        await sendVerificationOTP(email, otp, type);
      },
      sendVerificationOnSignUp: false,
    }),
    oneTap(),
    nextCookies(),
  ],
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  advanced: {
    disableCSRFCheck: true,
    defaultCookieAttributes: {
      domain: "app.idrc.site; farcaster.xyz; warpcast.com",
    },
    cookiePrefix: "better-auth",
    crossSubDomainCookies: {
      enabled: true,
    },
    useSecureCookies: process.env.NODE_ENV === "production",
    generateId: () => crypto.randomUUID(),
  },
  trustedOrigins: [
    "https://app.idrc.site",
    "https://frames.warpcast.com",
    "https://client.warpcast.com",
    "https://farcaster.xyz",
  ],
});

export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;
