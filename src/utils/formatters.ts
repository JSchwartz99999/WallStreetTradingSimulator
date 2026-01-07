/**
 * Format a number as US currency
 */
export function formatCurrency(amount: number): string {
  if (!Number.isFinite(amount)) return '$0.00';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a number as a percentage with sign
 */
export function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return '+0.00%';

  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

/**
 * Format a number with thousand separators
 */
export function formatNumber(value: number, decimals = 0): string {
  if (!Number.isFinite(value)) return '0';

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format a timestamp as local time
 */
export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Format a timestamp as local date
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format large numbers with abbreviations (K, M, B)
 */
export function formatCompact(value: number): string {
  if (!Number.isFinite(value)) return '0';

  if (value >= 1e9) {
    return `${(value / 1e9).toFixed(1)}B`;
  }
  if (value >= 1e6) {
    return `${(value / 1e6).toFixed(1)}M`;
  }
  if (value >= 1e3) {
    return `${(value / 1e3).toFixed(1)}K`;
  }

  return value.toFixed(0);
}

/**
 * Format price change with color indicator
 */
export function formatPriceChange(change: number, price: number): { text: string; isPositive: boolean } {
  const changePercent = price > 0 ? (change / price) * 100 : 0;
  const isPositive = change >= 0;
  const arrow = isPositive ? '▲' : '▼';

  return {
    text: `${arrow} ${formatCurrency(Math.abs(change))} (${formatPercent(changePercent)})`,
    isPositive,
  };
}
