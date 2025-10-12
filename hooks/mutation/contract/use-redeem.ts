import { erc20Abi } from "viem";

import { contractAddresses } from "@/lib/constants";
import { hubABI } from "@/lib/abis/hub.abi";

import {
  useMultiStepTransaction,
  ContractStep,
} from "../use-multi-step-transaction";

export type RedeemParams = {
  token: `0x${string}`;
  spender: `0x${string}`;
  amount: bigint;
  recipient: `0x${string}`;

  redeemId: string;
  subscriptionIds: string[];
  userId: string;

  metadata?: Record<string, any>;
};

export const useRedeem = () => {
  return useMultiStepTransaction<
    Pick<RedeemParams, "token" | "spender" | "amount">
  >({
    steps: [
      {
        id: "approve-token",
        type: "contract",
        name: "Approve Token",
        description: "Approve smart contract to spend tokens",
        buildTransaction: async (params) => ({
          address: contractAddresses.IDRCProxy,
          abi: erc20Abi,
          functionName: "approve",
          args: [params.spender, params.amount],
        }),
      } as ContractStep,
      {
        id: "execute-redeem",
        type: "contract",
        name: "Execute Redemption",
        description: "Execute redemption on blockchain",
        buildTransaction: async (params) => ({
          address: params.spender,
          abi: hubABI,
          functionName: "requestRedemption",
          args: [params.token, params.amount],
        }),
      } as ContractStep,
    ],
    finalizationDelay: 500,
    stopOnError: true,
  });
};
