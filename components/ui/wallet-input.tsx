/* eslint-disable @next/next/no-img-element */
import * as React from "react";
import { CheckIcon, ChevronsUpDown, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, encodeSvgDataUri } from "@/lib/utils";

interface Chain {
  id: string;
  name: string;
  symbol: string;
  network: string;
  chainId: number;
  rpcUrl: string | null;
  explorerUrl: string | null;
}

type NetworkEntry = {
  label: string;
  value: string;
  symbol: string;
  chainId: number;
  addressPattern: RegExp;
  image: string;
};

type WalletInputProps = Omit<
  React.ComponentProps<"input">,
  "onChange" | "value" | "ref"
> & {
  onChange?: (value: string) => void;
  onChainChange?: (chainId: number) => void;
  value?: string;
  chainId?: number;
  error?: boolean;
  helperText?: string;
  label?: string;
};

const WalletInput: React.ForwardRefExoticComponent<WalletInputProps> =
  React.forwardRef<HTMLInputElement, WalletInputProps>(
    (
      {
        className,
        onChange,
        onChainChange,
        value,
        chainId,
        error,
        helperText,
        label,
        ...props
      },
      ref,
    ) => {
      const [networks, setNetworks] = React.useState<NetworkEntry[]>([]);
      const [selectedChainId, setSelectedChainId] = React.useState<
        number | null
      >(chainId || null);
      const [isValid, setIsValid] = React.useState<boolean | null>(null);
      const [isLoading, setIsLoading] = React.useState(true);

      React.useEffect(() => {
        const fetchChains = async () => {
          try {
            const response = await fetch("/api/chains");
            const data = await response.json();

            if (data.success && data.chains) {
              const { networkData } = await import("@/data/network.data");

              const mappedNetworks: NetworkEntry[] = data.chains.map(
                (chain: Chain) => {
                  const networkInfo = networkData.find(
                    (n) => n.chainId === chain.chainId,
                  );

                  return {
                    label: chain.name,
                    value: chain.chainId.toString(),
                    symbol: chain.symbol,
                    chainId: chain.chainId,
                    addressPattern: /^0x[a-fA-F0-9]{40}$/,
                    image:
                      networkInfo?.logo ||
                      `/images/chains/${chain.network.toLowerCase()}.webp`,
                  };
                },
              );

              setNetworks(mappedNetworks);

              if (!selectedChainId && mappedNetworks.length > 0) {
                setSelectedChainId(mappedNetworks[0].chainId);
                onChainChange?.(mappedNetworks[0].chainId);
              }
            }
          } catch (error) {
            throw error;
          } finally {
            setIsLoading(false);
          }
        };

        fetchChains();
      }, []);

      React.useEffect(() => {
        if (chainId !== undefined) {
          setSelectedChainId(chainId);
        }
      }, [chainId]);

      const currentNetwork =
        networks.find((n) => n.chainId === selectedChainId) || networks[0];

      const validateAddress = (address: string, networkPattern: RegExp) => {
        if (!address) return null;

        return networkPattern.test(address);
      };

      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;

        if (newValue) {
          const isValidAddress = validateAddress(
            newValue,
            currentNetwork.addressPattern,
          );

          setIsValid(isValidAddress);
        } else {
          setIsValid(null);
        }

        onChange?.(newValue);
      };

      const handleNetworkChange = (newChainId: number) => {
        setSelectedChainId(newChainId);
        onChainChange?.(newChainId);
        if (value) {
          const newNetworkData = networks.find((n) => n.chainId === newChainId);

          if (newNetworkData) {
            const isValidAddress = validateAddress(
              value,
              newNetworkData.addressPattern,
            );

            setIsValid(isValidAddress);
          }
        }
      };

      if (isLoading) {
        return (
          <div
            className={cn(
              "w-full flex items-center justify-center py-4",
              className,
            )}
          >
            <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
            <span className="ml-2 text-sm text-gray-600">
              Loading networks...
            </span>
          </div>
        );
      }

      if (networks.length === 0) {
        return (
          <div className={cn("w-full", className)}>
            <p className="text-sm text-red-500">No networks available</p>
          </div>
        );
      }

      return (
        <div className={cn("w-full", className)}>
          {label && (
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {label}
            </label>
          )}
          <div className="relative">
            <div className="flex w-full">
              <NetworkSelect
                error={error}
                networks={networks}
                value={selectedChainId}
                onChange={handleNetworkChange}
              />
              <InputComponent
                ref={ref}
                error={error}
                isValid={isValid}
                value={value}
                onChange={handleChange}
                {...props}
              />
            </div>
          </div>
          {helperText && (
            <p
              className={cn(
                "mt-1 text-xs",
                error ? "text-red-500" : "text-gray-500",
              )}
            >
              {helperText}
            </p>
          )}
          {isValid === false && !helperText && currentNetwork && (
            <p className="mt-1 text-xs text-red-500">
              Please enter a valid {currentNetwork.label.toLowerCase()} wallet
              address
            </p>
          )}
        </div>
      );
    },
  );

WalletInput.displayName = "WalletInput";

const InputComponent = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input"> & { error?: boolean; isValid?: boolean | null }
>(
  (
    { className, disabled, value, placeholder, error, isValid, ...props },
    ref,
  ) => {
    const [focused, setFocused] = React.useState(false);

    const handleFocus = () => {
      setFocused(true);
    };

    const handleBlur = () => {
      setFocused(false);
    };

    const hasValue = !!value && value.toString().length > 0;

    const getBorderColor = () => {
      if (error) return "border-red-500";
      if (isValid === true) return "border-green-500";
      if (focused) return "border-blue-500";

      return "border-gray-200";
    };

    const getBgColor = () => {
      if (disabled) return "bg-gray-50";
      if (focused) return "bg-white";

      return "bg-white hover:bg-gray-50";
    };

    return (
      <div
        className={cn(
          "group flex flex-col w-full",
          disabled && "opacity-60",
          className,
        )}
      >
        <div
          className={cn(
            "relative w-full inline-flex rounded-r-xl transition-all duration-200 h-14 py-1.5 px-3 pr-6",
            "border-1 border-l-0",
            getBorderColor(),
            getBgColor(),
            "focus-within:ring-2 focus-within:ring-blue-100",
          )}
        >
          <label
            className={cn(
              "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm transition-all duration-200 pointer-events-none",
              (focused || hasValue) && "text-xs -translate-y-4 text-gray-400",
            )}
            htmlFor="wallet-address"
          >
            {typeof placeholder === "string" && placeholder.length > 0
              ? placeholder
              : "Enter wallet address"}
          </label>
          <input
            className={cn(
              "w-full bg-transparent text-black text-sm outline-none pt-4 pr-6",
              "font-mono tracking-wide",
            )}
            {...props}
            ref={ref}
            autoComplete="off"
            id="wallet-address"
            spellCheck={false}
            onBlur={handleBlur}
            onFocus={handleFocus}
          />
          {isValid === true && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <CheckIcon className="h-4 w-4 text-green-500" />
            </div>
          )}
          {error && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <div className="h-4 w-4 rounded-full bg-red-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">!</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
);

InputComponent.displayName = "InputComponent";

type NetworkSelectProps = {
  disabled?: boolean;
  networks: NetworkEntry[];
  value: number | null;
  onChange: (chainId: number) => void;
  error?: boolean;
};

const NetworkSelect = ({
  disabled,
  networks,
  value: selectedChainId,
  onChange,
  error,
}: NetworkSelectProps) => {
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);
  const [searchValue, setSearchValue] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);

  const selectedNetworkData =
    networks.find((n) => n.chainId === selectedChainId) || networks[0];

  const getBorderColor = () => {
    if (error) return "border-red-500";

    return "border-gray-200 hover:border-gray-300";
  };

  return (
    <Popover
      modal
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        open && setSearchValue("");
      }}
    >
      <PopoverTrigger asChild>
        <Button
          className={cn(
            "flex gap-2 rounded-e-none rounded-s-lg border-1 px-3 focus:z-10 h-14 bg-gray-50 hover:bg-gray-100 transition-colors min-w-[120px]",
            getBorderColor(),
            disabled && "opacity-50 cursor-not-allowed",
          )}
          disabled={disabled}
          type="button"
          variant="ghost"
        >
          <div className="w-5 h-5">
            <img
              alt={selectedNetworkData?.label || "Network Logo"}
              className="w-full h-full rounded-full"
              src={encodeSvgDataUri(selectedNetworkData?.image || "")}
            />
          </div>
          <span className="text-xs text-gray-600 font-mono">
            {selectedNetworkData.symbol}
          </span>
          <ChevronsUpDown
            className={cn(
              "size-4 opacity-50 transition-transform",
              isOpen && "rotate-180",
              disabled ? "hidden" : "opacity-100",
            )}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[320px] p-0">
        <Command>
          <CommandInput
            placeholder="Search network or symbol..."
            value={searchValue}
            onValueChange={(value) => {
              setSearchValue(value);
              setTimeout(() => {
                if (scrollAreaRef.current) {
                  const viewportElement = scrollAreaRef.current.querySelector(
                    "[data-radix-scroll-area-viewport]",
                  );

                  if (viewportElement) {
                    viewportElement.scrollTop = 0;
                  }
                }
              }, 0);
            }}
          />
          <CommandList>
            <ScrollArea ref={scrollAreaRef} className="h-72">
              <CommandEmpty>No network found.</CommandEmpty>
              <CommandGroup className="">
                {networks
                  .filter(({ value, label, symbol }) => {
                    if (!searchValue) return true;
                    const search = searchValue.toLowerCase();

                    return (
                      label.toLowerCase().includes(search) ||
                      symbol.toLowerCase().includes(search) ||
                      value.toLowerCase().includes(search)
                    );
                  })
                  .map((network) => (
                    <NetworkSelectOption
                      key={network.chainId}
                      network={network}
                      selectedChainId={selectedChainId}
                      onChange={onChange}
                      onSelectComplete={() => setIsOpen(false)}
                    />
                  ))}
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

interface NetworkSelectOptionProps {
  network: NetworkEntry;
  selectedChainId: number | null;
  onChange: (chainId: number) => void;
  onSelectComplete: () => void;
}

const NetworkSelectOption = ({
  network,
  selectedChainId,
  onChange,
  onSelectComplete,
}: NetworkSelectOptionProps) => {
  const handleSelect = (_: string) => {
    onChange(network.chainId);
    onSelectComplete();
  };

  const isSelected = network.chainId === selectedChainId;

  return (
    <CommandItem
      className={cn(
        "gap-2 transition-colors mt-2 py-3 mx-2",
        isSelected && "bg-blue-50 text-blue-700",
      )}
      onSelect={handleSelect}
    >
      <div className="w-6 h-6">
        <img
          alt={network.label || "Network Logo"}
          className="w-full h-full rounded-full"
          src={encodeSvgDataUri(network.image || "")}
        />
      </div>
      <span className="flex-1 text-sm font-medium">{network.label}</span>
      <CheckIcon
        className={cn(
          "ml-2 size-4 transition-opacity",
          isSelected ? "opacity-100" : "opacity-0",
        )}
      />
    </CommandItem>
  );
};

export { WalletInput };
