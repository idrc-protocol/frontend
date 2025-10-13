import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 },
      );
    }

    // Verify email matches the session user
    if (email !== session.user.email) {
      return NextResponse.json(
        { error: "Email does not match your account" },
        { status: 400 },
      );
    }

    // Better Auth stores OTPs with format: "email-verification-otp-{email}"
    const identifier = `email-verification-otp-${email}`;

    // Check if OTP exists and is valid in the verification table
    // Get the most recent one first
    const verification = await prisma.verification.findFirst({
      where: {
        identifier: identifier,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!verification) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 },
      );
    }

    // Better Auth stores the value as "OTP:counter" format
    const storedOtp = verification.value.split(":")[0];

    if (storedOtp !== otp) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 },
      );
    }

    // Delete the used OTP
    await prisma.verification.delete({
      where: {
        id: verification.id,
      },
    });

    // Update user's email verification status
    await prisma.user.update({
      where: { id: session.user.id },
      data: { emailVerified: true },
    });

    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error: any) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify email" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
