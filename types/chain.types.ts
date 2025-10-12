export interface Chain {
  id: string;
  chainId: number;
  name: string;
  symbol: string;
  icon?: string;
  rpcUrl?: string;
  explorerUrl?: string;
  isTestnet?: boolean;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ChainApiResponse {
  success: boolean;
  chains: Chain[];
}

export interface ChainSelectOption extends Chain {
  isDisabled?: boolean;
  isComingSoon?: boolean;
}
