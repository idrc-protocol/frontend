import { UTCTimestamp } from "lightweight-charts";

import { AssetData } from "@/data/asset.data";

export interface StockChartProps {
  assetData?: AssetData;
  className?: string;
}

export interface ChartDataPoint {
  time: UTCTimestamp;
  value: number;
}

export interface PriceChangeData {
  change: number;
  changePercent: number;
  isPositive: boolean;
}

export interface HistoryDataPoint {
  timestamp: number;
  value: number;
  open: number;
  high: number;
  low: number;
  close: number;
}
