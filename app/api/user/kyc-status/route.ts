import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        kycVerified: true,
        applicantId: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      kycVerified: user.kycVerified,
      applicantId: user.applicantId,
      user,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to check KYC status" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { applicantId, kycVerified } = body;

    if (!applicantId) {
      return NextResponse.json(
        { error: "applicantId is required" },
        { status: 400 },
      );
    }

    const updateData: { applicantId: string; kycVerified?: boolean } = {
      applicantId,
    };

    if (typeof kycVerified === "boolean") {
      updateData.kycVerified = kycVerified;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        kycVerified: true,
        applicantId: true,
      },
    });

    return NextResponse.json({
      success: true,
      kycVerified: user.kycVerified,
      applicantId: user.applicantId,
      user,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to update KYC status" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
