import { gql } from "graphql-request";

export const queryRequestedSubscriptions = (user: string) => {
  return gql`{
    requestedSubscriptions(orderBy: blockTimestamp, orderDirection: desc, where: {user: "${user.toLowerCase()}"}) {
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
