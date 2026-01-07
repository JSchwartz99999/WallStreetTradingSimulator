import { clsx } from 'clsx';
import { formatCurrency, formatPercent } from '@/utils/formatters';
import { useWatchlistStore } from '@/store/watchlistStore';
import { useMarketStore } from '@/store/marketStore';
import { Sparkline } from '@/components/charts/Sparkline';
import type { Asset } from '@/utils/constants';

interface AssetCardProps {
  symbol: string;
  asset: Asset;
  price: number;
  change: number;
  changePercent: number;
  isSelected: boolean;
  onSelect: (symbol: string) => void;
}

const typeColors = {
  stocks: { bg: 'bg-blue-900/50', text: 'text-blue-300' },
  commodities: { bg: 'bg-yellow-900/50', text: 'text-yellow-300' },
  bonds: { bg: 'bg-purple-900/50', text: 'text-purple-300' },
};

export function AssetCard({
  symbol,
  asset,
  price,
  change,
  changePercent,
  isSelected,
  onSelect,
}: AssetCardProps) {
  const isPositive = change >= 0;
  const colors = typeColors[asset.type];

  const isInWatchlist = useWatchlistStore((state) => state.watchlist.includes(symbol));
  const toggleWatchlist = useWatchlistStore((state) => state.toggleWatchlist);
  const priceHistory = useMarketStore((state) => state.priceHistory[symbol] ?? []);

  const handleWatchlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWatchlist(symbol);
  };

  return (
    <div
      onClick={() => onSelect(symbol)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(symbol);
        }
      }}
      tabIndex={0}
      role="option"
      aria-selected={isSelected}
      className={clsx(
        'p-3 bg-gray-700 rounded-lg cursor-pointer',
        'hover:bg-gray-600 transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-emerald-500',
        'border border-transparent',
        isSelected && 'asset-selected'
      )}
    >
      <div className="flex justify-between items-start mb-1">
        <div className="flex items-center gap-2">
          <button
            onClick={handleWatchlistClick}
            className={clsx(
              'text-lg transition-colors focus:outline-none hover:scale-110',
              isInWatchlist ? 'text-yellow-400' : 'text-gray-600 hover:text-yellow-400'
            )}
            aria-label={isInWatchlist ? `Remove ${symbol} from watchlist` : `Add ${symbol} to watchlist`}
          >
            {isInWatchlist ? '★' : '☆'}
          </button>
          <span className="font-semibold text-white">{symbol}</span>
        </div>
        <span className={clsx('text-xs px-2 py-0.5 rounded', colors.bg, colors.text)}>
          {asset.type}
        </span>
      </div>
      <div className="text-sm text-gray-400 mb-1">{asset.name}</div>

      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-bold text-white price-animate">{formatCurrency(price)}</div>
          <div
            className={clsx(
              'text-sm flex items-center gap-1',
              isPositive ? 'text-emerald-400' : 'text-red-400'
            )}
          >
            <span aria-hidden="true">{isPositive ? '▲' : '▼'}</span>
            {formatCurrency(Math.abs(change))} ({formatPercent(changePercent)})
          </div>
        </div>

        {priceHistory.length > 2 && (
          <Sparkline
            data={priceHistory}
            width={60}
            height={24}
            className="opacity-80"
          />
        )}
      </div>
    </div>
  );
}
