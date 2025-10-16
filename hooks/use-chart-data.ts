import { useEffect, useState } from "react";

interface ChartDataPoint {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface ChartDataResponse {
  success: boolean;
  data?: {
    symbol: string;
    timeframe: string;
    chartData: ChartDataPoint[];
    currentPrice: number;
    priceChange24h: number;
    message?: string;
  };
  error?: string;
}

export function useChartData(symbol: string, timeframe: string) {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [priceChange24h, setPriceChange24h] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol) return;

    const fetchChartData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/chart-data?symbol=${encodeURIComponent(symbol)}&timeframe=${timeframe}`,
        );
        const result: ChartDataResponse = await response.json();

        if (result.success && result.data) {
          setData(result.data.chartData);
          setCurrentPrice(result.data.currentPrice);
          setPriceChange24h(result.data.priceChange24h);
        } else {
          setError(result.error || "Failed to fetch chart data");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [symbol, timeframe]);

  return { data, currentPrice, priceChange24h, loading, error };
}
