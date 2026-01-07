import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { INITIAL_CASH, STORAGE_KEY, STORAGE_VERSION } from '@/utils/constants';
import { generateId } from '@/utils/security';
import type { Position, Trade } from './types';

interface PortfolioState {
  version: string;
  cashBalance: number;
  positions: Record<string, Position>;
  tradeHistory: Trade[];

  // Actions
  executeTrade: (
    type: 'buy' | 'sell',
    symbol: string,
    quantity: number,
    price: number
  ) => boolean;
  resetPortfolio: () => void;
  getPositionValue: (symbol: string, currentPrice: number) => number;
  getTotalPositionsValue: (prices: Record<string, number>) => number;
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set, get) => ({
      version: STORAGE_VERSION,
      cashBalance: INITIAL_CASH,
      positions: {},
      tradeHistory: [],

      executeTrade: (type, symbol, quantity, price) => {
        const state = get();
        const total = quantity * price;

        if (type === 'buy') {
          // Check if we have enough cash
          if (total > state.cashBalance) {
            return false;
          }

          set((state) => {
            const existing = state.positions[symbol];
            const newQuantity = (existing?.quantity || 0) + quantity;
            const existingCost = existing ? existing.quantity * existing.avgPrice : 0;
            const newAvgPrice = (existingCost + total) / newQuantity;

            const newTrade: Trade = {
              id: generateId(),
              type: 'buy',
              symbol,
              quantity,
              price,
              total,
              timestamp: Date.now(),
            };

            return {
              cashBalance: state.cashBalance - total,
              positions: {
                ...state.positions,
                [symbol]: {
                  symbol,
                  quantity: newQuantity,
                  avgPrice: newAvgPrice,
                },
              },
              tradeHistory: [newTrade, ...state.tradeHistory.slice(0, 99)],
            };
          });

          return true;
        } else {
          // Sell
          const position = state.positions[symbol];

          // Check if we have enough shares
          if (!position || position.quantity < quantity) {
            return false;
          }

          set((state) => {
            const newQuantity = state.positions[symbol].quantity - quantity;
            const newPositions = { ...state.positions };

            if (newQuantity === 0) {
              delete newPositions[symbol];
            } else {
              newPositions[symbol] = {
                ...newPositions[symbol],
                quantity: newQuantity,
              };
            }

            const newTrade: Trade = {
              id: generateId(),
              type: 'sell',
              symbol,
              quantity,
              price,
              total,
              timestamp: Date.now(),
            };

            return {
              cashBalance: state.cashBalance + total,
              positions: newPositions,
              tradeHistory: [newTrade, ...state.tradeHistory.slice(0, 99)],
            };
          });

          return true;
        }
      },

      resetPortfolio: () =>
        set({
          cashBalance: INITIAL_CASH,
          positions: {},
          tradeHistory: [],
        }),

      getPositionValue: (symbol, currentPrice) => {
        const position = get().positions[symbol];
        return position ? position.quantity * currentPrice : 0;
      },

      getTotalPositionsValue: (prices) => {
        const positions = get().positions;
        return Object.entries(positions).reduce((total, [symbol, position]) => {
          const price = prices[symbol] ?? position.avgPrice;
          return total + position.quantity * price;
        }, 0);
      },
    }),
    {
      name: STORAGE_KEY,
      version: 2,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState, version) => {
        // Handle migration from v1 to v2
        if (version < 2) {
          const oldState = persistedState as Record<string, unknown>;
          return {
            version: STORAGE_VERSION,
            cashBalance: (oldState.cashBalance as number) ?? INITIAL_CASH,
            positions: (oldState.positions as Record<string, Position>) ?? {},
            tradeHistory: (oldState.tradeHistory as Trade[]) ?? [],
          };
        }
        return persistedState as PortfolioState;
      },
    }
  )
);
