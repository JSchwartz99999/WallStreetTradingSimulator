import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAlertsStore, type PriceAlert } from '@/store/alertsStore';
import { useMarketStore } from '@/store/marketStore';
import { ASSETS } from '@/utils/constants';
import { formatCurrency } from '@/utils/formatters';
import { clsx } from 'clsx';

interface PriceAlertsProps {
  className?: string;
}

export function PriceAlerts({ className }: PriceAlertsProps) {
  const [targetPrice, setTargetPrice] = useState('');
  const [condition, setCondition] = useState<'above' | 'below'>('above');

  const alerts = useAlertsStore((state) => state.alerts);
  const addAlert = useAlertsStore((state) => state.addAlert);
  const removeAlert = useAlertsStore((state) => state.removeAlert);
  const clearTriggeredAlerts = useAlertsStore((state) => state.clearTriggeredAlerts);

  const selectedSymbol = useMarketStore((state) => state.selectedSymbol);
  const prices = useMarketStore((state) => state.prices);
  const currentPrice = prices[selectedSymbol]?.price ?? 0;

  const handleAddAlert = () => {
    const price = parseFloat(targetPrice);
    if (isNaN(price) || price <= 0) return;

    addAlert(selectedSymbol, price, condition);
    setTargetPrice('');
  };

  const activeAlerts = alerts.filter((a) => !a.triggered);
  const triggeredAlerts = alerts.filter((a) => a.triggered);

  return (
    <Card className={className}>
      <h2 className="text-lg font-semibold mb-4 text-gray-200 flex items-center gap-2">
        <span>🔔</span> Price Alerts
      </h2>

      {/* Add Alert Form */}
      <div className="mb-4 p-3 bg-gray-700/50 rounded-lg">
        <div className="text-sm text-gray-400 mb-2">
          Create alert for <span className="text-emerald-400 font-semibold">{selectedSymbol}</span>
          <span className="text-gray-500 ml-2">(Current: {formatCurrency(currentPrice)})</span>
        </div>
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Input
              type="number"
              step="0.01"
              min="0.01"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              placeholder="Target price"
            />
          </div>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value as 'above' | 'below')}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
          >
            <option value="above">Above</option>
            <option value="below">Below</option>
          </select>
          <Button onClick={handleAddAlert} disabled={!targetPrice}>
            Add
          </Button>
        </div>
      </div>

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Active Alerts</h3>
          <div className="space-y-2">
            {activeAlerts.map((alert) => (
              <AlertItem key={alert.id} alert={alert} onRemove={removeAlert} />
            ))}
          </div>
        </div>
      )}

      {/* Triggered Alerts */}
      {triggeredAlerts.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-gray-400">Triggered</h3>
            <Button variant="ghost" size="sm" onClick={clearTriggeredAlerts}>
              Clear
            </Button>
          </div>
          <div className="space-y-2 opacity-60">
            {triggeredAlerts.slice(0, 5).map((alert) => (
              <AlertItem key={alert.id} alert={alert} onRemove={removeAlert} triggered />
            ))}
          </div>
        </div>
      )}

      {alerts.length === 0 && (
        <p className="text-center text-gray-500 py-2">No alerts set</p>
      )}
    </Card>
  );
}

interface AlertItemProps {
  alert: PriceAlert;
  onRemove: (id: string) => void;
  triggered?: boolean;
}

function AlertItem({ alert, onRemove, triggered }: AlertItemProps) {
  const asset = ASSETS[alert.symbol];

  return (
    <div
      className={clsx(
        'flex items-center justify-between p-2 rounded-lg',
        triggered ? 'bg-emerald-900/30' : 'bg-gray-700/50'
      )}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white">{alert.symbol}</span>
          <span className="text-xs text-gray-400">{asset?.name}</span>
          {triggered && <span className="text-xs text-emerald-400">✓ Triggered</span>}
        </div>
        <div className="text-sm text-gray-400">
          {alert.condition === 'above' ? '↑ Above' : '↓ Below'}{' '}
          <span className="text-white">{formatCurrency(alert.targetPrice)}</span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(alert.id)}
        aria-label="Remove alert"
      >
        ✕
      </Button>
    </div>
  );
}
