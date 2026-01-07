import { useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { usePortfolioStore } from '@/store/portfolioStore';
import { useMarketStore } from '@/store/marketStore';
import { formatCurrency, formatPercent } from '@/utils/formatters';
import { INITIAL_CASH } from '@/utils/constants';
import { clsx } from 'clsx';

interface PortfolioSectionProps {
  className?: string;
}

export function PortfolioSection({ className }: PortfolioSectionProps) {
  const positions = usePortfolioStore((state) => state.positions);
  const cashBalance = usePortfolioStore((state) => state.cashBalance);
  const prices = useMarketStore((state) => state.prices);

  const { totalValue, totalPL, totalPLPercent, positionsList } = useMemo(() => {
    let positionsValue = 0;
    const list: Array<{
      symbol: string;
      quantity: number;
      avgPrice: number;
      currentValue: number;
      pl: number;
      plPercent: number;
    }> = [];

    Object.entries(positions).forEach(([symbol, position]) => {
      const currentPrice = prices[symbol]?.price ?? position.avgPrice;
      const currentValue = position.quantity * currentPrice;
      const costBasis = position.quantity * position.avgPrice;
      const pl = currentValue - costBasis;
      const plPercent = costBasis > 0 ? (pl / costBasis) * 100 : 0;

      positionsValue += currentValue;

      list.push({
        symbol,
        quantity: position.quantity,
        avgPrice: position.avgPrice,
        currentValue,
        pl,
        plPercent,
      });
    });

    const total = cashBalance + positionsValue;
    const totalPL = total - INITIAL_CASH;
    const totalPLPercent = (totalPL / INITIAL_CASH) * 100;

    return {
      totalValue: total,
      totalPL,
      totalPLPercent,
      positionsList: list,
    };
  }, [positions, cashBalance, prices]);

  return (
    <Card className={className} aria-labelledby="portfolio-title">
      <h2 id="portfolio-title" className="text-lg font-semibold mb-4 text-gray-200">
        Portfolio
      </h2>

      {/* Summary */}
      <div className="mb-4 p-3 bg-gray-700 rounded-lg">
        <div className="flex justify-between">
          <span className="text-gray-400">Total Value</span>
          <span className={clsx('font-bold', totalPL >= 0 ? 'text-emerald-400' : 'text-red-400')}>
            {formatCurrency(totalValue)}
          </span>
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-gray-400">Total P/L</span>
          <span className={clsx(totalPL >= 0 ? 'text-emerald-400' : 'text-red-400')}>
            {formatCurrency(totalPL)} ({formatPercent(totalPLPercent)})
          </span>
        </div>
      </div>

      {/* Positions */}
      <div className="space-y-2 max-h-60 overflow-y-auto" role="list" aria-label="Current positions">
        {positionsList.length === 0 ? (
          <div className="text-center text-gray-500 py-4">No positions yet</div>
        ) : (
          positionsList.map((position) => (
            <div key={position.symbol} className="p-3 bg-gray-700 rounded-lg" role="listitem">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-semibold text-white">{position.symbol}</span>
                  <span className="text-gray-400 text-sm ml-2">{position.quantity} shares</span>
                </div>
                <span className="text-white font-bold">{formatCurrency(position.currentValue)}</span>
              </div>
              <div className="flex justify-between items-center mt-1 text-sm">
                <span className="text-gray-400">Avg: {formatCurrency(position.avgPrice)}</span>
                <span
                  className={clsx(
                    'flex items-center gap-1',
                    position.pl >= 0 ? 'text-emerald-400' : 'text-red-400'
                  )}
                >
                  <span aria-hidden="true">{position.pl >= 0 ? '▲' : '▼'}</span>
                  {formatCurrency(Math.abs(position.pl))} ({formatPercent(position.plPercent)})
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
