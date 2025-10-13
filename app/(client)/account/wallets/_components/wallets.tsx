/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import ButtonCopy from "@/components/copy/button-copy";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { encodeSvgDataUri } from "@/lib/utils";
import { useSession } from "@/lib/auth-client";
import { useWallets, useDeleteWallet } from "@/hooks/query/api/use-wallets";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { networkData } from "@/data/network.data";

import EditWalletSheet from "./sheet/edit-wallet-sheet";

function formatAddress(
  address: string,
  startLength = 6,
  endLength = 4,
): string {
  if (!address) return "";
  if (address.length <= startLength + endLength) return address;

  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
}

function getChainImageForWallet(chainId: number, network: string): string {
  const networkInfo = networkData.find((n) => n.chainId === chainId);

  return networkInfo?.logo || `/images/chains/${network.toLowerCase()}.webp`;
}

function getWalletStatus(): {
  status: string;
  variant: "default" | "secondary" | "destructive" | "outline";
} {
  return { status: "Active", variant: "default" };
}

function WalletsSkeleton() {
  return (
    <div className="flex flex-col gap-10 max-w-4xl">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      <div className="flex flex-col">
        <div className="border-b pb-2 mb-4">
          <div className="flex items-center">
            <div className="flex-1">
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex-1 flex justify-center">
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex-1 flex justify-center">
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex-1 flex justify-center">
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex-1 flex justify-end">
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>

        {[1, 2, 3].map((index) => (
          <div
            key={index}
            className="border-b border-gray-100 py-3 flex items-center"
          >
            <div className="flex-1 flex flex-col gap-2">
              <Skeleton className="h-4 w-32" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-3" />
              </div>
            </div>

            <div className="flex-1 flex justify-center">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>

            <div className="flex-1 flex justify-center">
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>

            <div className="flex-1 flex justify-center">
              <Skeleton className="h-4 w-24" />
            </div>

            <div className="flex-1 flex justify-end gap-2">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-5 w-5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Wallets() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const { data: wallets = [], isLoading, error, refetch } = useWallets(userId);

  const deleteWalletMutation = useDeleteWallet();

  const handleWalletUpdate = () => {
    refetch();
  };

  const handleDeleteWallet = async (walletId: string, walletName: string) => {
    try {
      await deleteWalletMutation.mutateAsync(walletId);
      toast.success(`${walletName} deleted successfully`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete wallet",
      );
    }
  };

  if (!session?.user) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <p className="text-gray-500">Please sign in to view your wallets.</p>
      </div>
    );
  }

  if (isLoading) {
    return <WalletsSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <p className="text-red-500 mb-4">Error: {error.message}</p>
        <Button variant="outline" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 max-w-4xl">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-black text-2xl font-medium">
            Wallet Management
          </span>
          <EditWalletSheet
            existingWallets={wallets}
            trigger={
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Wallet
              </Button>
            }
            onWalletUpdate={handleWalletUpdate}
          />
        </div>
        <p className="text-sm">
          Allowlisted wallets can invest using supported stablecoins and receive
          tokenized assets. When a new wallet is added, please allow up to 1
          business day for it to be approved for use.
        </p>
      </div>

      {wallets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 border border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500 mb-4">No wallets found</p>
        </div>
      ) : (
        <table className="w-full text-black">
          <thead>
            <tr className="border-b">
              <th className="text-left text-sm font-normal pb-2">Wallet</th>
              <th className="text-center text-sm font-normal pb-2">Network</th>
              <th className="text-center text-sm font-normal pb-2">Status</th>
              <th className="text-center text-sm font-normal pb-2">Added</th>
              <th className="text-right text-sm font-normal pb-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {wallets.map((wallet) => {
              const { status, variant } = getWalletStatus();
              const canDelete = wallets.length > 1;

              return (
                <tr key={wallet.id} className="border-b border-gray-100">
                  <td className="py-3 flex flex-col gap-1">
                    <span className="font-medium text-sm">
                      {wallet.chain.name} Wallet
                    </span>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-xs text-gray-500">
                        {formatAddress(wallet.address)}
                      </p>
                      <ButtonCopy
                        className="text-gray-500"
                        iconSize={4}
                        text={wallet.address}
                      />
                    </div>
                  </td>
                  <td className="py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5">
                        <img
                          alt={wallet.chain.name}
                          className="w-full h-full rounded-full"
                          src={encodeSvgDataUri(
                            getChainImageForWallet(
                              wallet.chain.chainId,
                              wallet.chain.network,
                            ),
                          )}
                        />
                      </div>
                      <span className="text-sm">{wallet.chain.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-center">
                    <Badge variant={variant}>{status}</Badge>
                  </td>
                  <td className="py-3 text-center text-sm text-gray-500">
                    {new Date(wallet.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3">
                    <div className="flex justify-end items-center gap-2">
                      {canDelete ? (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Trash2 className="text-red-600 w-5 h-5 cursor-pointer hover:text-red-800" />
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Wallet</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this wallet?
                                This action cannot be undone.
                                <br />
                                <strong>
                                  {wallet.chain.name} Wallet:{" "}
                                  {formatAddress(wallet.address)}
                                </strong>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700"
                                onClick={() =>
                                  handleDeleteWallet(
                                    wallet.id,
                                    `${wallet.chain.name} Wallet`,
                                  )
                                }
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      ) : (
                        <div className="relative group">
                          <Trash2 className="text-gray-400 w-5 h-5 cursor-not-allowed" />
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            Cannot delete last wallet
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
