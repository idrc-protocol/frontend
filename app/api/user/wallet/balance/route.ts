import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http, formatUnits } from "viem";
import { baseSepolia } from "viem/chains";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { contractAddresses } from "@/lib/constants";

const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    type: "function",
  },
] as const;

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
    });

    if (!wallets || wallets.length === 0) {
      return NextResponse.json({
        success: true,
        balances: {
          idrx: "0",
          idrc: "0",
        },
        walletBalances: [],
      });
    }

    const client = createPublicClient({
      chain: baseSepolia,
      transport: http(),
    });

    const walletBalances = await Promise.all(
      wallets.map(async (wallet) => {
        try {
          const idrxBalance = await client.readContract({
            address: contractAddresses.IDRXToken as `0x${string}`,
            abi: ERC20_ABI,
            functionName: "balanceOf",
            args: [wallet.address as `0x${string}`],
          });

          const idrcBalance = await client.readContract({
            address: contractAddresses.IDRCProxy as `0x${string}`,
            abi: ERC20_ABI,
            functionName: "balanceOf",
            args: [wallet.address as `0x${string}`],
          });

          const idrxFormatted = formatUnits(idrxBalance as bigint, 2);
          const idrcFormatted = formatUnits(idrcBalance as bigint, 18);

          return {
            walletId: wallet.id,
            address: wallet.address,
            chain: wallet.chain.network,
            idrx: idrxFormatted,
            idrc: idrcFormatted,
          };
        } catch {
          return {
            walletId: wallet.id,
            address: wallet.address,
            chain: wallet.chain.network,
            idrx: "0",
            idrc: "0",
          };
        }
      }),
    );

    const totalIdrx = walletBalances.reduce(
      (sum, wb) => sum + parseFloat(wb.idrx),
      0,
    );
    const totalIdrc = walletBalances.reduce(
      (sum, wb) => sum + parseFloat(wb.idrc),
      0,
    );

    return NextResponse.json({
      success: true,
      balances: {
        idrx: totalIdrx.toString(),
        idrc: totalIdrc.toString(),
      },
      walletBalances,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch wallet balances" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
