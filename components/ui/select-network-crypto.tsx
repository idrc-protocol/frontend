/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useRef, useMemo } from "react";
import { Check, RefreshCw, Clock } from "lucide-react";

import { useChains } from "@/hooks/query/api/use-chains";
import { Chain } from "@/types/chain.types";
import { networkData } from "@/data/network.data";
import { encodeSvgDataUri } from "@/lib/utils";

interface SelectNetworkCryptoProps {
  id?: string;
  chains?: Chain[];
  placeholder?: string;
  label?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
  onValueChange?: (chainId: number, chain: Chain) => void;
  disabledChains?: (string | number)[];
  comingSoonChains?: (string | number)[];
  onDisabledChainClick?: (chain: Chain) => void;
  showRefreshButton?: boolean;
  showTestnets?: boolean;
}

export const SelectNetworkCrypto: React.FC<SelectNetworkCryptoProps> = ({
  id,
  chains: providedChains,
  placeholder = "Select a network",
  label,
  value,
  onChange,
  disabled = false,
  className = "",
  onValueChange,
  disabledChains = [],
  comingSoonChains = [],
  onDisabledChainClick,
  showRefreshButton = false,
  showTestnets = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string | number>(
    value || "",
  );
  const [isFocused, setIsFocused] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const {
    data: fetchedChains,
    isLoading: isFetchingChains,
    refetch,
  } = useChains();

  const hasValue = selectedValue !== "" && selectedValue !== undefined;
  const displayLabel = label || placeholder;

  const chainList = useMemo(
    () => providedChains || fetchedChains || [],
    [providedChains, fetchedChains],
  );

  const enrichedChains = useMemo(() => {
    let filtered = chainList;

    if (!showTestnets) {
      filtered = filtered.filter((chain) => !chain.isTestnet);
    }

    return filtered.map((chain) => {
      const isDisabled =
        disabledChains.includes(chain.chainId) ||
        disabledChains.includes(chain.name);
      const isComingSoon =
        comingSoonChains.includes(chain.chainId) ||
        comingSoonChains.includes(chain.name);

      return {
        ...chain,
        isDisabled,
        isComingSoon,
      };
    });
  }, [chainList, disabledChains, comingSoonChains, showTestnets]);

  const selectedChain = enrichedChains.find(
    (chain) =>
      chain.chainId === selectedValue ||
      chain.name === selectedValue ||
      chain.id === selectedValue,
  );

  const handleSelect = (
    chain: Chain & { isDisabled?: boolean; isComingSoon?: boolean },
  ) => {
    if (chain.isDisabled || chain.isComingSoon) {
      onDisabledChainClick?.(chain);

      return;
    }

    if (chain.chainId === selectedValue) {
      setSelectedValue("");
      onValueChange?.(null as any, null as any);
      onChange?.({
        target: { value: "" },
      } as React.ChangeEvent<HTMLInputElement>);
    } else {
      setSelectedValue(chain.chainId);
      onValueChange?.(chain.chainId, chain);
      onChange?.({
        target: { value: chain.chainId.toString() },
      } as React.ChangeEvent<HTMLInputElement>);
    }

    setIsOpen(false);
    setIsFocused(false);
  };

  const toggleOpen = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setIsFocused(!isOpen);
    }
  };

  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    refetch();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        toggleOpen();
        break;
      case "Escape":
        setIsOpen(false);
        setIsFocused(false);
        break;
      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setIsFocused(true);
        }
        break;
    }
  };

  const ChainIcon = ({
    chain,
    size = "w-6 h-6",
  }: {
    chain: Chain;
    size?: string;
  }) => {
    let iconSrc = chain.icon;

    if (!iconSrc) {
      const networkMatch = networkData.find((n) => n.chainId === chain.chainId);

      if (networkMatch?.logo) {
        iconSrc = networkMatch.logo;
      }
    }

    if (iconSrc) {
      return (
        <div className={size}>
          <img
            alt={`${chain.name} logo`}
            className="w-full h-full rounded-full"
            src={encodeSvgDataUri(iconSrc)}
          />
        </div>
      );
    }

    return (
      <div
        className={`${size} rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center flex-shrink-0`}
      >
        <span className="text-white text-xs font-bold">
          {chain.symbol.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  };

  return (
    <div
      ref={selectRef}
      className={`group inline-flex flex-col relative w-full transition-background motion-reduce:transition-none duration-150 ${className}`}
    >
      <div
        aria-hidden="true"
        className="sr-only"
        style={{
          border: "0px",
          clip: "rect(0px, 0px, 0px, 0px)",
          clipPath: "inset(50%)",
          height: "1px",
          margin: "-1px",
          overflow: "hidden",
          padding: "0px",
          position: "absolute",
          width: "1px",
          whiteSpace: "nowrap",
        }}
      >
        <label>
          {displayLabel}
          <select
            id={id}
            tabIndex={-1}
            value={selectedValue.toString()}
            onChange={() => {}}
          >
            <option value="" />
            {enrichedChains.map((chain) => (
              <option key={chain.chainId} value={chain.chainId}>
                {chain.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="w-full flex flex-col">
        <button
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-labelledby="select-label select-value"
          className={`
            relative w-full inline-flex tap-highlight-transparent rounded-xl flex-col items-start justify-center gap-0 
            hover:bg-gray-50 outline-none transition-colors duration-150
            ${isFocused ? "bg-gray-200 ring-1 ring-blue-500" : "ring-1 ring-gray-200"}
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            h-14 min-h-14 py-1.5 px-3
          `}
          disabled={disabled}
          type="button"
          onClick={toggleOpen}
          onKeyDown={handleKeyDown}
        >
          <label
            className={`
              block absolute z-10 flex-shrink-0 antialiased pointer-events-none cursor-pointer 
              transition-all duration-200 ease-out motion-reduce:transition-none origin-top-left
              ${
                hasValue || isFocused
                  ? "text-gray-600 scale-75 -translate-y-[calc(50%_+_0.375rem_-_11px)] text-md"
                  : "text-gray-500 text-sm"
              }
              pe-2 max-w-full text-ellipsis overflow-hidden
              ${selectedChain ? "pl-8" : ""}
            `}
            id="select-label"
          >
            {displayLabel}
          </label>

          <div
            className={`inline-flex h-fit w-[calc(100%_-_${showRefreshButton ? "3.5rem" : "1.5rem"})] min-h-4 items-center gap-2 box-border ${hasValue || isFocused ? "pt-4" : ""}`}
          >
            {selectedChain && (
              <ChainIcon chain={selectedChain} size="w-5 h-5" />
            )}
            <span
              className={`font-normal w-full text-start text-sm truncate ${
                hasValue ? "text-gray-900" : "text-gray-500"
              }`}
              id="select-value"
            >
              {selectedChain ? selectedChain.name : ""}
            </span>
          </div>

          {showRefreshButton && (
            <div
              className={`absolute right-8 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded transition-colors cursor-pointer ${
                isFetchingChains ? "animate-spin" : ""
              }`}
              role="button"
              tabIndex={0}
              title="Refresh chains"
              onClick={handleRefresh}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleRefresh(e as any);
                }
              }}
            >
              <RefreshCw className="w-4 h-4 text-gray-600" />
            </div>
          )}

          <svg
            aria-hidden="true"
            className={`absolute right-3 w-4 h-4 transition-transform duration-150 ease motion-reduce:transition-none ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            focusable="false"
            height="1em"
            role="presentation"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
            width="1em"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 shadow-lg max-h-80 overflow-auto py-2 px-2 rounded-xl">
            {isFetchingChains && enrichedChains.length === 0 && (
              <div className="px-3 py-4 text-sm text-gray-500 text-center">
                Loading networks...
              </div>
            )}
            {enrichedChains.length > 0
              ? enrichedChains.map((chain) => (
                  <button
                    key={chain.chainId}
                    aria-disabled={chain.isDisabled || chain.isComingSoon}
                    aria-selected={selectedValue === chain.chainId}
                    className={`flex items-center justify-between px-3 py-3 text-sm w-full text-left transition-colors duration-150 rounded-lg group ${
                      chain.isDisabled || chain.isComingSoon
                        ? "opacity-60 cursor-not-allowed bg-gray-50"
                        : "text-black cursor-pointer hover:bg-gray-50"
                    }`}
                    role="option"
                    tabIndex={chain.isDisabled || chain.isComingSoon ? -1 : 0}
                    type="button"
                    onClick={() => handleSelect(chain)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleSelect(chain);
                      }
                    }}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <ChainIcon chain={chain} />
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`font-medium truncate ${
                              chain.isDisabled || chain.isComingSoon
                                ? "text-gray-500"
                                : "text-gray-900"
                            }`}
                          >
                            {chain.name}
                          </span>
                          {chain.isTestnet && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                              Testnet
                            </span>
                          )}
                          {chain.isComingSoon && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                              <Clock className="w-3 h-3" />
                              Coming Soon
                            </span>
                          )}
                          {chain.isDisabled && !chain.isComingSoon && (
                            <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs font-medium rounded-full">
                              Disabled
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>Chain ID: {chain.chainId}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-2">
                      {selectedValue === chain.chainId &&
                        !chain.isDisabled &&
                        !chain.isComingSoon && (
                          <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        )}
                    </div>
                  </button>
                ))
              : !isFetchingChains && (
                  <div className="px-3 py-4 text-sm text-gray-500 text-center">
                    No networks available
                  </div>
                )}
          </div>
        )}
      </div>

      {isOpen && (
        <button
          aria-label="Close network selector dropdown"
          className="fixed inset-0 z-40"
          style={{
            background: "transparent",
            border: "none",
            padding: 0,
            margin: 0,
          }}
          tabIndex={0}
          type="button"
          onClick={() => {
            setIsOpen(false);
            setIsFocused(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
              setIsOpen(false);
              setIsFocused(false);
            }
          }}
        />
      )}
    </div>
  );
};
