import { Card } from '@/components/ui/Card';
import { usePortfolioStore } from '@/store/portfolioStore';
import { formatCurrency, formatTime } from '@/utils/formatters';
import { clsx } from 'clsx';

interface TradeHistoryProps {
  className?: string;
}

export function TradeHistory({ className }: TradeHistoryProps) {
  const tradeHistory = usePortfolioStore((state) => state.tradeHistory);

  return (
    <Card className={className} aria-labelledby="history-title">
      <h2 id="history-title" className="text-lg font-semibold mb-4 text-gray-200">
        Trade History
      </h2>

      <div className="space-y-2 max-h-80 overflow-y-auto" role="list" aria-label="Trade history">
        {tradeHistory.length === 0 ? (
          <div className="text-center text-gray-500 py-4">No trades yet</div>
        ) : (
          tradeHistory.slice(0, 20).map((trade) => (
            <div key={trade.id} className="p-2 bg-gray-700 rounded text-sm" role="listitem">
              <div className="flex justify-between items-center">
                <span
                  className={clsx(
                    'font-semibold',
                    trade.type === 'buy' ? 'text-emerald-400' : 'text-red-400'
                  )}
                >
                  {trade.type.toUpperCase()}
                </span>
                <span className="text-gray-400 text-xs">
                  {formatTime(trade.timestamp)}
                </span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-white">
                  {trade.symbol} x{trade.quantity}
                </span>
                <span className="text-gray-300">@ {formatCurrency(trade.price)}</span>
              </div>
              <div className="text-right text-gray-400 text-xs mt-1">
                Total: {formatCurrency(trade.total)}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
