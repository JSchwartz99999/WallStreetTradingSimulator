import { VALID_SYMBOLS } from './constants';

/**
 * Validate a stock symbol
 */
export function isValidSymbol(symbol: string): boolean {
  return (
    typeof symbol === 'string' &&
    symbol.length <= 10 &&
    /^[A-Z0-9]+$/.test(symbol) &&
    VALID_SYMBOLS.has(symbol)
  );
}

/**
 * Validate a numeric value is within range
 */
export function isValidNumber(value: unknown, min = 0, max = Infinity): boolean {
  const num = parseFloat(String(value));
  return Number.isFinite(num) && num >= min && num <= max;
}

/**
 * Validate quantity for trading
 */
export function validateQuantity(quantity: unknown): quantity is number {
  const num = Number(quantity);
  return Number.isInteger(num) && num >= 1 && num <= 100000;
}

/**
 * Validate price for limit orders
 */
export function validatePrice(price: unknown): price is number {
  const num = Number(price);
  return Number.isFinite(num) && num > 0 && num <= 1000000;
}

/**
 * Sanitize and clamp a number to a range
 */
export function sanitizeNumber(
  value: unknown,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  decimals = 2
): number {
  const num = parseFloat(String(value));
  if (!Number.isFinite(num)) return min;
  const clamped = Math.max(min, Math.min(max, num));
  return Number(clamped.toFixed(decimals));
}
