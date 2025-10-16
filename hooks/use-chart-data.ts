import { useQuery } from "@tanstack/react-query";

interface ChartDataPoint {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface ChartDataResponse {
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

const fetchChartData = async (symbol: string, timeframe: string) => {
  const response = await fetch(
    `/api/chart-data?symbol=${encodeURIComponent(symbol)}&timeframe=${timeframe}`,
  );
  const result: ChartDataResponse = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to fetch chart data");
  }

  return result.data;
};

export function useChartData(symbol: string, timeframe: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["chartData", symbol, timeframe],
    queryFn: () => fetchChartData(symbol, timeframe),
    enabled: !!symbol,
  });

  return {
    data: data?.chartData ?? [],
    currentPrice: data?.currentPrice ?? 0,
    priceChange24h: data?.priceChange24h ?? 0,
    loading: isLoading,
    error: error instanceof Error ? error.message : null,
  };
}
