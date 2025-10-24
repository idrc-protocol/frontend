import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const SCRIPT_API_KEY = process.env.SCRIPT_API_KEY || "your-secret-key-here";

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get("x-api-key");

    if (!apiKey || apiKey !== SCRIPT_API_KEY) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid API key" },
        { status: 401 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const symbol = body.symbol || "IDRX/USD";
    const updateChart = body.updateChart !== false;
    const updatePriceFeed = body.updatePriceFeed !== false;

    const results: any = {};

    if (updateChart) {
      const [baseToken, quoteToken] = symbol.split("/");
      const timeframes = ["1D", "1W", "1M", "3M", "1Y", "ALL"];

      const chartResults = [];

      for (const tf of timeframes) {
        const chartDataPoints = await fetchCoinGeckoData(
          baseToken,
          quoteToken,
          tf,
        );

        if (!chartDataPoints) continue;

        await prisma.chartData.deleteMany({
          where: { symbol, timeframe: tf },
        });

        const uniqueDataPoints = chartDataPoints.reduce(
          (acc: any[], point: any) => {
            const exists = acc.find((p) => p.timestamp === point.timestamp);

            if (!exists) acc.push(point);

            return acc;
          },
          [],
        );

        const createdData = await prisma.chartData.createMany({
          data: uniqueDataPoints.map((point: any) => ({
            symbol,
            timeframe: tf,
            timestamp: BigInt(point.timestamp),
            open: point.open,
            high: point.high,
            low: point.low,
            close: point.close,
          })),
          skipDuplicates: true,
        });

        chartResults.push({
          timeframe: tf,
          pointsCreated: createdData.count,
        });
      }

      results.chartData = {
        symbol,
        timeframes: chartResults,
        totalPoints: chartResults.reduce((sum, r) => sum + r.pointsCreated, 0),
      };
    }

    if (updatePriceFeed) {
      const latestChart = await prisma.chartData.findFirst({
        where: { symbol, timeframe: "1D" },
        orderBy: { timestamp: "desc" },
      });

      if (latestChart) {
        const rate = 1 / latestChart.close;
        const currentDate = new Date().toISOString().split("T")[0];

        const priceFeed = await prisma.priceFeed.upsert({
          where: {
            base_target: {
              base: "USD",
              target: "IDR",
            },
          },
          update: {
            rate,
            date: currentDate,
            amount: 1,
            updatedAt: new Date(),
          },
          create: {
            base: "USD",
            target: "IDR",
            rate,
            date: currentDate,
            amount: 1,
          },
        });

        results.priceFeed = {
          base: priceFeed.base,
          target: priceFeed.target,
          rate: priceFeed.rate,
          usdToIdr: priceFeed.rate,
          idrToUsd: latestChart.close,
        };
      }
    }

    return NextResponse.json({
      success: true,
      message: "Price data updated successfully",
      data: results,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update prices",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

async function fetchCoinGeckoData(
  baseToken: string,
  quoteToken: string,
  timeframe: string,
): Promise<Array<{
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
}> | null> {
  try {
    const coinGeckoIds: Record<string, string> = {
      IDRX: "idrx",
      BTC: "bitcoin",
      ETH: "ethereum",
    };

    const coinId = coinGeckoIds[baseToken.toUpperCase()];

    if (!coinId) return null;

    const periodMap: Record<string, string> = {
      "1D": "24_hours",
      "1W": "7_days",
      "1M": "30_days",
      "3M": "90_days",
      "1Y": "1_year",
      ALL: "max",
    };

    const period = periodMap[timeframe] || "24_hours";
    const currency = quoteToken.toLowerCase();
    const url = `https://www.coingecko.com/price_charts/${coinId}/${currency}/${period}.json`;

    const response = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) return null;

    const data = await response.json();

    if (!data.stats || !Array.isArray(data.stats)) return null;

    return data.stats.map((point: [number, number]) => {
      const [timestamp, price] = point;

      return {
        timestamp,
        open: price,
        high: price * 1.001,
        low: price * 0.999,
        close: price,
      };
    });
  } catch {
    return null;
  }
}
