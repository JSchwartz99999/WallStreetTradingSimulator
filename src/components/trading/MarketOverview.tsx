import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AssetCard } from './AssetCard';
import { useMarketStore } from '@/store/marketStore';
import { useUIStore } from '@/store/uiStore';
import { ASSETS, type AssetFilter } from '@/utils/constants';

interface MarketOverviewProps {
  className?: string;
}

const filters: { value: AssetFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'stocks', label: 'Stocks' },
  { value: 'commodities', label: 'Commodities' },
  { value: 'bonds', label: 'Bonds' },
];

export function MarketOverview({ className }: MarketOverviewProps) {
  const prices = useMarketStore((state) => state.prices);
  const selectedSymbol = useMarketStore((state) => state.selectedSymbol);
  const selectSymbol = useMarketStore((state) => state.selectSymbol);

  const assetFilter = useUIStore((state) => state.assetFilter);
  const setAssetFilter = useUIStore((state) => state.setAssetFilter);

  // Filter assets based on current filter
  const filteredAssets = Object.entries(ASSETS).filter(([, asset]) => {
    return assetFilter === 'all' || asset.type === assetFilter;
  });

  return (
    <Card className={className} aria-labelledby="market-overview-title">
      <h2 id="market-overview-title" className="text-lg font-semibold mb-4 text-gray-200">
        Market Overview
      </h2>

      {/* Filter buttons */}
      <div className="flex flex-wrap gap-2 mb-4" role="tablist" aria-label="Filter assets by type">
        {filters.map((filter) => (
          <Button
            key={filter.value}
            variant={assetFilter === filter.value ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setAssetFilter(filter.value)}
            role="tab"
            aria-selected={assetFilter === filter.value}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {/* Asset grid */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto"
        role="listbox"
        aria-label="Available assets"
      >
        {filteredAssets.map(([symbol, asset]) => {
          const priceData = prices[symbol] ?? { price: 0, change: 0, changePercent: 0 };

          return (
            <AssetCard
              key={symbol}
              symbol={symbol}
              asset={asset}
              price={priceData.price}
              change={priceData.change}
              changePercent={priceData.changePercent}
              isSelected={selectedSymbol === symbol}
              onSelect={selectSymbol}
            />
          );
        })}
      </div>
    </Card>
  );
}
