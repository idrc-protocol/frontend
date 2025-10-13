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

    // Use Better Auth's sign-in/email-otp endpoint to verify the OTP
    const verificationResult = await fetch(
      `${process.env.BETTER_AUTH_URL}/api/auth/sign-in/email-otp`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      },
    );

    if (!verificationResult.ok) {
      const errorText = await verificationResult.text();
      let errorMessage = "Invalid verification code";

      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // If response is not JSON, use default error message
      }

      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

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
