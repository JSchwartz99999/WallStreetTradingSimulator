import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useStopLossStore, type StopLossOrder } from '@/store/stopLossStore';
import { usePortfolioStore } from '@/store/portfolioStore';
import { useMarketStore } from '@/store/marketStore';
import { formatCurrency } from '@/utils/formatters';
import { GlossaryTerm } from '@/components/ui/Tooltip';

interface StopLossPanelProps {
  className?: string;
}

export function StopLossPanel({ className }: StopLossPanelProps) {
  const [triggerPrice, setTriggerPrice] = useState('');
  const [quantity, setQuantity] = useState('');

  const orders = useStopLossStore((state) => state.orders);
  const addStopLoss = useStopLossStore((state) => state.addStopLoss);
  const removeStopLoss = useStopLossStore((state) => state.removeStopLoss);

  const selectedSymbol = useMarketStore((state) => state.selectedSymbol);
  const prices = useMarketStore((state) => state.prices);
  const currentPrice = prices[selectedSymbol]?.price ?? 0;

  const positions = usePortfolioStore((state) => state.positions);
  const position = positions[selectedSymbol];
  const ownedShares = position?.quantity ?? 0;

  const handleAddStopLoss = () => {
    const price = parseFloat(triggerPrice);
    const qty = parseInt(quantity);

    if (isNaN(price) || price <= 0 || isNaN(qty) || qty <= 0) return;
    if (qty > ownedShares) return;

    addStopLoss(selectedSymbol, price, qty);
    setTriggerPrice('');
    setQuantity('');
  };

  const activeOrders = orders.filter((o) => !o.triggered);
  const triggeredOrders = orders.filter((o) => o.triggered).slice(0, 5);

  return (
    <Card className={className}>
      <h2 className="text-lg font-semibold mb-4 text-gray-200 flex items-center gap-2">
        <span>🛡️</span> <GlossaryTerm term="Stop-Loss">Stop-Loss Orders</GlossaryTerm>
      </h2>

      {/* Add Stop Loss Form */}
      <div className="mb-4 p-3 bg-gray-700/50 rounded-lg">
        <div className="text-sm text-gray-400 mb-2">
          Set stop-loss for{' '}
          <span className="text-emerald-400 font-semibold">{selectedSymbol}</span>
          {ownedShares > 0 && (
            <span className="text-gray-500 ml-2">(You own: {ownedShares} shares)</span>
          )}
        </div>

        {ownedShares === 0 ? (
          <p className="text-gray-500 text-sm">
            You need to own shares of {selectedSymbol} to set a stop-loss.
          </p>
        ) : (
          <>
            <div className="text-xs text-gray-500 mb-2">
              Current price: {formatCurrency(currentPrice)}
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <Input
                type="number"
                step="0.01"
                min="0.01"
                max={currentPrice}
                value={triggerPrice}
                onChange={(e) => setTriggerPrice(e.target.value)}
                placeholder="Trigger price"
                label="Trigger Price"
              />
              <Input
                type="number"
                min="1"
                max={ownedShares}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Quantity"
                label="Quantity"
              />
            </div>
            <Button
              onClick={handleAddStopLoss}
              disabled={!triggerPrice || !quantity}
              className="w-full"
            >
              Set Stop-Loss
            </Button>
          </>
        )}
      </div>

      {/* Active Orders */}
      {activeOrders.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Active Orders</h3>
          <div className="space-y-2">
            {activeOrders.map((order) => (
              <StopLossItem key={order.id} order={order} onRemove={removeStopLoss} />
            ))}
          </div>
        </div>
      )}

      {/* Triggered Orders */}
      {triggeredOrders.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Recently Triggered</h3>
          <div className="space-y-2 opacity-60">
            {triggeredOrders.map((order) => (
              <StopLossItem key={order.id} order={order} onRemove={removeStopLoss} triggered />
            ))}
          </div>
        </div>
      )}

      {orders.length === 0 && (
        <p className="text-center text-gray-500 py-2">No stop-loss orders</p>
      )}
    </Card>
  );
}

interface StopLossItemProps {
  order: StopLossOrder;
  onRemove: (id: string) => void;
  triggered?: boolean;
}

function StopLossItem({ order, onRemove, triggered }: StopLossItemProps) {
  return (
    <div
      className={`flex items-center justify-between p-2 rounded-lg ${
        triggered ? 'bg-red-900/30' : 'bg-gray-700/50'
      }`}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white">{order.symbol}</span>
          <span className="text-xs text-gray-400">{order.quantity} shares</span>
          {triggered && <span className="text-xs text-red-400">✓ Executed</span>}
        </div>
        <div className="text-sm text-gray-400">
          Trigger @ <span className="text-red-400">{formatCurrency(order.triggerPrice)}</span>
          {order.executedPrice && (
            <span className="ml-2">
              → Sold @ {formatCurrency(order.executedPrice)}
            </span>
          )}
        </div>
      </div>
      {!triggered && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(order.id)}
          aria-label="Remove stop-loss"
        >
          ✕
        </Button>
      )}
    </div>
  );
}
