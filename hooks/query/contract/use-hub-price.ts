import { useReadContract } from "wagmi";

import { contractAddresses } from "@/lib/constants";
import { hubABI } from "@/lib/abis/hub.abi";
import { normalize } from "@/lib/helper/bignumber";

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

  const idrxAmount = (assetNum * Number(price)) / 100;

  return idrxAmount;
};

export const calculateIdrcAmount = (
  idrcAmount: string | number,
  price: bigint | undefined,
): number => {
  if (!price || !idrcAmount) return 0;

  const idrcNum =
    typeof idrcAmount === "string" ? parseFloat(idrcAmount) : idrcAmount;

  if (isNaN(idrcNum) || idrcNum === 0) return 0;

  const pricePerIdrc = Number(normalize(Number(price), 2));
  const assetAmount = idrcNum / pricePerIdrc;

  return assetAmount;
};
