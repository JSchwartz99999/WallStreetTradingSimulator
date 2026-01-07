import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PriceChart } from './PriceChart';
import { VolumeChart } from './VolumeChart';
import { ChartControls } from './ChartControls';
import { OrderBook } from './OrderBook';
import { MarketNews } from './MarketNews';
import { useUIStore } from '@/store/uiStore';
import { clsx } from 'clsx';
import type { ChartTab } from '@/utils/constants';

interface ChartSectionProps {
  className?: string;
}

const tabs: { value: ChartTab; label: string }[] = [
  { value: 'chart', label: 'Price Chart' },
  { value: 'orderbook', label: 'Order Book' },
  { value: 'news', label: 'Market News' },
];

export function ChartSection({ className }: ChartSectionProps) {
  const chartTab = useUIStore((state) => state.chartTab);
  const setChartTab = useUIStore((state) => state.setChartTab);

  return (
    <Card className={className} aria-labelledby="charts-title">
      <h2 id="charts-title" className="sr-only">Charts and Analysis</h2>

      {/* Tab buttons */}
      <div className="flex flex-wrap gap-2 mb-4" role="tablist" aria-label="Chart view options">
        {tabs.map((tab) => (
          <Button
            key={tab.value}
            variant="secondary"
            size="sm"
            onClick={() => setChartTab(tab.value)}
            role="tab"
            aria-selected={chartTab === tab.value}
            aria-controls={`${tab.value}Content`}
            className={clsx(chartTab === tab.value && 'tab-active')}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Chart Tab */}
      <div
        id="chartContent"
        role="tabpanel"
        aria-labelledby="chartTabBtn"
        className={clsx(chartTab !== 'chart' && 'hidden')}
      >
        <ChartControls />
        <PriceChart />
        <VolumeChart />
      </div>

      {/* Order Book Tab */}
      <div
        id="orderbookContent"
        role="tabpanel"
        aria-labelledby="orderbookTabBtn"
        className={clsx(chartTab !== 'orderbook' && 'hidden')}
      >
        <OrderBook />
      </div>

      {/* News Tab */}
      <div
        id="newsContent"
        role="tabpanel"
        aria-labelledby="newsTabBtn"
        className={clsx(chartTab !== 'news' && 'hidden')}
      >
        <MarketNews />
      </div>
    </Card>
  );
}
