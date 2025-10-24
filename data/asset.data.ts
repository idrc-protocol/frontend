import { contractAddresses } from "@/lib/constants";

export const assetData = [
  {
    symbol: "IDRC",
    ticker: "IDRC",
    contractAddress: contractAddresses.IDRCProxy,
    assetName: "Indonesian Rupiah Coin",
    iconSrc: "/idrc-token.png",
    tags: [
      {
        categoryLayer: "1",
        categorySlug: "asset-class",
        categoryLabel: "Asset Class",
        tagSlug: "stablecoin",
        tagLabel: "Stablecoin",
      },
      {
        categoryLayer: "2",
        categorySlug: "instrument-type",
        categoryLabel: "Instrument Type",
        tagSlug: "fiat-backed",
        tagLabel: "Fiat-Backed",
      },
      {
        categoryLayer: "3",
        categorySlug: "currency-pegged",
        categoryLabel: "Currency Peg",
        tagSlug: "idr",
        tagLabel: "Indonesian Rupiah (IDR)",
      },
      {
        categoryLayer: "4",
        categorySlug: "region-market-exposure",
        categoryLabel: "Region / Market Exposure",
        tagSlug: "indonesia",
        tagLabel: "Indonesia",
      },
    ],
    createdAt: 1760918400000,
    primaryMarket: {
      symbol: "IDRC",
      price: "1",
      priceChange24h: "0",
      priceChangePct24h: "0",
      totalHolders: 10,
      sharesMultiplier: "1",
    },
    chart: {
      timeframe: "1D",
      compareSymbol: "IDRX",
      compareCurrency: "USD",
    },
    timestamp: 1760918400000,
  },
];

export type AssetData = (typeof assetData)[0];

export const defaultAssetData = {
  symbol: "IDRC",
  ticker: "IDRC",
  contractAddress: contractAddresses.IDRCProxy,
  assetName: "Indonesian Rupiah Coin",
  iconSrc: "/idrc-token.png",
  tags: [
    {
      categoryLayer: "1",
      categorySlug: "asset-class",
      categoryLabel: "Asset Class",
      tagSlug: "stablecoin",
      tagLabel: "Stablecoin",
    },
    {
      categoryLayer: "2",
      categorySlug: "instrument-type",
      categoryLabel: "Instrument Type",
      tagSlug: "fiat-backed",
      tagLabel: "Fiat-Backed",
    },
    {
      categoryLayer: "3",
      categorySlug: "currency-pegged",
      categoryLabel: "Currency Peg",
      tagSlug: "idr",
      tagLabel: "Indonesian Rupiah (IDR)",
    },
    {
      categoryLayer: "4",
      categorySlug: "region-market-exposure",
      categoryLabel: "Region / Market Exposure",
      tagSlug: "indonesia",
      tagLabel: "Indonesia",
    },
  ],
  createdAt: 1760918400000,
  primaryMarket: {
    symbol: "IDRC",
    price: "1",
    priceChange24h: "0",
    priceChangePct24h: "0",
    totalHolders: 10,
    sharesMultiplier: "1",
  },
  chart: {
    timeframe: "1D",
    compareSymbol: "IDRX",
    compareCurrency: "USD",
  },
  timestamp: 1760918400000,
};
