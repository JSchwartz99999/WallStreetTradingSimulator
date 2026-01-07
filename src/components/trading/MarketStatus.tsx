import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { formatPercent } from '@/utils/formatters';
import { clsx } from 'clsx';

interface MarketStatusProps {
  className?: string;
}

export function MarketStatus({ className }: MarketStatusProps) {
  const [indices, setIndices] = useState({
    sp500: 1.24,
    nasdaq: 1.56,
    dow: -0.32,
    vix: 16.42,
  });

  // Simulate market index movements
  useEffect(() => {
    const interval = setInterval(() => {
      setIndices({
        sp500: (Math.random() - 0.3) * 2,
        nasdaq: (Math.random() - 0.3) * 2.5,
        dow: (Math.random() - 0.5) * 1.5,
        vix: 15 + Math.random() * 5,
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Check if market is open (simplified - just checks weekday and hours)
  const isMarketOpen = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();

    // Weekday between 9:30 AM and 4:00 PM ET (simplified)
    const isWeekday = day >= 1 && day <= 5;
    const isDuringHours = hour >= 9 && hour < 16;

    return isWeekday && isDuringHours;
  }, []);

  // Simulated volume
  const volume = useMemo(() => {
    return `${(2 + Math.random() * 2).toFixed(1)}B`;
  }, []);

  return (
    <Card className={className} aria-labelledby="market-status-title">
      <h2 id="market-status-title" className="text-lg font-semibold mb-4 text-gray-200">
        Market Status
      </h2>

      <dl className="space-y-3 sm:space-y-4">
        <div className="flex justify-between items-center">
          <dt className="text-gray-400">Market Hours</dt>
          <dd className={clsx('font-semibold', isMarketOpen ? 'text-emerald-400' : 'text-red-400')}>
            {isMarketOpen ? 'Open' : 'Closed'}
          </dd>
        </div>

        <div className="flex justify-between items-center">
          <dt className="text-gray-400">S&P 500</dt>
          <dd className={clsx(indices.sp500 >= 0 ? 'text-emerald-400' : 'text-red-400')}>
            {formatPercent(indices.sp500)}
          </dd>
        </div>

        <div className="flex justify-between items-center">
          <dt className="text-gray-400">NASDAQ</dt>
          <dd className={clsx(indices.nasdaq >= 0 ? 'text-emerald-400' : 'text-red-400')}>
            {formatPercent(indices.nasdaq)}
          </dd>
        </div>

        <div className="flex justify-between items-center">
          <dt className="text-gray-400">DOW</dt>
          <dd className={clsx(indices.dow >= 0 ? 'text-emerald-400' : 'text-red-400')}>
            {formatPercent(indices.dow)}
          </dd>
        </div>

        <div className="flex justify-between items-center">
          <dt className="text-gray-400">VIX</dt>
          <dd className="text-yellow-400">{indices.vix.toFixed(2)}</dd>
        </div>

        <div className="flex justify-between items-center">
          <dt className="text-gray-400">Volume</dt>
          <dd className="text-gray-200">{volume}</dd>
        </div>
      </dl>
    </Card>
  );
}
