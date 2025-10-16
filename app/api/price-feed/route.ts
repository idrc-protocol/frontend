import { NextResponse } from "next/server";
import BigNumber from "bignumber.js";

import { prisma } from "@/lib/prisma";

BigNumber.config({ DECIMAL_PLACES: 50, ROUNDING_MODE: BigNumber.ROUND_DOWN });

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
    const symbol = body.symbol || "IDRX/USD";

    const url = new URL(request.url);
    const chartDataUrl = `${url.origin}/api/chart-data?symbol=${encodeURIComponent(symbol)}&timeframe=1D`;

    const chartResponse = await fetch(chartDataUrl);

    if (!chartResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `No chart data found for ${symbol}. Please run POST /api/chart-data first.`,
        },
        { status: 404 },
      );
    }

    const chartData = await chartResponse.json();

    if (!chartData.success || !chartData.data) {
      return NextResponse.json(
        {
          success: false,
          error: chartData.error || "Failed to get chart data",
        },
        { status: 500 },
      );
    }

    const latestPriceBN = new BigNumber(chartData.data.currentPrice);
    const latestPrice = latestPriceBN.toNumber();

    const rateBN = new BigNumber(1).dividedBy(latestPriceBN);
    const rate = rateBN.toNumber();
    const currentDate = new Date().toISOString().split("T")[0];

    const priceFeed = await prisma.priceFeed.upsert({
      where: {
        base_target: {
          base: base,
          target: target,
        },
      },
      update: {
        rate: rate,
        date: currentDate,
        amount: 1,
        updatedAt: new Date(),
      },
      create: {
        base: base,
        target: target,
        rate: rate,
        date: currentDate,
        amount: 1,
      },
    });

    const usdToIdr = priceFeed.rate;
    const idrToUsd = latestPrice;

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
        api: "Chart Data API",
        symbol: symbol,
        currentPrice: latestPrice,
        priceChange24h: chartData.data.priceChange24h,
        priceChangePct24h: chartData.data.priceChangePct24h,
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
