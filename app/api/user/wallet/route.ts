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
    const body = await request.json();
    const { address, chainId } = body;

    if (!address || !chainId) {
      return NextResponse.json(
        { error: "Wallet address and chainId are required" },
        { status: 400 },
      );
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json(
        { error: "Invalid wallet address format" },
        { status: 400 },
      );
    }

    const chain = await prisma.chain.findUnique({
      where: { chainId: parseInt(chainId) },
    });

    if (!chain) {
      return NextResponse.json({ error: "Invalid chain ID" }, { status: 400 });
    }

    const wallet = await prisma.wallet.upsert({
      where: {
        userId_chainId: {
          userId,
          chainId: chain.id,
        },
      },
      update: {
        address,
      },
      create: {
        address,
        userId,
        chainId: chain.id,
      },
      include: {
        chain: true,
      },
    });

    return NextResponse.json({
      success: true,
      wallet,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to add wallet" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const wallets = await prisma.wallet.findMany({
      where: { userId },
      include: {
        chain: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      wallets,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch wallets" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const walletId = searchParams.get("id");

    if (!walletId) {
      return NextResponse.json(
        { error: "Wallet ID is required" },
        { status: 400 },
      );
    }

    const wallet = await prisma.wallet.findFirst({
      where: {
        id: walletId,
        userId,
      },
    });

    if (!wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    await prisma.wallet.delete({
      where: { id: walletId },
    });

    return NextResponse.json({
      success: true,
      message: "Wallet deleted successfully",
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete wallet" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
