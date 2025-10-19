import { contractAddresses } from "@/lib/constants";
import { getTokensForChain } from "@/lib/tokens";

export const assetsInfo = [
  {
    displayName: "IDRC",
    tokenName: "Indonesian Rupiah Coin",
    underlyingName: "Indonesian Rupiah (IDR)",
    symbol: "IDRC",
    ticker: "IDRC",
    contractAddress: contractAddresses.IDRCProxy,
    description:
      "IDRC is a digital stable token designed to mirror and represent the value of the Indonesian Rupiah (IDR) on-chain. It functions as a stable and reliable medium of exchange, unit of account, and store of value within both centralized and decentralized financial ecosystems. Identified by the symbol and ticker IDRC, the token maintains a 1:1 reflection of the Indonesian Rupiah through transparent, auditable, and secure mechanisms that ensure price stability and trust. Built with interoperability and transparency in mind, IDRC enables seamless integration across exchanges, DeFi protocols, digital wallets, and payment infrastructures. It facilitates efficient settlement for diverse financial use cases, including domestic and cross-border transfers, e-commerce payments, merchant transactions, remittances, and treasury operations. The design of IDRC emphasizes regulatory alignment, technological scalability, and compatibility with emerging Web3 standards, positioning it as a core digital representation of Indonesia’s national currency in the modern financial landscape. By bridging traditional fiat systems and blockchain-based finance, IDRC supports financial inclusion, innovation, and economic growth within Indonesia’s rapidly evolving digital economy.",
    primaryMarket: {
      price: "1",
      open: null,
      high: null,
      low: null,
      close: null,
      priceChange24h: "0",
      priceChangePct24h: "0",
      apy: null,
      fdv: null,
      marketCap: null,
      totalSupply: null,
      circulatingSupply: null,
      tvl: null,
      volume24h: null,
      averageVolume: null,
      sharesMultiplier: "1",
    },
    supportedPaymentMethods: [
      {
        chainId: 84532,
        network: "Base Sepolia",
        paymentMethod: "IDRX",
        paymentMethodAddress: getTokensForChain(84532).IDRX.address,
        paymentMethodDecimals: getTokensForChain(84532).IDRX.decimals,
      },
    ],
    minimumAmount: 1000000,
    supportedNetworks: [
      {
        network: "Base Sepolia",
        chainId: 84532,
        address: contractAddresses.IDRCProxy,
        decimals: 2,
      },
    ],
    integrationPartners: [],
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
        categorySlug: "region-market-exposure",
        categoryLabel: "Region / Market Exposure",
        tagSlug: "indonesia",
        tagLabel: "Indonesia",
      },
      {
        categoryLayer: "4",
        categorySlug: "currency-pegged",
        categoryLabel: "Currency Peg",
        tagSlug: "idr",
        tagLabel: "Indonesian Rupiah (IDR)",
      },
    ],
    topHoldings: [],
    dividend: {
      dividendYield: "0",
      lastCashAmount: "0",
      lastPaymentDate: "",
      payoutFrequency: "none",
      ticker: "IDRC",
    },
    createdAt: "2025-07-17T21:34:03.081Z",
    iconSrc: "/idrc-token.png",
  },
];

export type AssetInfo = (typeof assetsInfo)[0];
