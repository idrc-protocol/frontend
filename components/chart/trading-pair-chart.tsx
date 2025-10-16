"use client";

import type { IChartApi, ISeriesApi } from "lightweight-charts";

import { AreaSeries } from "lightweight-charts";
import React, { useEffect, useRef, useState } from "react";

import { useChartData } from "@/hooks/use-chart-data";

interface TradingPairChartProps {
  symbol: string;
  className?: string;
}

const TIMEFRAMES = ["1D", "1W", "1M", "3M", "1Y", "ALL"] as const;

type Timeframe = (typeof TIMEFRAMES)[number];

export function TradingPairChart({ symbol, className }: TradingPairChartProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>("1D");
  const { data, currentPrice, priceChange24h, loading, error } = useChartData(
    symbol,
    timeframe,
  );

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);
  const isDisposedRef = useRef(false);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const safeChartOperation = (operation: (chart: IChartApi) => void) => {
    try {
      const chartInstance = chartRef.current;

      if (chartInstance && !isDisposedRef.current) {
        operation(chartInstance);
      }
    } catch (error) {
      throw error;
    }
  };

  const [base, quote] = symbol.split("/");
  const priceChangePercent =
    currentPrice !== 0 ? (priceChange24h / currentPrice) * 100 : 0;
  const isPositive = priceChange24h >= 0;

  useEffect(() => {
    let chartInstance: IChartApi | null = null;
    let windowResizeHandler: (() => void) | null = null;

    isDisposedRef.current = false;

    const loadChart = async () => {
      try {
        const { createChart } = await import("lightweight-charts");

        if (!chartContainerRef.current) return;

        const containerWidth = chartContainerRef.current.clientWidth || 800;
        const containerHeight = chartContainerRef.current.clientHeight || 400;

        chartInstance = createChart(chartContainerRef.current, {
          width: containerWidth,
          height: containerHeight,
          layout: {
            background: { color: "transparent" },
            textColor: "#666",
          },
          grid: {
            vertLines: { visible: false },
            horzLines: {
              visible: true,
              color: "rgba(197, 203, 206, 0.2)",
              style: 0,
            },
          },
          crosshair: {
            mode: 1,
            vertLine: { width: 1, color: "#666", style: 2 },
            horzLine: { width: 1, color: "#666", style: 2 },
          },
          rightPriceScale: {
            visible: true,
            borderVisible: false,
            scaleMargins: { top: 0.1, bottom: 0.1 },
            autoScale: true,
            minimumWidth: 60,
            textColor: "#666",
          },
          timeScale: {
            borderVisible: false,
            timeVisible: true,
            secondsVisible: false,
            rightOffset: 12,
            barSpacing: 6,
            minBarSpacing: 0.5,
            fixLeftEdge: false,
            fixRightEdge: true,
            lockVisibleTimeRangeOnResize: true,
            tickMarkFormatter: (time: any) => {
              const date = new Date(time * 1000);
              const day = String(date.getDate()).padStart(2, "0");
              const month = String(date.getMonth() + 1).padStart(2, "0");

              return `${day}/${month}`;
            },
          },
        });

        const areaSeries = chartInstance.addSeries(AreaSeries, {
          topColor: isPositive
            ? "rgba(16, 185, 129, 0.2)"
            : "rgba(239, 68, 68, 0.2)",
          bottomColor: isPositive
            ? "rgba(16, 185, 129, 0)"
            : "rgba(239, 68, 68, 0)",
          lineColor: isPositive ? "#10b981" : "#ef4444",
          lineWidth: 2,
          priceFormat: {
            type: "price",
            precision: 8,
            minMove: 0.00000001,
          },
          lastValueVisible: false,
          priceLineVisible: false,
        });

        seriesRef.current = areaSeries;
        chartRef.current = chartInstance;

        if (data.length > 0) {
          const chartData = data.map((item) => ({
            time: Math.floor(item.timestamp / 1000) as any,
            value: item.close,
          }));

          areaSeries.setData(chartData);

          const firstTime = chartData[0].time;
          const lastTime = chartData[chartData.length - 1].time;

          chartInstance.timeScale().setVisibleRange({
            from: firstTime as any,
            to: lastTime as any,
          });

          chartInstance.timeScale().applyOptions({
            rightOffset: 12,
          });

          chartInstance
            .timeScale()
            .subscribeVisibleLogicalRangeChange((range) => {
              if (!range) return;

              const barsInfo = areaSeries.barsInLogicalRange(range);

              if (barsInfo && barsInfo.barsBefore < 0) {
                chartInstance?.timeScale().setVisibleLogicalRange({
                  from: 0,
                  to: range.to,
                });
              }
            });
        }

        if (tooltipRef.current) {
          const tooltip = tooltipRef.current;

          chartInstance.subscribeCrosshairMove((param) => {
            if (
              param.point === undefined ||
              !param.time ||
              param.point.x < 0 ||
              param.point.y < 0
            ) {
              tooltip.style.display = "none";

              return;
            }

            const price = (param.seriesData.get(areaSeries) as any)?.value;

            if (price) {
              const date = new Date((param.time as number) * 1000);
              const formattedPrice =
                price < 0.01 ? `$${price.toFixed(8)}` : `$${price.toFixed(2)}`;
              const formattedDate = date.toLocaleString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              });

              tooltip.innerHTML = `
                <div style="font-weight: 600; margin-bottom: 4px;">${formattedPrice}</div>
                <div style="font-size: 12px; color: #6B7280;">${formattedDate}</div>
              `;

              const chartWidth = chartContainerRef.current!.clientWidth;
              const tooltipWidth = 150;
              let left = param.point.x + 15;

              if (left + tooltipWidth > chartWidth) {
                left = param.point.x - tooltipWidth - 15;
              }

              tooltip.style.left = left + "px";
              tooltip.style.top = param.point.y + "px";
              tooltip.style.display = "block";
              tooltip.style.transform = "translateY(-50%)";
            } else {
              tooltip.style.display = "none";
            }
          });
        }

        if (
          chartContainerRef.current &&
          typeof ResizeObserver !== "undefined"
        ) {
          resizeObserverRef.current = new ResizeObserver((entries) => {
            if (entries[0] && !isDisposedRef.current) {
              const { width, height } = entries[0].contentRect;

              if (width > 0 && height > 0) {
                requestAnimationFrame(() => {
                  safeChartOperation((chart) => {
                    chart.resize(width, height);
                    chart.timeScale().fitContent();
                  });
                });
              }
            }
          });
          resizeObserverRef.current.observe(chartContainerRef.current);
        }

        let resizeTimeout: NodeJS.Timeout;

        windowResizeHandler = () => {
          if (chartContainerRef.current && !isDisposedRef.current) {
            clearTimeout(resizeTimeout);

            resizeTimeout = setTimeout(() => {
              if (chartContainerRef.current && !isDisposedRef.current) {
                const newWidth = chartContainerRef.current.clientWidth;
                const newHeight = chartContainerRef.current.clientHeight;

                if (newWidth > 0 && newHeight > 0) {
                  requestAnimationFrame(() => {
                    safeChartOperation((chart) => {
                      chart.resize(newWidth, newHeight);
                      chart.timeScale().fitContent();
                    });
                  });
                }
              }
            }, 100);
          }
        };
        window.addEventListener("resize", windowResizeHandler);
      } catch (error) {
        throw error;
      }
    };

    loadChart();

    return () => {
      isDisposedRef.current = true;

      if (resizeObserverRef.current) {
        try {
          resizeObserverRef.current.disconnect();
        } catch (error) {
          throw error;
        }
        resizeObserverRef.current = null;
      }

      if (windowResizeHandler) {
        window.removeEventListener("resize", windowResizeHandler);
      }

      if (chartInstance) {
        try {
          chartInstance.remove();
        } catch (error) {
          throw error;
        }
      }

      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [isPositive, data]);

  useEffect(() => {
    if (
      !seriesRef.current ||
      !chartRef.current ||
      isDisposedRef.current ||
      data.length === 0
    )
      return;

    try {
      const chartData = data.map((item) => ({
        time: Math.floor(item.timestamp / 1000) as any,
        value: item.close,
      }));

      seriesRef.current.setData(chartData);

      const firstTime = chartData[0].time;
      const lastTime = chartData[chartData.length - 1].time;

      chartRef.current.timeScale().setVisibleRange({
        from: firstTime as any,
        to: lastTime as any,
      });

      chartRef.current.timeScale().applyOptions({
        rightOffset: 12,
      });
    } catch (error) {
      throw error;
    }
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px] bg-white rounded-lg">
        <div className="text-gray-500">Loading chart data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[500px] bg-white rounded-lg">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-lg w-full max-w-full overflow-hidden ${className || ""}`}
    >
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-2xl font-medium text-gray-900">
            {base}/{quote} Price
          </h2>
        </div>
        <div className="flex items-baseline gap-3">
          <span className="text-3xl text-gray-900">
            {quote === "USD" || quote === "USDT" || quote === "USDC"
              ? `$${currentPrice < 0.01 ? currentPrice.toFixed(8) : currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : `${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })} ${quote}`}
          </span>
          <span
            className={`text-md font-medium ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {isPositive ? "▲" : "▼"} {Math.abs(priceChangePercent).toFixed(2)}%{" "}
            ({timeframe})
          </span>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeframe === tf
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => setTimeframe(tf)}
          >
            {tf}
          </button>
        ))}
      </div>

      <div className="relative w-full max-w-full h-[400px] sm:h-[450px] md:h-[500px] overflow-hidden">
        <div
          ref={chartContainerRef}
          className="w-full max-w-full h-full"
          style={{ maxWidth: "100%" }}
        />
        <div
          ref={tooltipRef}
          className="absolute pointer-events-none bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10"
          style={{ display: "none" }}
        />
      </div>
    </div>
  );
}
