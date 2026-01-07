import { useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { usePortfolioStore } from '@/store/portfolioStore';
import { useMarketStore } from '@/store/marketStore';
import { formatCurrency, formatPercent, formatNumber } from '@/utils/formatters';
import { INITIAL_CASH, ASSETS } from '@/utils/constants';
import { clsx } from 'clsx';

interface AnalyticsDashboardProps {
  className?: string;
}

export function AnalyticsDashboard({ className }: AnalyticsDashboardProps) {
  const positions = usePortfolioStore((state) => state.positions);
  const cashBalance = usePortfolioStore((state) => state.cashBalance);
  const tradeHistory = usePortfolioStore((state) => state.tradeHistory);
  const prices = useMarketStore((state) => state.prices);

  const analytics = useMemo(() => {
    // Calculate portfolio value
    let portfolioValue = cashBalance;
    let unrealizedPL = 0;

    Object.entries(positions).forEach(([symbol, pos]) => {
      const price = prices[symbol]?.price ?? pos.avgPrice;
      const currentValue = pos.quantity * price;
      portfolioValue += currentValue;
      unrealizedPL += pos.quantity * (price - pos.avgPrice);
    });

    // Calculate P/L
    const totalPL = portfolioValue - INITIAL_CASH;
    const totalPLPercent = (totalPL / INITIAL_CASH) * 100;

    // Trade statistics
    const buyTrades = tradeHistory.filter((t) => t.type === 'buy');
    const sellTrades = tradeHistory.filter((t) => t.type === 'sell');
    const avgTradeSize =
      tradeHistory.length > 0
        ? tradeHistory.reduce((sum, t) => sum + t.total, 0) / tradeHistory.length
        : 0;

    // Realized P/L from sell trades (simplified calculation)
    const realizedPL = sellTrades.reduce((sum, trade) => {
      const buyPrice = positions[trade.symbol]?.avgPrice ?? trade.price;
      return sum + trade.quantity * (trade.price - buyPrice);
    }, 0);

    // Allocation breakdown
    const allocations: Array<{ symbol: string; value: number; percent: number; color: string }> = [];

    Object.entries(positions).forEach(([symbol, pos]) => {
      const value = pos.quantity * (prices[symbol]?.price ?? pos.avgPrice);
      const type = ASSETS[symbol]?.type ?? 'stocks';
      const colors: Record<string, string> = {
        stocks: '#3b82f6',
        commodities: '#f59e0b',
        bonds: '#a855f7',
      };
      allocations.push({
        symbol,
        value,
        percent: (value / portfolioValue) * 100,
        color: colors[type],
      });
    });

    // Add cash to allocations
    allocations.push({
      symbol: 'Cash',
      value: cashBalance,
      percent: (cashBalance / portfolioValue) * 100,
      color: '#6b7280',
    });

    // Sort by value descending
    allocations.sort((a, b) => b.value - a.value);

    // Win rate (simplified - based on sell trades above avg price)
    const winningTrades = sellTrades.filter((trade) => {
      const avgPrice = positions[trade.symbol]?.avgPrice ?? trade.price;
      return trade.price > avgPrice;
    });
    const winRate = sellTrades.length > 0 ? (winningTrades.length / sellTrades.length) * 100 : 0;

    return {
      portfolioValue,
      totalPL,
      totalPLPercent,
      unrealizedPL,
      realizedPL,
      totalTrades: tradeHistory.length,
      buyTrades: buyTrades.length,
      sellTrades: sellTrades.length,
      avgTradeSize,
      allocations,
      winRate,
    };
  }, [positions, cashBalance, prices, tradeHistory]);

  return (
    <Card className={className}>
      <h2 className="text-lg font-semibold mb-4 text-gray-200">Portfolio Analytics</h2>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Portfolio Value"
          value={formatCurrency(analytics.portfolioValue)}
          trend={analytics.totalPL >= 0 ? 'up' : 'down'}
        />
        <MetricCard
          label="Total P/L"
          value={`${formatCurrency(analytics.totalPL)} (${formatPercent(analytics.totalPLPercent)})`}
          trend={analytics.totalPL >= 0 ? 'up' : 'down'}
        />
        <MetricCard
          label="Unrealized P/L"
          value={formatCurrency(analytics.unrealizedPL)}
          trend={analytics.unrealizedPL >= 0 ? 'up' : 'down'}
        />
        <MetricCard
          label="Total Trades"
          value={analytics.totalTrades.toString()}
          subtitle={`${analytics.buyTrades} buys, ${analytics.sellTrades} sells`}
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Allocation Chart */}
        <div className="p-4 bg-gray-700 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Portfolio Allocation</h3>
          {analytics.allocations.length === 0 ? (
            <p className="text-gray-500 text-sm">No positions yet</p>
          ) : (
            <div className="space-y-2">
              {analytics.allocations.slice(0, 5).map((alloc) => (
                <div key={alloc.symbol} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: alloc.color }}
                  />
                  <span className="text-sm text-white flex-1">{alloc.symbol}</span>
                  <span className="text-sm text-gray-400">{formatPercent(alloc.percent)}</span>
                  <span className="text-sm text-gray-300">{formatCurrency(alloc.value)}</span>
                </div>
              ))}

              {/* Visual bar */}
              <div className="h-4 rounded-full overflow-hidden flex mt-3">
                {analytics.allocations.map((alloc) => (
                  <div
                    key={alloc.symbol}
                    style={{
                      width: `${alloc.percent}%`,
                      backgroundColor: alloc.color,
                    }}
                    title={`${alloc.symbol}: ${alloc.percent.toFixed(1)}%`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Trading Stats */}
        <div className="p-4 bg-gray-700 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Trading Statistics</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-400">Win Rate</dt>
              <dd
                className={clsx(
                  analytics.winRate >= 50 ? 'text-emerald-400' : 'text-red-400'
                )}
              >
                {formatNumber(analytics.winRate, 1)}%
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-400">Avg Trade Size</dt>
              <dd className="text-white">{formatCurrency(analytics.avgTradeSize)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-400">Total Volume</dt>
              <dd className="text-white">
                {formatCurrency(
                  tradeHistory.reduce((sum, t) => sum + t.total, 0)
                )}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-400">Cash Available</dt>
              <dd className="text-emerald-400">{formatCurrency(cashBalance)}</dd>
            </div>
          </dl>
        </div>
      </div>
    </Card>
  );
}

// Metric Card subcomponent
interface MetricCardProps {
  label: string;
  value: string;
  trend?: 'up' | 'down';
  subtitle?: string;
}

function MetricCard({ label, value, trend, subtitle }: MetricCardProps) {
  return (
    <div className="p-3 bg-gray-700 rounded-lg">
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div
        className={clsx(
          'text-lg font-bold',
          trend === 'up' && 'text-emerald-400',
          trend === 'down' && 'text-red-400',
          !trend && 'text-white'
        )}
      >
        {value}
      </div>
      {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
    </div>
  );
}
