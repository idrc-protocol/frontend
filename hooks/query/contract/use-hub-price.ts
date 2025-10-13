import { useReadContract } from "wagmi";

import { contractAddresses } from "@/lib/constants";
import { hubABI } from "@/lib/abis/hub.abi";

export const useHubPrice = () => {
  const { data: price, ...rest } = useReadContract({
    address: contractAddresses.HubProxy,
    abi: hubABI,
    functionName: "getPrice",
  });

  return {
    price: price as bigint | undefined,
    ...rest,
  };
};

export const calculateIdrxAmount = (
  assetAmount: string | number,
  price: bigint | undefined,
): number => {
  if (!price || !assetAmount) return 0;

  const assetNum =
    typeof assetAmount === "string" ? parseFloat(assetAmount) : assetAmount;

  if (isNaN(assetNum) || assetNum === 0) return 0;

  const pricePerIdrc = Number(price) / 100;
  const idrxAmount = assetNum * pricePerIdrc;

  return idrxAmount;
};
