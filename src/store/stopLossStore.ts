import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { generateId } from '@/utils/security';

export interface StopLossOrder {
  id: string;
  symbol: string;
  triggerPrice: number;
  quantity: number;
  createdAt: number;
  triggered: boolean;
  triggeredAt?: number;
  executedPrice?: number;
}

interface StopLossState {
  orders: StopLossOrder[];

  // Actions
  addStopLoss: (symbol: string, triggerPrice: number, quantity: number) => void;
  removeStopLoss: (id: string) => void;
  triggerStopLoss: (id: string, executedPrice: number) => void;
  getActiveOrders: () => StopLossOrder[];
  getOrdersForSymbol: (symbol: string) => StopLossOrder[];
  checkStopLosses: (
    prices: Record<string, { price: number }>,
    positions: Record<string, { quantity: number }>
  ) => StopLossOrder[];
}

export const useStopLossStore = create<StopLossState>()(
  persist(
    (set, get) => ({
      orders: [],

      addStopLoss: (symbol, triggerPrice, quantity) => {
        const newOrder: StopLossOrder = {
          id: generateId(),
          symbol,
          triggerPrice,
          quantity,
          createdAt: Date.now(),
          triggered: false,
        };
        set((state) => ({
          orders: [...state.orders, newOrder],
        }));
      },

      removeStopLoss: (id) => {
        set((state) => ({
          orders: state.orders.filter((o) => o.id !== id),
        }));
      },

      triggerStopLoss: (id, executedPrice) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id
              ? { ...o, triggered: true, triggeredAt: Date.now(), executedPrice }
              : o
          ),
        }));
      },

      getActiveOrders: () => {
        return get().orders.filter((o) => !o.triggered);
      },

      getOrdersForSymbol: (symbol) => {
        return get().orders.filter((o) => o.symbol === symbol && !o.triggered);
      },

      checkStopLosses: (prices, positions) => {
        const state = get();
        const triggered: StopLossOrder[] = [];

        state.orders.forEach((order) => {
          if (order.triggered) return;

          const priceData = prices[order.symbol];
          const position = positions[order.symbol];

          if (!priceData || !position) return;

          const currentPrice = priceData.price;

          // Stop loss triggers when price falls below trigger price
          if (currentPrice <= order.triggerPrice) {
            // Only trigger if we still have enough shares
            if (position.quantity >= order.quantity) {
              triggered.push(order);
            }
          }
        });

        return triggered;
      },
    }),
    {
      name: 'wall-street-stop-loss',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
