import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { InputFloating } from "@/components/ui/input-floating";
import { SelectFloating } from "@/components/ui/select-floating";
import FallbackImage from "@/components/fallback-image";
import { FALLBACK_IMAGE } from "@/lib/constants";
import {
  Chain,
  ChainApiResponse,
  Wallet,
  WalletFormData,
} from "@/types/wallet.types";
import { encodeSvgDataUri } from "@/lib/utils";
import { networkData } from "@/data/network.data";

interface EditWalletSheetProps {
  trigger: React.ReactNode;
  wallet?: Wallet;
  onWalletUpdate: () => void;
  existingWallets?: Wallet[];
}

function getChainImageForSheet(chain: Chain): string {
  const networkInfo = networkData.find((n) => n.chainId === chain.chainId);

  return (
    networkInfo?.logo || `/images/chains/${chain.network.toLowerCase()}.webp`
  );
}

export default function EditWalletSheet({
  trigger,
  wallet,
  onWalletUpdate,
  existingWallets = [],
}: EditWalletSheetProps) {
  const [open, setOpen] = useState(false);
  const [chains, setChains] = useState<Chain[]>([]);
  const [isLoadingChains, setIsLoadingChains] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<WalletFormData>({
    address: wallet?.address || "",
    chainId: wallet?.chain.chainId.toString() || "",
    name: wallet ? `${wallet.chain.name} Wallet` : "",
  });

  const fetchChains = async () => {
    try {
      setIsLoadingChains(true);
      const response = await fetch("/api/chains");

      if (!response.ok) {
        throw new Error("Failed to fetch chains");
      }

      const data: ChainApiResponse = await response.json();

      setChains(data.chains || []);
    } catch {
      toast.error("Failed to load blockchain networks");
    } finally {
      setIsLoadingChains(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchChains();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.address || !formData.chainId) {
      toast.error("Please fill in all required fields");

      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(formData.address)) {
      toast.error("Please enter a valid wallet address");

      return;
    }

    if (!wallet) {
      const hasChainWallet = existingWallets.some(
        (existingWallet) =>
          existingWallet.chain.chainId === parseInt(formData.chainId),
      );

      if (hasChainWallet) {
        const chainName =
          chains.find((c) => c.chainId === parseInt(formData.chainId))?.name ||
          "this chain";

        toast.error(`You already have a wallet registered for ${chainName}`);

        return;
      }
    }

    try {
      setIsSaving(true);
      const response = await fetch("/api/user/wallet", {
        method: wallet ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          wallet
            ? {
                walletId: wallet.id,
                address: formData.address,
                chainId: parseInt(formData.chainId),
              }
            : {
                address: formData.address,
                chainId: parseInt(formData.chainId),
              },
        ),
      });

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(errorData.error || "Failed to save wallet");
      }

      toast.success(
        wallet ? "Wallet updated successfully" : "Wallet added successfully",
      );
      setOpen(false);
      onWalletUpdate();

      if (!wallet) {
        setFormData({
          address: "",
          chainId: "",
          name: "",
        });
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save wallet",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const chainOptions = chains.map((chain) => {
    const existingCount = existingWallets.filter(
      (w) => w.chain.chainId === chain.chainId,
    ).length;
    const hasWallet = existingCount > 0;
    const label = hasWallet ? `${chain.name} (Already added)` : chain.name;

    return {
      value: chain.chainId.toString(),
      label,
      disabled: hasWallet && !wallet,
      icon: (
        <FallbackImage
          alt={chain.name}
          className="w-full h-full"
          fallback={FALLBACK_IMAGE}
          height={200}
          src={encodeSvgDataUri(getChainImageForSheet(chain))}
          width={200}
        />
      ),
    };
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="top-5 right-5 h-[95vh] rounded-4xl min-w-xl p-5">
        <form onSubmit={handleSubmit}>
          <SheetHeader>
            <SheetTitle className="text-2xl font-medium text-black">
              {wallet ? "Update Wallet" : "Add New Wallet"}
            </SheetTitle>
            <SheetDescription>
              {wallet
                ? "Update your wallet information"
                : "Add a new wallet to your account for investing"}
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-4 py-4">
            <SelectFloating
              disabled={isLoadingChains || !!wallet}
              label="Blockchain Network"
              options={chainOptions}
              placeholder={
                isLoadingChains
                  ? "Loading networks..."
                  : "Select a blockchain network"
              }
              value={formData.chainId}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, chainId: value }))
              }
            />

            <InputFloating
              required
              id="wallet-address"
              label="Wallet Address"
              value={formData.address}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  address: e.target.value.toLowerCase(),
                }))
              }
            />
          </div>

          <SheetFooter className="flex flex-row items-center justify-between">
            <SheetClose asChild>
              <Button
                className="text-lg p-6"
                disabled={isSaving}
                type="button"
                variant="outline"
              >
                Close
              </Button>
            </SheetClose>
            <Button
              className="text-lg p-6"
              disabled={isSaving || !formData.address || !formData.chainId}
              type="submit"
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSaving ? "Saving..." : "Save Wallet"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
