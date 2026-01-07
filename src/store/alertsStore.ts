import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { generateId } from '@/utils/security';

export interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  triggered: boolean;
  createdAt: number;
  triggeredAt?: number;
}

interface AlertsState {
  alerts: PriceAlert[];

  // Actions
  addAlert: (symbol: string, targetPrice: number, condition: 'above' | 'below') => void;
  removeAlert: (id: string) => void;
  triggerAlert: (id: string) => void;
  clearTriggeredAlerts: () => void;
  getActiveAlerts: () => PriceAlert[];
  checkAlerts: (prices: Record<string, { price: number }>) => PriceAlert[];
}

export const useAlertsStore = create<AlertsState>()(
  persist(
    (set, get) => ({
      alerts: [],

      addAlert: (symbol, targetPrice, condition) => {
        const newAlert: PriceAlert = {
          id: generateId(),
          symbol,
          targetPrice,
          condition,
          triggered: false,
          createdAt: Date.now(),
        };
        set((state) => ({
          alerts: [...state.alerts, newAlert],
        }));
      },

      removeAlert: (id) => {
        set((state) => ({
          alerts: state.alerts.filter((a) => a.id !== id),
        }));
      },

      triggerAlert: (id) => {
        set((state) => ({
          alerts: state.alerts.map((a) =>
            a.id === id ? { ...a, triggered: true, triggeredAt: Date.now() } : a
          ),
        }));
      },

      clearTriggeredAlerts: () => {
        set((state) => ({
          alerts: state.alerts.filter((a) => !a.triggered),
        }));
      },

      getActiveAlerts: () => {
        return get().alerts.filter((a) => !a.triggered);
      },

      checkAlerts: (prices) => {
        const state = get();
        const triggered: PriceAlert[] = [];

        state.alerts.forEach((alert) => {
          if (alert.triggered) return;

          const priceData = prices[alert.symbol];
          if (!priceData) return;

          const currentPrice = priceData.price;
          const shouldTrigger =
            (alert.condition === 'above' && currentPrice >= alert.targetPrice) ||
            (alert.condition === 'below' && currentPrice <= alert.targetPrice);

          if (shouldTrigger) {
            triggered.push(alert);
            get().triggerAlert(alert.id);
          }
        });

        return triggered;
      },
    }),
    {
      name: 'wall-street-alerts',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
