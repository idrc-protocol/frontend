"use client";

import React, { useState, useRef, useMemo } from "react";
import Image from "next/image";
import { Check, RefreshCw, Clock } from "lucide-react";
import { useAccount } from "wagmi";

import { TokenConfig, getAllTokens } from "@/lib/tokens";
import {
  useTokenBalances,
  formatTokenBalance,
  calculateTokenValue,
} from "@/hooks/useTokenBalances";

interface SelectTokenCryptoWithBalancesProps {
  id?: string;
  tokens?: TokenConfig[];
  placeholder?: string;
  label?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
  onValueChange?: (value: string) => void;
  showBalance?: boolean;
  showPrice?: boolean;
  showRefreshButton?: boolean;
  disabledTokens?: string[];
  comingSoonTokens?: string[];
  onDisabledTokenClick?: (tokenSymbol: string) => void;
}

export const SelectTokenCryptoWithBalances: React.FC<
  SelectTokenCryptoWithBalancesProps
> = ({
  id,
  tokens,
  placeholder = "Select a token",
  label,
  value,
  onChange,
  disabled = false,
  className = "",
  onValueChange,
  showBalance = true,
  showPrice = false,
  showRefreshButton = true,
  disabledTokens = [],
  comingSoonTokens = [],
  onDisabledTokenClick,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || "");
  const [isFocused, setIsFocused] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const { isConnected } = useAccount();

  const tokenConfigs = useMemo(() => tokens || getAllTokens(), [tokens]);

  const {
    balances,
    isLoading: isLoadingBalances,
    refetch: refetchBalances,
  } = useTokenBalances(tokenConfigs);

  const hasValue = selectedValue !== "";
  const displayLabel = label || placeholder;

  const enrichedTokens = useMemo(() => {
    return tokenConfigs.map((token) => {
      const balance = balances.find((b) => b.token.symbol === token.symbol);
      const price = 1;
      const isDisabled = disabledTokens.includes(token.symbol);
      const isComingSoon = comingSoonTokens.includes(token.symbol);

      return {
        ...token,
        balance: balance?.balance || "0",
        rawBalance: balance?.rawBalance || BigInt(0),
        value:
          price && balance
            ? calculateTokenValue(balance.balance, price)
            : undefined,
        price: 1,
        change24h: 0,
        isLoadingBalance: balance?.isLoading || false,
        isDisabled,
        isComingSoon,
      };
    });
  }, [tokenConfigs, balances, disabledTokens, comingSoonTokens]);

  const selectedToken = enrichedTokens.find(
    (token) => token.symbol === selectedValue,
  );

  const handleSelect = (
    tokenSymbol: string,
    isTokenDisabled: boolean = false,
  ) => {
    if (isTokenDisabled) {
      onDisabledTokenClick?.(tokenSymbol);

      return;
    }

    if (tokenSymbol === selectedValue) {
      setSelectedValue("");
      onChange?.({
        target: { value: "" },
      } as React.ChangeEvent<HTMLInputElement>);
      onValueChange?.("");
    } else {
      setSelectedValue(tokenSymbol);
      onValueChange?.(tokenSymbol);
      onChange?.({
        target: { value: tokenSymbol },
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
    refetchBalances();
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

  const TokenIcon = ({
    token,
    size = "w-6 h-6",
  }: {
    token: TokenConfig;
    size?: string;
  }) => {
    if (token.icon) {
      return (
        <Image
          alt={`${token.name} logo`}
          className={`${size} rounded-full flex-shrink-0`}
          height={24}
          src={token.icon}
          width={24}
        />
      );
    }

    return (
      <div
        className={`${size} rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center flex-shrink-0`}
      >
        <span className="text-white text-xs font-bold">
          {token.symbol.charAt(0).toUpperCase()}
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
            value={selectedValue}
            onChange={() => {}}
          >
            <option value="" />
            {enrichedTokens.map((token) => (
              <option key={token.symbol} value={token.symbol}>
                {token.name} ({token.symbol})
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
              ${selectedToken ? "pl-8" : ""}
            `}
            id="select-label"
          >
            {displayLabel}
          </label>

          <div
            className={`inline-flex h-fit w-[calc(100%_-_${showRefreshButton && isConnected ? "3.5rem" : "1.5rem"})] min-h-4 items-center gap-2 box-border ${hasValue || isFocused ? "pt-4" : ""}`}
          >
            {selectedToken && (
              <TokenIcon size="w-5 h-5" token={selectedToken} />
            )}
            <span
              className={`font-normal w-full text-start text-sm truncate ${
                hasValue ? "text-gray-900" : "text-gray-500"
              }`}
              id="select-value"
            >
              {selectedToken
                ? `${selectedToken.name} (${selectedToken.symbol})`
                : ""}
            </span>
          </div>

          {showRefreshButton && isConnected && (
            <div
              className={`absolute right-8 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded transition-colors cursor-pointer ${
                isLoadingBalances ? "animate-spin" : ""
              }`}
              role="button"
              tabIndex={0}
              title="Refresh balances"
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
            {!isConnected && (
              <div className="px-3 py-2 text-sm text-amber-600 bg-amber-50 rounded-lg mb-2">
                Connect wallet to see balances
              </div>
            )}
            {enrichedTokens.length > 0 ? (
              enrichedTokens.map((token) => (
                <button
                  key={token.symbol}
                  aria-disabled={token.isDisabled || token.isComingSoon}
                  aria-selected={selectedValue === token.symbol}
                  className={`flex items-center justify-between px-3 py-3 text-sm w-full text-left transition-colors duration-150 rounded-lg group ${
                    token.isDisabled || token.isComingSoon
                      ? "opacity-60 cursor-not-allowed bg-gray-50"
                      : "text-black cursor-pointer hover:bg-gray-50"
                  }`}
                  role="option"
                  tabIndex={token.isDisabled || token.isComingSoon ? -1 : 0}
                  type="button"
                  onClick={() =>
                    handleSelect(
                      token.symbol,
                      token.isDisabled || token.isComingSoon,
                    )
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSelect(
                        token.symbol,
                        token.isDisabled || token.isComingSoon,
                      );
                    }
                  }}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <TokenIcon token={token} />
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`font-medium truncate ${
                            token.isDisabled || token.isComingSoon
                              ? "text-gray-500"
                              : "text-gray-900"
                          }`}
                        >
                          {token.name}
                        </span>
                        <span className="text-gray-500 text-xs font-mono uppercase">
                          {token.symbol}
                        </span>
                        {token.isComingSoon && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                            <Clock className="w-3 h-3" />
                            Coming Soon
                          </span>
                        )}
                        {token.isDisabled && !token.isComingSoon && (
                          <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs font-medium rounded-full">
                            Disabled
                          </span>
                        )}
                      </div>
                      {showBalance &&
                        isConnected &&
                        !token.isDisabled &&
                        !token.isComingSoon && (
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            {token.isLoadingBalance ? (
                              <span className="text-gray-400">Loading...</span>
                            ) : (
                              <>
                                <span>
                                  Balance: {formatTokenBalance(token.balance)}
                                </span>
                                {token.value && (
                                  <span className="text-gray-400">
                                    ≈ ${token.value}
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-2">
                    {showPrice &&
                      token.price &&
                      !token.isDisabled &&
                      !token.isComingSoon && (
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            ${token.price.toFixed(token.price >= 1 ? 2 : 6)}
                          </div>
                          {token.change24h !== undefined && (
                            <div
                              className={`text-xs font-medium ${
                                token.change24h >= 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {token.change24h >= 0 ? "+" : ""}
                              {token.change24h.toFixed(2)}%
                            </div>
                          )}
                        </div>
                      )}
                    {selectedValue === token.symbol &&
                      !token.isDisabled &&
                      !token.isComingSoon && (
                        <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      )}
                  </div>
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-sm text-gray-500 text-center">
                No tokens available
              </div>
            )}
          </div>
        )}
      </div>

      {isOpen && (
        <button
          aria-label="Close token selector dropdown"
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
