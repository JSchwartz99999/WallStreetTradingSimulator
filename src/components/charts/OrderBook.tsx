import { useMemo } from 'react';
import { useMarketStore } from '@/store/marketStore';
import { formatCurrency } from '@/utils/formatters';

export function OrderBook() {
  const selectedSymbol = useMarketStore((state) => state.selectedSymbol);
  const prices = useMarketStore((state) => state.prices);
  const basePrice = prices[selectedSymbol]?.price ?? 100;

  // Generate simulated order book data
  const { bids, asks } = useMemo(() => {
    const bids = [];
    const asks = [];

    for (let i = 0; i < 8; i++) {
      const bidPrice = basePrice - (i + 1) * 0.05;
      const bidSize = Math.floor(Math.random() * 500) + 100;
      bids.push({ price: bidPrice, size: bidSize });

      const askPrice = basePrice + (i + 1) * 0.05;
      const askSize = Math.floor(Math.random() * 500) + 100;
      asks.push({ price: askPrice, size: askSize });
    }

    return { bids, asks };
  }, [basePrice]);

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <h3 className="text-red-400 font-semibold mb-2">Bids (Buy Orders)</h3>
        <div className="space-y-1 text-sm" role="list" aria-label="Buy orders">
          {bids.map((bid, i) => (
            <div key={i} className="flex justify-between text-red-400" role="listitem">
              <span>{formatCurrency(bid.price)}</span>
              <span>{bid.size}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-emerald-400 font-semibold mb-2">Asks (Sell Orders)</h3>
        <div className="space-y-1 text-sm" role="list" aria-label="Sell orders">
          {asks.map((ask, i) => (
            <div key={i} className="flex justify-between text-emerald-400" role="listitem">
              <span>{formatCurrency(ask.price)}</span>
              <span>{ask.size}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
