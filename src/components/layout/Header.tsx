import { useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { usePortfolioStore } from '@/store/portfolioStore';
import { useMarketStore } from '@/store/marketStore';
import { formatCurrency } from '@/utils/formatters';
import { INITIAL_CASH } from '@/utils/constants';
import { useConnectionStatus } from '@/hooks/useWebSocket';
import { clsx } from 'clsx';

export function Header() {
  const cashBalance = usePortfolioStore((state) => state.cashBalance);
  const positions = usePortfolioStore((state) => state.positions);
  const resetPortfolio = usePortfolioStore((state) => state.resetPortfolio);
  const prices = useMarketStore((state) => state.prices);
  const { isConnected, isSimulated } = useConnectionStatus();

  const { portfolioValue, dayPL, dayPLPercent } = useMemo(() => {
    let positionsValue = 0;

    Object.entries(positions).forEach(([symbol, position]) => {
      const price = prices[symbol]?.price ?? position.avgPrice;
      positionsValue += position.quantity * price;
    });

    const total = cashBalance + positionsValue;
    const pl = total - INITIAL_CASH;
    const plPercent = (pl / INITIAL_CASH) * 100;

    return {
      portfolioValue: total,
      dayPL: pl,
      dayPLPercent: plPercent,
    };
  }, [cashBalance, positions, prices]);

  const handleReset = () => {
    if (confirm('Are you sure you want to reset your portfolio? This will clear all positions and trade history.')) {
      resetPortfolio();
    }
  };

  return (
    <Card className="mb-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          <h1 className="text-xl sm:text-2xl font-bold text-emerald-400">
            Wall Street Trading Simulator
          </h1>
          <span
            className={clsx(
              'flex items-center gap-2 text-sm',
              isConnected ? 'text-emerald-400' : isSimulated ? 'text-yellow-400' : 'text-red-400'
            )}
            role="status"
            aria-live="polite"
          >
            <span
              className={clsx(
                'w-2 h-2 rounded-full pulse',
                isConnected ? 'bg-emerald-500' : isSimulated ? 'bg-yellow-500' : 'bg-red-500'
              )}
              aria-hidden="true"
            />
            <span>
              {isConnected ? 'LIVE' : isSimulated ? 'SIMULATED' : 'OFFLINE'}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 flex-wrap w-full sm:w-auto">
          <div className="text-left sm:text-right">
            <div className="text-xs sm:text-sm text-gray-400">Portfolio Value</div>
            <div
              className={clsx(
                'text-lg sm:text-xl font-bold',
                portfolioValue >= INITIAL_CASH ? 'text-emerald-400' : 'text-red-400'
              )}
              aria-label={`Portfolio value: ${formatCurrency(portfolioValue)}`}
            >
              {formatCurrency(portfolioValue)}
            </div>
          </div>

          <div className="text-left sm:text-right">
            <div className="text-xs sm:text-sm text-gray-400">Cash Balance</div>
            <div
              className="text-lg sm:text-xl font-bold text-emerald-400"
              aria-label={`Cash balance: ${formatCurrency(cashBalance)}`}
            >
              {formatCurrency(cashBalance)}
            </div>
          </div>

          <div className="text-left sm:text-right">
            <div className="text-xs sm:text-sm text-gray-400">Day's P/L</div>
            <div
              className={clsx(
                'text-lg sm:text-xl font-bold',
                dayPL >= 0 ? 'text-emerald-400' : 'text-red-400'
              )}
              aria-label={`Day's profit and loss: ${formatCurrency(dayPL)}`}
            >
              {formatCurrency(dayPL)} ({dayPLPercent >= 0 ? '+' : ''}{dayPLPercent.toFixed(2)}%)
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleReset}
            aria-label="Reset portfolio to starting balance"
          >
            Reset
          </Button>
        </div>
      </div>
    </Card>
  );
}
