import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { kycVerified: true },
      select: {
        id: true,
        email: true,
        name: true,
        kycVerified: true,
      },
    });

    await prisma.session.updateMany({
      where: { userId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
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
