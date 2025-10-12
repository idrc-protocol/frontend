export interface SumsubAccessToken {
  token: string;
  userId: string;
}

export interface SumsubAccessTokenResponse {
  data: {
    token: string;
    userId: string;
  };
}
