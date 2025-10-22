import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol");
    const timeframe = searchParams.get("timeframe") || "1D";

    if (!symbol) {
      return NextResponse.json(
        {
          success: false,
          error: "Symbol parameter is required",
        },
        { status: 400 },
      );
    }

    const chartData = await prisma.chartData.findMany({
      where: {
        symbol,
        timeframe,
      },
      orderBy: {
        timestamp: "asc",
      },
    });

    if (chartData.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          symbol,
          timeframe,
          chartData: [],
          currentPrice: 0,
          priceChange24h: 0,
          priceChangePct24h: "0.00",
        },
        message: "No historical data available for this timeframe",
      });
    }

    const formattedData = chartData.map((item) => ({
      timestamp: Number(item.timestamp),
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
    }));

    const currentPrice = formattedData[formattedData.length - 1]?.close || 0;
    const firstPrice = formattedData[0]?.open || currentPrice;
    const priceChange24h = currentPrice - firstPrice;
    const priceChangePct24h =
      firstPrice !== 0 ? (priceChange24h / firstPrice) * 100 : 0;

    return NextResponse.json({
      success: true,
      data: {
        symbol,
        timeframe,
        chartData: formattedData,
        currentPrice,
        priceChange24h: priceChangePct24h,
        priceChangePct24h: priceChangePct24h.toFixed(2),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch chart data",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session || !session.user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden: Admin access required",
        },
        { status: 403 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const symbol = body.symbol || "IDRX/IDR";
    const timeframe = body.timeframe;
    const customData = body.data;

    const [baseToken, quoteToken] = symbol.split("/");

    if (!baseToken || !quoteToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid symbol format. Use BASE/QUOTE (e.g., IDRX/IDR)",
        },
        { status: 400 },
      );
    }

    const timeframes = timeframe
      ? [timeframe]
      : ["1D", "1W", "1M", "3M", "1Y", "ALL"];

    const results = [];

    for (const tf of timeframes) {
      let chartDataPoints;

      if (customData && Array.isArray(customData)) {
        chartDataPoints = customData;
      } else {
        chartDataPoints = await fetchCoinGeckoData(baseToken, quoteToken, tf);
      }

      if (!chartDataPoints) {
        NextResponse.json(
          {
            success: false,
            error: `Failed to fetch data for ${symbol} on timeframe ${tf}`,
          },
          { status: 500 },
        );
        continue;
      }

      await prisma.chartData.deleteMany({
        where: {
          symbol,
          timeframe: tf,
        },
      });

      const uniqueDataPoints = chartDataPoints.reduce(
        (acc: any[], point: any) => {
          const exists = acc.find((p) => p.timestamp === point.timestamp);

          if (!exists) {
            acc.push(point);
          }

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

      results.push({
        timeframe: tf,
        pointsCreated: createdData.count,
      });
    }

    return NextResponse.json({
      success: true,
      message: timeframe
        ? "Chart data updated successfully"
        : "Chart data updated for all timeframes",
      data: {
        symbol,
        timeframes: results,
        totalPoints: results.reduce((sum, r) => sum + r.pointsCreated, 0),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update chart data",
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
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) return null;

    const data = await response.json();

    if (!data.stats || !Array.isArray(data.stats)) return null;

    const chartData = data.stats.map((point: [number, number]) => {
      const [timestamp, price] = point;

      return {
        timestamp,
        open: price,
        high: price * 1.001,
        low: price * 0.999,
        close: price,
      };
    });

    return chartData;
  } catch {
    return null;
  }
}
