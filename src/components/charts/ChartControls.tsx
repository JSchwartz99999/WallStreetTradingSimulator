import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/store/uiStore';
import { TIMEFRAMES } from '@/utils/constants';

export function ChartControls() {
  const timeframe = useUIStore((state) => state.timeframe);
  const setTimeframe = useUIStore((state) => state.setTimeframe);

  return (
    <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="Chart timeframe">
      {TIMEFRAMES.map((tf) => (
        <Button
          key={tf}
          variant={timeframe === tf ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setTimeframe(tf)}
        >
          {tf}
        </Button>
      ))}
    </div>
  );
}
