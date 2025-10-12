export type PositionType = {
  name: string;
  description: string;
  apr: number;
  stackedAmount: number;
  accumulatedProfit: number;
  lockPeriodDays: number;
  daysRemaining: number;
  status: "Locked" | "Matured";
  startTimestamp: number;
  endTimestamp: number;
  image: string;
};

export const positionsData: PositionType[] = [
  {
    name: "12-Month Government Bond",
    description: "Medium risk, higher yield potential",
    apr: 12.8,
    stackedAmount: 990000,
    accumulatedProfit: 84919.76,
    lockPeriodDays: 270,
    daysRemaining: 120,
    status: "Locked",
    startTimestamp: 1740678400,
    endTimestamp: 1762214400,
    image: "/art.png",
  },
  {
    name: "6-Month Government Bond",
    description: "Medium risk, higher yield potential",
    apr: 12.8,
    stackedAmount: 990000,
    accumulatedProfit: 84919.76,
    lockPeriodDays: 180,
    daysRemaining: 120,
    status: "Locked",
    startTimestamp: 1733356800,
    endTimestamp: 1769120000,
    image: "/art.png",
  },
  {
    name: "3-Month Government Bond",
    description: "Low risk, government-backed security",
    apr: 8.5,
    stackedAmount: 990000,
    accumulatedProfit: 84919.76,
    lockPeriodDays: 90,
    daysRemaining: 0,
    status: "Matured",
    startTimestamp: 1736035200,
    endTimestamp: 1743897600,
    image: "/art.png",
  },
];
