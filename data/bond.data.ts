export type BondProductType = {
  name: string;
  description: string;
  selected: boolean;
  lockPeriodDays: number;
  lockPeriod: number;
  minDeposit: number;
  apr: number;
  totalSupply: number;
  maxSupply: number;
  image: string;
};

export const bondData: BondProductType[] = [
  {
    name: "3-Month Government Bond",
    description: "Low risk, government-backed security",
    selected: true,
    lockPeriodDays: 90,
    lockPeriod: 7776000,
    minDeposit: 100,
    apr: 850,
    totalSupply: 0,
    maxSupply: 1000000,
    image: "/art.png",
  },
  {
    name: "6-Month Corporate Bond",
    description: "Medium risk, higher yield potential",
    selected: false,
    lockPeriodDays: 180,
    lockPeriod: 15552000,
    minDeposit: 500,
    apr: 1280,
    totalSupply: 0,
    maxSupply: 1000000,
    image: "/art.png",
  },
  {
    name: "12-Month High Yield Bond",
    description: "Higher risk, maximum yield opportunity",
    selected: false,
    lockPeriodDays: 360,
    lockPeriod: 31536000,
    minDeposit: 1000,
    apr: 1820,
    totalSupply: 0,
    maxSupply: 1000000,
    image: "/art.png",
  },
];
