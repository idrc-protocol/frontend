import { erc20Abi } from "viem";

import { hubABI } from "@/lib/abis/hub.abi";

import {
  useMultiStepTransaction,
  ContractStep,
} from "../use-multi-step-transaction";

export type SubscriptionParams = {
  token: HexAddress;
  spender: HexAddress;
  amount: bigint;
  recipient: HexAddress;

  productId: string;
  subscriptionType: string;
  userId: string;

  metadata?: Record<string, any>;
};

export const useSubscription = () => {
  return useMultiStepTransaction<
    Pick<SubscriptionParams, "token" | "spender" | "amount">
  >({
    steps: [
      {
        id: "approve-token",
        type: "contract",
        name: "Approve Token",
        description: "Approve smart contract to spend tokens",
        buildTransaction: async (params, _userAddress, _previousResults) => ({
          address: params.token,
          abi: erc20Abi,
          functionName: "approve",
          args: [params.spender, params.amount],
        }),
      } as ContractStep,
      {
        id: "execute-subscription",
        type: "contract",
        name: "Execute Subscription",
        description: "Execute subscription on blockchain",
        buildTransaction: async (params) => ({
          address: params.spender,
          abi: hubABI,
          functionName: "requestSubscription",
          args: [params.token, params.amount],
        }),
      } as ContractStep,
    ],
    finalizationDelay: 500,
    stopOnError: true,
  });
};
