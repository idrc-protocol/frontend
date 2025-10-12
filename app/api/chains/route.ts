import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const chains = await prisma.chain.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      chains,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch chains" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
