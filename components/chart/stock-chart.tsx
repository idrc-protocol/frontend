"use client";

import type { IChartApi, UTCTimestamp } from "lightweight-charts";

import { AreaSeries } from "lightweight-charts";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

import { defaultAssetData } from "@/data/asset.data";
import {
  AssetData,
  ChartDataPoint,
  HistoryDataPoint,
  PriceChangeData,
  StockChartProps,
} from "@/types/components/chart.type";

const TIMEFRAMES = ["1D", "1W", "1M", "3M", "1Y", "ALL"] as const;

type TimeframeType = (typeof TIMEFRAMES)[number];

const deterministicRandom = (seed: string): number => {
  let hash = 0;

  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);

    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  return Math.abs(hash) / 2147483648;
};

const CHART_COLORS = {
  positive: {
    top: "rgba(16,185,129,0.4)",
    bottom: "rgba(16,185,129,0.05)",
    line: "#10b981",
    tooltipBg: "#205720",
  },
  negative: {
    top: "rgba(239,68,68,0.4)",
    bottom: "rgba(239,68,68,0.05)",
    line: "#ef4444",
    tooltipBg: "#572025",
  },
} as const;

const convertTimestamp = (timestamp: number): UTCTimestamp =>
  Math.floor(timestamp / 1000) as UTCTimestamp;

const getUserTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

const getTimezoneAbbreviation = (date: Date, timezone: string): string => {
  try {
    const formatter = new Intl.DateTimeFormat("en", {
      timeZoneName: "short",
      timeZone: timezone,
    });

    return (
      formatter.formatToParts(date).find((part) => part.type === "timeZoneName")
        ?.value || ""
    );
  } catch {
    return "UTC";
  }
};

const formatDateInTimezone = (
  date: Date,
  options: Intl.DateTimeFormatOptions,
  timezone: string,
  locale: string = "en-GB",
): string => {
  try {
    return date.toLocaleDateString(locale, {
      ...options,
      timeZone: timezone,
    });
  } catch {
    return date.toLocaleDateString(locale, options);
  }
};

const formatTimeInTimezone = (
  date: Date,
  options: Intl.DateTimeFormatOptions,
  timezone: string,
  locale?: string,
): string => {
  try {
    return date.toLocaleTimeString(locale, {
      ...options,
      timeZone: timezone,
    });
  } catch {
    return date.toLocaleTimeString(locale, options);
  }
};

const generateStraightUpwardData = (
  timeframe: TimeframeType,
  currentPrice: number = 100,
  endTime: Date = new Date(),
  seed: string = "default",
): HistoryDataPoint[] => {
  const dataPointsConfig = {
    "1D": { points: 24, intervalMs: 60 * 60 * 1000 },
    "1W": { points: 168, intervalMs: 60 * 60 * 1000 },
    "1M": { points: 30, intervalMs: 24 * 60 * 60 * 1000 },
    "3M": { points: 90, intervalMs: 24 * 60 * 60 * 1000 },
    "1Y": { points: 365, intervalMs: 24 * 60 * 60 * 1000 },
    ALL: { points: 500, intervalMs: 24 * 60 * 60 * 1000 },
  };

  const config = dataPointsConfig[timeframe];
  const { points, intervalMs } = config;
  const now = endTime.getTime();

  const dropPercentage = 0.3 + deterministicRandom(seed + timeframe) * 0.2;
  const startPrice = currentPrice * (1 - dropPercentage);
  const totalGrowth = currentPrice - startPrice;

  const data: HistoryDataPoint[] = [];

  for (let i = 0; i < points; i++) {
    const timestamp = now - (points - 1 - i) * intervalMs;
    const progress = i / (points - 1);

    const price = startPrice + totalGrowth * progress;

    const finalPrice = i === points - 1 ? currentPrice : price;

    const open = i === 0 ? startPrice : data[i - 1]?.close || finalPrice;
    const close = finalPrice;
    const high = Math.max(open, close) * 1.001;
    const low = Math.min(open, close) * 0.999;

    data.push({
      timestamp,
      value: Math.max(0.01, close),
      open: Math.max(0.01, open),
      high: Math.max(0.01, high),
      low: Math.max(0.01, low),
      close: Math.max(0.01, close),
    });
  }

  return data.sort((a, b) => a.timestamp - b.timestamp);
};

const convertHistoryDataToChartData = (
  historyData: HistoryDataPoint[],
): ChartDataPoint[] => {
  if (historyData.length === 0) return [];

  return historyData.map((item) => ({
    time: convertTimestamp(item.timestamp),
    value: item.value,
  }));
};

const calculatePriceChangeFromData = (
  data: ChartDataPoint[],
): PriceChangeData => {
  if (!data || data.length < 2) {
    return { change: 0, changePercent: 0, isPositive: true };
  }

  const firstPrice = data[0].value;
  const lastPrice = data[data.length - 1].value;
  const change = lastPrice - firstPrice;
  const changePercent = firstPrice !== 0 ? (change / firstPrice) * 100 : 0;

  return {
    change,
    changePercent,
    isPositive: change >= 0,
  };
};

const getPeriodLabel = (timeframe: TimeframeType): string => {
  const labels = {
    "1D": "1D",
    "1W": "1W",
    "1M": "1M",
    "3M": "3M",
    "1Y": "1Y",
    ALL: "All Time",
  } as const;

  return labels[timeframe];
};

const getSeriesOptions = (isPositive: boolean, customColors?: ChartColors) => {
  const defaultColors = isPositive
    ? CHART_COLORS.positive
    : CHART_COLORS.negative;

  const colors = customColors ?? defaultColors;

  return {
    topColor: colors.top,
    bottomColor: colors.bottom,
    lineColor: colors.line,
    lineWidth: 2,
  } as const;
};

const useChartData = (
  activeTimeframe: TimeframeType,
  assetData: AssetData,
  baseFallbackPrice: number,
  useGeneratedData: boolean = true,
  isClient: boolean = false,
): ChartDataPoint[] => {
  return useMemo(() => {
    const currentPrice =
      parseFloat(assetData.primaryMarket.price) || baseFallbackPrice;

    if (useGeneratedData && currentPrice > 0) {
      const seed = `${assetData.symbol || "DEFAULT"}_${activeTimeframe}`;

      const baseTime = isClient ? new Date() : new Date("2024-01-01T00:00:00Z");

      const historyData = generateStraightUpwardData(
        activeTimeframe,
        currentPrice,
        baseTime,
        seed,
      );

      return convertHistoryDataToChartData(historyData);
    }

    const fallbackTime = isClient
      ? Date.now()
      : new Date("2024-01-01T00:00:00Z").getTime();

    return [
      {
        time: convertTimestamp(fallbackTime),
        value: currentPrice,
      },
    ];
  }, [
    activeTimeframe,
    assetData.primaryMarket.price,
    assetData.symbol,
    baseFallbackPrice,
    useGeneratedData,
    isClient,
  ]);
};

const usePriceData = (chartData: ChartDataPoint[], assetData: AssetData) => {
  const currentPrice = useMemo(() => {
    if (chartData?.length > 0) {
      return chartData[chartData.length - 1].value;
    }

    return parseFloat(assetData.primaryMarket.price);
  }, [chartData, assetData.primaryMarket.price]);

  const priceChangeData = useMemo(() => {
    if (chartData?.length > 0) {
      return calculatePriceChangeFromData(chartData);
    }

    const fallbackChange = parseFloat(
      assetData.primaryMarket.priceChange24h || "0",
    );
    const fallbackChangePercent = parseFloat(
      assetData.primaryMarket.priceChangePct24h || "0",
    );

    return {
      change: fallbackChange,
      changePercent: fallbackChangePercent,
      isPositive: fallbackChange >= 0,
    };
  }, [
    chartData,
    assetData.primaryMarket.priceChange24h,
    assetData.primaryMarket.priceChangePct24h,
  ]);

  return { currentPrice, priceChangeData };
};

type ChartColors = {
  top: string;
  bottom: string;
  line: string;
  tooltipBg?: string;
  tooltipText?: string;
};

export const StockChart: React.FC<
  StockChartProps & {
    allowedTimeframes?: TimeframeType[];
    customFilter?: (point: ChartDataPoint) => boolean;
    showCurrentPrice?: boolean;
    styleChart?: React.CSSProperties;
    customColors?: ChartColors;
    useGeneratedData?: boolean;
    targetPrice?: number;
  }
> = ({
  assetData = defaultAssetData,
  className = "",
  allowedTimeframes = TIMEFRAMES,
  customFilter,
  showCurrentPrice = true,
  styleChart,
  customColors,
  useGeneratedData = true,
  targetPrice,
}) => {
  const [activeTimeframe, setActiveTimeframe] = useState<TimeframeType>(
    allowedTimeframes[0] ?? "1D",
  );
  const [, setIsLoading] = useState(true);
  const [chart, setChart] = useState<IChartApi | null>(null);
  const [isClient, setIsClient] = useState(false);

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const seriesRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const chartInstanceRef = useRef<IChartApi | null>(null);
  const isDisposedRef = useRef(false);

  const safeChartOperation = useCallback(
    (operation: (chart: IChartApi) => void) => {
      try {
        const chartInstance = chartInstanceRef.current;

        if (chartInstance && !isDisposedRef.current) {
          operation(chartInstance);
        }
      } catch (error) {
        throw error;
      }
    },
    [],
  );

  const baseFallbackPrice =
    targetPrice || parseFloat(assetData.primaryMarket.price);

  useEffect(() => {
    setIsClient(true);
  }, []);

  let chartData = useChartData(
    activeTimeframe,
    assetData,
    baseFallbackPrice,
    useGeneratedData,
    isClient,
  );

  if (customFilter) {
    chartData = chartData.filter(customFilter);
  }

  const { currentPrice, priceChangeData } = usePriceData(chartData, assetData);
  const {
    change: priceChange,
    changePercent: percentageChange,
    isPositive,
  } = priceChangeData;

  useEffect(() => {
    let chartInstance: IChartApi | null = null;
    let resizeHandler: (() => void) | null = null;

    isDisposedRef.current = false;

    const loadChart = async () => {
      try {
        const { createChart } = await import("lightweight-charts");

        if (!chartContainerRef.current) return;

        const containerWidth = chartContainerRef.current.clientWidth;
        const containerHeight = chartContainerRef.current.clientHeight;

        chartInstance = createChart(chartContainerRef.current, {
          width: containerWidth,
          height: containerHeight,
          layout: {
            background: { color: "transparent" },
            textColor: "#666",
          },
          grid: {
            vertLines: { visible: true },
            horzLines: { visible: true },
          },
          crosshair: {
            mode: 1,
            vertLine: { width: 1, color: "#666", style: 2 },
            horzLine: { width: 1, color: "#666", style: 2 },
          },
          rightPriceScale: {
            borderVisible: false,
            scaleMargins: { top: 0.1, bottom: 0.1 },
            autoScale: true,
          },
          timeScale: {
            borderVisible: false,
            fixLeftEdge: true,
            fixRightEdge: true,
            timeVisible: true,
            secondsVisible: false,
            tickMarkFormatter: (time: UTCTimestamp) => {
              const date = new Date((time as UTCTimestamp) * 1000);
              const userTimezone = getUserTimezone();

              const formattedDate = formatDateInTimezone(
                date,
                {
                  day: "2-digit",
                  month: "2-digit",
                },
                userTimezone,
              );

              return formattedDate;
            },
          },
        });

        const areaSeries = chartInstance.addSeries(
          AreaSeries,
          getSeriesOptions(isPositive),
        );

        const tooltip = document.createElement("div");

        tooltip.className = `absolute text-white shadow-md px-2 py-1 text-xs rounded pointer-events-none hidden z-50`;
        tooltip.style.background =
          customColors?.tooltipBg ??
          (isPositive
            ? CHART_COLORS.positive.tooltipBg
            : CHART_COLORS.negative.tooltipBg);

        tooltip.style.color = customColors?.tooltipText ?? "#fff";

        tooltip.style.whiteSpace = "nowrap";
        chartContainerRef.current.appendChild(tooltip);

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
            const date = new Date((param.time as UTCTimestamp) * 1000);
            const width = window.innerWidth;

            let dateStr: string;
            let timeStr: string;

            const userTimezone = getUserTimezone();
            const timezoneAbbr = getTimezoneAbbreviation(date, userTimezone);

            if (width < 640) {
              dateStr = formatDateInTimezone(
                date,
                {
                  month: "short",
                  day: "numeric",
                },
                userTimezone,
              );
              timeStr = formatTimeInTimezone(
                date,
                {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                },
                userTimezone,
              );
            } else {
              dateStr = formatDateInTimezone(
                date,
                {
                  year: "numeric",
                  month: "short",
                  day: "2-digit",
                },
                userTimezone,
              ).replace(",", "");
              timeStr = `${formatTimeInTimezone(
                date,
                {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                },
                userTimezone,
              )} ${timezoneAbbr}`;
            }

            tooltip.innerHTML = `
              <div class="flex flex-col gap-1 px-2 py-1 ${width < 640 ? "text-xs" : ""}">
                <span class="font-medium text-center ${width < 640 ? "text-sm" : "text-base"}">$${price.toFixed(2)}</span>
                <div class="flex flex-col ${width < 640 ? "text-xs" : "text-sm"} text-center text-gray-200">
                  <span>${dateStr}</span>
                  <span>${timeStr}</span>
                </div>
              </div>
            `;

            const chartWidth = chartContainerRef.current!.clientWidth;
            const chartHeight = chartContainerRef.current!.clientHeight;
            const tooltipWidth = width < 640 ? 120 : 150;
            const tooltipHeight = width < 640 ? 50 : 60;
            let left = param.point.x + 15;
            let top = param.point.y + 15;

            if (left + tooltipWidth > chartWidth) {
              left = param.point.x - tooltipWidth - 15;
            }
            if (top + tooltipHeight > chartHeight) {
              top = param.point.y - tooltipHeight - 15;
            }

            tooltip.style.left = left + "px";
            tooltip.style.top = top + "px";
            tooltip.style.display = "block";
            tooltip.style.opacity = "1";
            tooltip.style.transition = "opacity 0.15s ease-in-out";
          } else {
            tooltip.style.opacity = "0";
            setTimeout(() => (tooltip.style.display = "none"), 150);
          }
        });

        seriesRef.current = areaSeries;
        chartInstanceRef.current = chartInstance;
        areaSeries.setData(chartData);
        chartInstance.timeScale().fitContent();
        setChart(chartInstance);
        setIsLoading(false);

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

        resizeHandler = () => {
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
        };

        window.addEventListener("resize", resizeHandler);
      } catch (error) {
        toast.warning(
          `"TradingView Lightweight Charts not available:" ${error}`,
        );
        setIsLoading(false);
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

      if (resizeHandler) {
        try {
          window.removeEventListener("resize", resizeHandler);
        } catch (error) {
          throw error;
        }
      }

      if (chartInstance) {
        try {
          chartInstance.remove();
        } catch (error) {
          throw error;
        }
      }

      chartInstanceRef.current = null;
      seriesRef.current = null;
      setChart(null);
    };
  }, [isPositive]);

  useEffect(() => {
    if (!seriesRef.current || !chartData || isDisposedRef.current) return;

    try {
      seriesRef.current.setData(chartData);
      seriesRef.current.applyOptions(
        getSeriesOptions(isPositive, customColors),
      );

      safeChartOperation((chartInstance) => {
        chartInstance.timeScale().fitContent();
      });
    } catch (error) {
      throw error;
    }
  }, [chartData, isPositive, chart, customColors, safeChartOperation]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const forceChartResize = () => {
      if (chartContainerRef.current && !isDisposedRef.current) {
        const container = chartContainerRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;

        if (width > 0 && height > 0) {
          setTimeout(() => {
            safeChartOperation((chartInstance) => {
              chartInstance.resize(width, height);
              chartInstance.timeScale().fitContent();
            });
          }, 100);
        }
      }
    };

    if (chart && !isDisposedRef.current) {
      forceChartResize();
    }
  }, [chart, safeChartOperation]);

  return (
    <div
      className={`flex flex-col gap-3 sm:gap-5 rounded-[20px] sm:rounded-[40px] ${className}`}
    >
      <div className="flex flex-col gap-3 sm:gap-4 justify-between lg:flex-row lg:items-start">
        {showCurrentPrice && (
          <div className="flex flex-col gap-2 flex-shrink-0 order-1 lg:order-1">
            <h3 className="m-0 text-xl sm:text-2xl lg:text-4xl font-medium text-black leading-tight">
              ${currentPrice.toFixed(2)}
            </h3>

            <div
              className={`flex items-center gap-1 ${isPositive ? "text-green-700" : "text-red-600"}`}
            >
              {priceChange && percentageChange && activeTimeframe && (
                <div
                  className="m-0 text-xs sm:text-sm font-mono"
                  suppressHydrationWarning={true}
                >
                  ${priceChange ? Math.abs(priceChange).toFixed(2) : 0} (
                  {percentageChange ? Math.abs(percentageChange).toFixed(2) : 0}
                  %){" "}
                  <span className="hidden xs:inline">
                    {activeTimeframe && getPeriodLabel(activeTimeframe)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-center lg:justify-end w-full lg:w-auto order-2 lg:order-2">
          <div className="flex flex-wrap sm:flex-nowrap gap-1 bg-black/5 rounded-lg p-0.5 w-full sm:w-auto max-w-md sm:max-w-none">
            {allowedTimeframes.length > 1 &&
              allowedTimeframes.map((timeframe) => (
                <button
                  key={timeframe}
                  className={`cursor-pointer rounded-lg px-2 sm:px-3 h-6 sm:h-7 flex items-center justify-center text-xs sm:text-sm font-medium transition-colors flex-1 sm:flex-initial min-w-0 ${
                    activeTimeframe === timeframe
                      ? "bg-white text-black shadow-sm"
                      : "text-gray-600 hover:bg-black/5"
                  }`}
                  type="button"
                  onClick={() => setActiveTimeframe(timeframe)}
                >
                  {timeframe}
                </button>
              ))}
          </div>
        </div>
      </div>

      <div className="relative flex-1 min-h-[300px] sm:min-h-[400px] w-full max-w-full">
        <div
          ref={chartContainerRef}
          className="w-full h-full rounded-lg overflow-hidden bg-transparent"
          style={{
            minHeight: "300px",
            maxWidth: "100%",
            ...styleChart,
          }}
        />
      </div>
    </div>
  );
};
