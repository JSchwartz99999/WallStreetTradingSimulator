import { clsx } from 'clsx';
import { formatCurrency, formatPercent } from '@/utils/formatters';
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
        <span className="font-semibold text-white">{symbol}</span>
        <span className={clsx('text-xs px-2 py-0.5 rounded', colors.bg, colors.text)}>
          {asset.type}
        </span>
      </div>
      <div className="text-sm text-gray-400 mb-1">{asset.name}</div>
      <div className="text-lg font-bold text-white">{formatCurrency(price)}</div>
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
  );
}
