import { BigNumber } from "bignumber.js";

import { BigNumberValue, valueToBigNumber } from "./bignumber";

/**
 * Frontend decimal normalization utilities
 * Matches the backend's 6-decimal precision for consistent financial calculations
 */

export const BigNumberSixDecimals = BigNumber.clone({
  DECIMAL_PLACES: 6,
  ROUNDING_MODE: BigNumber.ROUND_HALF_UP,
});

/**
 * Normalizes a value to 6 decimal places (matches backend normalization)
 * @param value - The value to normalize
 * @returns Normalized BigNumber with 6 decimal places
 */
export function normalizeToSixDecimalsBN(value: BigNumberValue): BigNumber {
  const bn = valueToBigNumber(value);

  return new BigNumberSixDecimals(bn.toFixed(6));
}

/**
 * Normalizes a value to 6 decimal places and returns as number
 * @param value - The value to normalize
 * @returns Normalized number with 6 decimal places
 */
export function normalizeToSixDecimals(value: BigNumberValue): number {
  return normalizeToSixDecimalsBN(value).toNumber();
}

/**
 * Normalizes a value to 6 decimal places and returns as string
 * @param value - The value to normalize
 * @param removeTrailingZeros - Whether to remove trailing zeros (default: true)
 * @returns Normalized string representation
 */
export function normalizeToSixDecimalsString(
  value: BigNumberValue,
  removeTrailingZeros: boolean = true,
): string {
  const normalized = normalizeToSixDecimalsBN(value);
  const fixed = normalized.toFixed(6);

  return removeTrailingZeros ? fixed.replace(/\.?0+$/, "") : fixed;
}

/**
 * Sums an array of financial values with proper 6-decimal normalization
 * @param values - Array of values to sum
 * @returns Normalized sum as BigNumber
 */
export function sumFinancialValuesBN(values: BigNumberValue[]): BigNumber {
  return values.reduce((acc: BigNumber, value) => {
    return acc.plus(normalizeToSixDecimalsBN(value));
  }, new BigNumberSixDecimals(0));
}

/**
 * Sums an array of financial values with proper 6-decimal normalization
 * @param values - Array of values to sum
 * @returns Normalized sum as number
 */
export function sumFinancialValues(values: BigNumberValue[]): number {
  return sumFinancialValuesBN(values).toNumber();
}

/**
 * Formats a financial value for display with proper normalization
 * @param value - The value to format
 * @param options - Formatting options
 * @returns Formatted string for display
 */
export function formatFinancialValue(
  value: BigNumberValue,
  options: {
    decimals?: number;
    currency?: string;
    compact?: boolean;
    removeTrailingZeros?: boolean;
  } = {},
): string {
  const {
    decimals = 2,
    currency = "$",
    compact = false,
    removeTrailingZeros = true,
  } = options;

  const normalized = normalizeToSixDecimalsBN(value);

  if (normalized.isZero()) {
    return `${currency}0`;
  }

  let formatted: string;

  if (compact && normalized.gte(1000)) {
    const absValue = normalized.abs();

    if (absValue.gte(1000000000)) {
      formatted = normalized.dividedBy(1000000000).toFixed(2) + "B";
    } else if (absValue.gte(1000000)) {
      formatted = normalized.dividedBy(1000000).toFixed(2) + "M";
    } else if (absValue.gte(1000)) {
      formatted = normalized.dividedBy(1000).toFixed(2) + "K";
    } else {
      formatted = normalized.toFixed(Math.min(decimals, 6));
    }
  } else {
    formatted = normalized.toFixed(Math.min(decimals, 6));
  }

  if (removeTrailingZeros) {
    formatted = formatted.replace(/\.?0+$/, "");
  }

  if (!compact) {
    const parts = formatted.split(".");

    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    formatted = parts.join(".");
  }

  return `${currency}${formatted}`;
}

/**
 * Calculates percentage with proper normalization
 * @param numerator - The numerator value
 * @param denominator - The denominator value
 * @param decimals - Number of decimal places for result (default: 2)
 * @returns Normalized percentage
 */
export function calculatePercentage(
  numerator: BigNumberValue,
  denominator: BigNumberValue,
  decimals: number = 2,
): number {
  const num = normalizeToSixDecimalsBN(numerator);
  const den = normalizeToSixDecimalsBN(denominator);

  if (den.isZero()) return 0;

  const percentage = num.dividedBy(den).multipliedBy(100);

  return percentage.dp(decimals).toNumber();
}

/**
 * Checks if a financial value is effectively zero (within tolerance)
 * @param value - The value to check
 * @param tolerance - Tolerance for zero check (default: 1e-6)
 * @returns Whether the value is effectively zero
 */
export function isEffectivelyZero(
  value: BigNumberValue,
  tolerance: number = 1e-6,
): boolean {
  const normalized = normalizeToSixDecimalsBN(value);

  return normalized.abs().lt(tolerance);
}

/**
 * Ensures a value is positive (returns 0 if negative)
 * @param value - The value to ensure is positive
 * @returns Normalized positive value
 */
export function ensurePositive(value: BigNumberValue): BigNumber {
  const normalized = normalizeToSixDecimalsBN(value);

  return BigNumber.max(normalized, 0);
}

/**
 * Converts token units to human readable format (for 6-decimal tokens)
 * @param tokenValue - Value in smallest token units
 * @param decimals - Token decimals (default: 6)
 * @returns Human readable value
 */
export function fromTokenUnits(
  tokenValue: BigNumberValue,
  decimals: number = 6,
): number {
  const bn = valueToBigNumber(tokenValue);

  if (bn.isZero() || bn.isNaN()) return 0;

  const divisor = new BigNumber(10).pow(decimals);
  const humanReadable = bn.dividedBy(divisor);

  return normalizeToSixDecimals(humanReadable);
}

/**
 * Converts human readable value to token units (for 6-decimal tokens)
 * @param value - Human readable value
 * @param decimals - Token decimals (default: 6)
 * @returns Token units as string
 */
export function toTokenUnits(
  value: BigNumberValue,
  decimals: number = 6,
): string {
  const normalized = normalizeToSixDecimalsBN(value);
  const multiplier = new BigNumber(10).pow(decimals);
  const tokenUnits = normalized.multipliedBy(multiplier);

  return tokenUnits.integerValue(BigNumber.ROUND_DOWN).toString();
}

/**
 * Converts API response values to normalized frontend values
 * NOTE: API now returns human-readable values (already converted from token units)
 * @param apiValue - Value from API response (already in human-readable format)
 * @returns Normalized number for frontend use
 */
export function fromApiValue(apiValue: any): number {
  if (apiValue === null || apiValue === undefined) return 0;

  return normalizeToSixDecimals(apiValue);
}

/**
 * Prepares a value for API request (maintains precision)
 * @param frontendValue - Frontend value to send to API
 * @returns String representation with proper precision
 */
export function toApiValue(frontendValue: BigNumberValue): string {
  return normalizeToSixDecimalsBN(frontendValue).toString();
}
