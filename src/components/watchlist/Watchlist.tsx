import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useWatchlistStore } from '@/store/watchlistStore';
import { useMarketStore } from '@/store/marketStore';
import { ASSETS } from '@/utils/constants';
import { formatCurrency, formatPercent } from '@/utils/formatters';
import { clsx } from 'clsx';

interface WatchlistProps {
  className?: string;
}

export function Watchlist({ className }: WatchlistProps) {
  const watchlist = useWatchlistStore((state) => state.watchlist);
  const removeFromWatchlist = useWatchlistStore((state) => state.removeFromWatchlist);
  const prices = useMarketStore((state) => state.prices);
  const selectSymbol = useMarketStore((state) => state.selectSymbol);

  if (watchlist.length === 0) {
    return (
      <Card className={className}>
        <h2 className="text-lg font-semibold mb-4 text-gray-200 flex items-center gap-2">
          <span>⭐</span> Watchlist
        </h2>
        <p className="text-center text-gray-500 py-4">
          No items in watchlist. Click the star on any asset to add it.
        </p>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <h2 className="text-lg font-semibold mb-4 text-gray-200 flex items-center gap-2">
        <span>⭐</span> Watchlist ({watchlist.length})
      </h2>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {watchlist.map((symbol) => {
          const asset = ASSETS[symbol];
          const priceData = prices[symbol];
          const price = priceData?.price ?? 0;
          const change = priceData?.change ?? 0;
          const changePercent = priceData?.changePercent ?? 0;
          const isPositive = change >= 0;

          return (
            <div
              key={symbol}
              className="flex items-center justify-between p-2 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
              onClick={() => selectSymbol(symbol)}
            >
              <div className="flex-1">
                <div className="font-semibold text-white">{symbol}</div>
                <div className="text-xs text-gray-400">{asset?.name}</div>
              </div>
              <div className="text-right mr-2">
                <div className="font-semibold text-white">{formatCurrency(price)}</div>
                <div
                  className={clsx(
                    'text-xs',
                    isPositive ? 'text-emerald-400' : 'text-red-400'
                  )}
                >
                  {isPositive ? '▲' : '▼'} {formatPercent(changePercent)}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFromWatchlist(symbol);
                }}
                aria-label={`Remove ${symbol} from watchlist`}
              >
                ✕
              </Button>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
