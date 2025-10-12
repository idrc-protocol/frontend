import { gql } from "graphql-request";

export const queryRequestedRedemptions = (user: string) => {
  return gql`{
    requestedRedemptions(orderBy: blockTimestamp, orderDirection: desc, where: {user: "${user.toLowerCase()}"}) {
      amount
      blockNumber
      blockTimestamp
      id
      shares
      transactionHash
      user
    }
  }`;
};
