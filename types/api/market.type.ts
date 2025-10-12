export type MarketData = {
  id: number;
  name: string;
  symbol: string;
  tokenAccepted: string;
  maxSupply: string;
  maturity: string;
  marketAddress: string;
  rewardAddress: string;
  tvl: string;
  status: string;
  priceRate: number;
  yieldValue: number;
  prevCouponReturnedSchedule: string;
  couponReturnedSchedule: string | null;
  couponDistribution: string;
  minOrder: number;
  orderMultiples: number;
  publishDate: string;
  creationDate: string;
  publisher: string;
  dueAt: string;
  iconUrl: string;
  memoUrl: string;
  isTradable: boolean;
  isTransactable: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MarketResponse = {
  success: boolean;
  data: MarketData[];
  count: number;
};
