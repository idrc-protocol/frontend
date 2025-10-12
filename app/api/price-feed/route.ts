import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const base = searchParams.get("base") || "USD";
    const target = searchParams.get("target") || "IDR";

    const priceFeed = await prisma.priceFeed.findUnique({
      where: {
        base_target: {
          base: base,
          target: target,
        },
      },
    });

    if (!priceFeed) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Price feed not found. Please trigger a POST request to fetch the latest rates.",
        },
        { status: 404 },
      );
    }

    const usdToIdr = priceFeed.rate;
    const idrToUsd = 1 / priceFeed.rate;

    return NextResponse.json({
      success: true,
      data: {
        id: priceFeed.id,
        base: priceFeed.base,
        target: priceFeed.target,
        rate: priceFeed.rate,
        date: priceFeed.date,
        amount: priceFeed.amount,
        usdToIdr: usdToIdr,
        idrToUsd: idrToUsd,
        updatedAt: priceFeed.updatedAt,
        createdAt: priceFeed.createdAt,
      },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch price feed",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const base = body.base || "USD";
    const target = body.target || "IDR";

    const frankfurterUrl = `https://api.frankfurter.app/latest?from=${base}&to=${target}`;
    const response = await fetch(frankfurterUrl);

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch rates from Frankfurter API",
        },
        { status: 500 },
      );
    }

    const data = await response.json();

    const rate = data.rates[target];

    if (!rate) {
      return NextResponse.json(
        {
          success: false,
          error: `Rate for ${target} not found in API response`,
        },
        { status: 500 },
      );
    }

    const priceFeed = await prisma.priceFeed.upsert({
      where: {
        base_target: {
          base: base,
          target: target,
        },
      },
      update: {
        rate: rate,
        date: data.date,
        amount: data.amount,
        updatedAt: new Date(),
      },
      create: {
        base: base,
        target: target,
        rate: rate,
        date: data.date,
        amount: data.amount,
      },
    });

    const usdToIdr = priceFeed.rate;
    const idrToUsd = 1 / priceFeed.rate;

    return NextResponse.json({
      success: true,
      message: "Price feed updated successfully",
      data: {
        id: priceFeed.id,
        base: priceFeed.base,
        target: priceFeed.target,
        rate: priceFeed.rate,
        date: priceFeed.date,
        amount: priceFeed.amount,
        usdToIdr: usdToIdr,
        idrToUsd: idrToUsd,
        updatedAt: priceFeed.updatedAt,
        createdAt: priceFeed.createdAt,
      },
      source: {
        api: "Frankfurter",
        url: frankfurterUrl,
        rawData: data,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update price feed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
