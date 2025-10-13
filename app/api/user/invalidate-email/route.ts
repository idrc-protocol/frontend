import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(_request: NextRequest) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { emailVerified: false },
    });

    await prisma.session.updateMany({
      where: { userId: session.user.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: "Email verification status invalidated successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to invalidate email verification" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
