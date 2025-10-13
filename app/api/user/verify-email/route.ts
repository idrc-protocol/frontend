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

    if (email !== session.user.email) {
      return NextResponse.json(
        { error: "Email does not match your account" },
        { status: 400 },
      );
    }

    const identifier = `email-verification-otp-${email}`;

    const verification = await prisma.verification.findFirst({
      where: {
        identifier: identifier,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!verification) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 },
      );
    }

    const storedOtp = verification.value.split(":")[0];

    if (storedOtp !== otp) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 },
      );
    }

    await prisma.verification.delete({
      where: {
        id: verification.id,
      },
    });

    await prisma.user.update({
      where: { id: session.user.id },
      data: { emailVerified: true },
    });

    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to verify email" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
