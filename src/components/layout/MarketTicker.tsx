import { Card } from '@/components/ui/Card';
import { useMarketStore } from '@/store/marketStore';
import { formatCurrency, formatPercent } from '@/utils/formatters';
import { TICKER_SYMBOLS } from '@/utils/constants';
import { clsx } from 'clsx';

export function MarketTicker() {
  const prices = useMarketStore((state) => state.prices);

  // Generate ticker items
  const tickerItems = TICKER_SYMBOLS.map((symbol) => {
    const asset = prices[symbol];
    if (!asset) return null;

    const isPositive = asset.change >= 0;

    return (
      <div
        key={symbol}
        className="flex items-center gap-3"
        role="listitem"
      >
        <span className="font-semibold text-white">{symbol}</span>
        <span className="text-gray-300">{formatCurrency(asset.price)}</span>
        <span
          className={clsx(
            'flex items-center gap-1',
            isPositive ? 'text-emerald-400' : 'text-red-400'
          )}
        >
          <span aria-hidden="true">{isPositive ? '▲' : '▼'}</span>
          <span>{formatPercent(asset.changePercent)}</span>
        </span>
      </div>
    );
  }).filter(Boolean);

  return (
    <Card className="p-2 sm:p-3 mb-4 overflow-hidden" role="marquee" aria-label="Live market ticker">
      <div className="flex gap-6 sm:gap-8 ticker-scroll whitespace-nowrap">
        {/* Duplicate items for seamless scroll */}
        {tickerItems}
        {tickerItems}
      </div>
    </Card>
  );
}
