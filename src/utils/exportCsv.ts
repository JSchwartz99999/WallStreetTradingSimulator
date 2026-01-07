import type { Trade } from '@/store/types';
import { formatCurrency } from './formatters';

export function exportTradesToCsv(trades: Trade[]): void {
  if (trades.length === 0) {
    alert('No trades to export');
    return;
  }

  // CSV headers
  const headers = ['Date', 'Time', 'Type', 'Symbol', 'Quantity', 'Price', 'Total', 'ID'];

  // Convert trades to CSV rows
  const rows = trades.map((trade) => {
    const date = new Date(trade.timestamp);
    return [
      date.toLocaleDateString(),
      date.toLocaleTimeString(),
      trade.type.toUpperCase(),
      trade.symbol,
      trade.quantity.toString(),
      formatCurrency(trade.price),
      formatCurrency(trade.total),
      trade.id,
    ];
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `trade_history_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export function exportPortfolioToCsv(
  positions: Record<string, { symbol: string; quantity: number; avgPrice: number }>,
  prices: Record<string, { price: number }>
): void {
  const positionList = Object.values(positions);

  if (positionList.length === 0) {
    alert('No positions to export');
    return;
  }

  const headers = ['Symbol', 'Quantity', 'Avg Price', 'Current Price', 'Market Value', 'P/L', 'P/L %'];

  const rows = positionList.map((pos) => {
    const currentPrice = prices[pos.symbol]?.price ?? pos.avgPrice;
    const marketValue = pos.quantity * currentPrice;
    const costBasis = pos.quantity * pos.avgPrice;
    const pl = marketValue - costBasis;
    const plPercent = costBasis > 0 ? (pl / costBasis) * 100 : 0;

    return [
      pos.symbol,
      pos.quantity.toString(),
      formatCurrency(pos.avgPrice),
      formatCurrency(currentPrice),
      formatCurrency(marketValue),
      formatCurrency(pl),
      `${plPercent.toFixed(2)}%`,
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `portfolio_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
