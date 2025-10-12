export interface Chain {
  id: string;
  name: string;
  symbol: string;
  network: string;
  chainId: number;
  rpcUrl?: string;
  explorerUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Wallet {
  id: string;
  address: string;
  chainId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  chain: Chain;
}

export interface WalletApiResponse {
  success: boolean;
  wallets: Wallet[];
}

export interface ChainApiResponse {
  success: boolean;
  chains: Chain[];
}

export interface WalletFormData {
  address: string;
  chainId: string;
  name?: string;
}
