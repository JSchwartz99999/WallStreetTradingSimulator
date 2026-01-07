import { useState, useCallback, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { usePortfolioStore } from '@/store/portfolioStore';
import { useMarketStore } from '@/store/marketStore';
import { useUIStore } from '@/store/uiStore';
import { useAnnouncer } from '@/hooks/useAnnouncer';
import { formatCurrency } from '@/utils/formatters';
import { validateQuantity, validatePrice } from '@/utils/validators';
import { tradeRateLimiter } from '@/utils/security';
import { ASSETS } from '@/utils/constants';

interface TradingPanelProps {
  className?: string;
}

export function TradingPanel({ className }: TradingPanelProps) {
  const [quantity, setQuantity] = useState(1);
  const [limitPrice, setLimitPrice] = useState<string>('');

  const selectedSymbol = useMarketStore((state) => state.selectedSymbol);
  const prices = useMarketStore((state) => state.prices);
  const currentPrice = prices[selectedSymbol]?.price ?? 0;

  const cashBalance = usePortfolioStore((state) => state.cashBalance);
  const positions = usePortfolioStore((state) => state.positions);
  const executeTrade = usePortfolioStore((state) => state.executeTrade);

  const orderType = useUIStore((state) => state.orderType);
  const setOrderType = useUIStore((state) => state.setOrderType);
  const showToast = useUIStore((state) => state.showToast);

  const { announce } = useAnnouncer();

  const asset = ASSETS[selectedSymbol];
  const position = positions[selectedSymbol];

  const price = useMemo(() => {
    if (orderType === 'limit' && limitPrice) {
      return parseFloat(limitPrice) || currentPrice;
    }
    return currentPrice;
  }, [orderType, limitPrice, currentPrice]);

  const estimatedTotal = quantity * price;
  const maxShares = price > 0 ? Math.floor(cashBalance / price) : 0;

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setQuantity(Math.max(0, Math.min(100000, value)));
  };

  const handleLimitPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLimitPrice(e.target.value);
  };

  const handleTrade = useCallback((type: 'buy' | 'sell') => {
    // Rate limiting check
    if (!tradeRateLimiter.check('trade')) {
      showToast('Too many trades. Please wait a moment.', 'error');
      return;
    }

    if (!validateQuantity(quantity)) {
      showToast('Please enter a valid quantity (1-100,000)', 'error');
      return;
    }

    if (orderType === 'limit' && !validatePrice(limitPrice)) {
      showToast('Please enter a valid limit price', 'error');
      return;
    }

    const success = executeTrade(type, selectedSymbol, quantity, price);

    if (success) {
      showToast(
        `${type === 'buy' ? 'Bought' : 'Sold'} ${quantity} shares of ${selectedSymbol}`,
        'success'
      );
      announce(
        `Successfully ${type === 'buy' ? 'bought' : 'sold'} ${quantity} shares of ${selectedSymbol} at ${formatCurrency(price)} each`
      );
      setQuantity(1);
    } else {
      showToast(
        type === 'buy' ? 'Insufficient funds' : 'Insufficient shares',
        'error'
      );
    }
  }, [quantity, limitPrice, price, selectedSymbol, orderType, executeTrade, showToast, announce]);

  return (
    <Card className={className} aria-labelledby="trading-title">
      <h2 id="trading-title" className="text-lg font-semibold mb-4 text-gray-200">
        Trade
      </h2>

      {/* Selected Asset Info */}
      <div className="mb-4 p-3 bg-gray-700 rounded-lg">
        <div className="text-sm text-gray-400">Selected Asset</div>
        <div className="text-xl font-bold text-emerald-400">{selectedSymbol}</div>
        <div className="text-sm text-gray-400">{asset?.name}</div>
        <div className="text-lg">{formatCurrency(currentPrice)}</div>
        {position && (
          <div className="text-sm text-gray-400 mt-1">
            You own: {position.quantity} shares
          </div>
        )}
      </div>

      {/* Order Type Selection */}
      <div className="flex gap-2 mb-3" role="group" aria-label="Order type selection">
        <Button
          variant={orderType === 'market' ? 'primary' : 'secondary'}
          onClick={() => setOrderType('market')}
          aria-pressed={orderType === 'market'}
          className="flex-1"
        >
          Market
        </Button>
        <Button
          variant={orderType === 'limit' ? 'primary' : 'secondary'}
          onClick={() => setOrderType('limit')}
          aria-pressed={orderType === 'limit'}
          className="flex-1"
        >
          Limit
        </Button>
      </div>

      {/* Order Form */}
      <div className="space-y-3 mb-4">
        <Input
          label="Quantity"
          type="number"
          min={1}
          max={100000}
          value={quantity}
          onChange={handleQuantityChange}
          aria-describedby="maxSharesHint"
        />

        {orderType === 'limit' && (
          <Input
            label="Limit Price"
            type="number"
            step={0.01}
            min={0.01}
            value={limitPrice || currentPrice.toFixed(2)}
            onChange={handleLimitPriceChange}
          />
        )}

        <div className="text-sm text-gray-400">
          Estimated Total:{' '}
          <span className="text-white font-semibold">
            {formatCurrency(estimatedTotal)}
          </span>
        </div>

        <div id="maxSharesHint" className="text-sm text-gray-400">
          Max Shares: <span className="text-white">{maxShares.toLocaleString()}</span>
        </div>
      </div>

      {/* Buy/Sell Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="success"
          size="lg"
          onClick={() => handleTrade('buy')}
          aria-label="Buy selected asset"
          className="glow-green"
        >
          BUY
        </Button>
        <Button
          variant="danger"
          size="lg"
          onClick={() => handleTrade('sell')}
          aria-label="Sell selected asset"
          className="glow-red"
        >
          SELL
        </Button>
      </div>
    </Card>
  );
}
