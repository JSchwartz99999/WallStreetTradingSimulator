import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { generateId } from '@/utils/security';
import { INITIAL_CASH } from '@/utils/constants';
import type { Position, Trade } from './types';

export interface Portfolio {
  id: string;
  name: string;
  cashBalance: number;
  positions: Record<string, Position>;
  tradeHistory: Trade[];
  createdAt: number;
}

interface MultiPortfolioState {
  portfolios: Portfolio[];
  activePortfolioId: string | null;

  // Actions
  createPortfolio: (name: string) => string;
  deletePortfolio: (id: string) => void;
  renamePortfolio: (id: string, name: string) => void;
  setActivePortfolio: (id: string) => void;
  getActivePortfolio: () => Portfolio | null;
  executeTrade: (
    type: 'buy' | 'sell',
    symbol: string,
    quantity: number,
    price: number
  ) => boolean;
  resetActivePortfolio: () => void;
}

const createNewPortfolio = (name: string): Portfolio => ({
  id: generateId(),
  name,
  cashBalance: INITIAL_CASH,
  positions: {},
  tradeHistory: [],
  createdAt: Date.now(),
});

export const useMultiPortfolioStore = create<MultiPortfolioState>()(
  persist(
    (set, get) => ({
      portfolios: [],
      activePortfolioId: null,

      createPortfolio: (name) => {
        const newPortfolio = createNewPortfolio(name);
        set((state) => ({
          portfolios: [...state.portfolios, newPortfolio],
          activePortfolioId: state.activePortfolioId ?? newPortfolio.id,
        }));
        return newPortfolio.id;
      },

      deletePortfolio: (id) => {
        set((state) => {
          const newPortfolios = state.portfolios.filter((p) => p.id !== id);
          const newActiveId =
            state.activePortfolioId === id
              ? newPortfolios[0]?.id ?? null
              : state.activePortfolioId;
          return {
            portfolios: newPortfolios,
            activePortfolioId: newActiveId,
          };
        });
      },

      renamePortfolio: (id, name) => {
        set((state) => ({
          portfolios: state.portfolios.map((p) =>
            p.id === id ? { ...p, name } : p
          ),
        }));
      },

      setActivePortfolio: (id) => {
        set({ activePortfolioId: id });
      },

      getActivePortfolio: () => {
        const state = get();
        return (
          state.portfolios.find((p) => p.id === state.activePortfolioId) ?? null
        );
      },

      executeTrade: (type, symbol, quantity, price) => {
        const state = get();
        const portfolio = state.getActivePortfolio();
        if (!portfolio) return false;

        const total = quantity * price;

        if (type === 'buy') {
          if (total > portfolio.cashBalance) return false;

          set((state) => ({
            portfolios: state.portfolios.map((p) => {
              if (p.id !== state.activePortfolioId) return p;

              const existing = p.positions[symbol];
              const newQuantity = (existing?.quantity || 0) + quantity;
              const existingCost = existing
                ? existing.quantity * existing.avgPrice
                : 0;
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
                ...p,
                cashBalance: p.cashBalance - total,
                positions: {
                  ...p.positions,
                  [symbol]: {
                    symbol,
                    quantity: newQuantity,
                    avgPrice: newAvgPrice,
                  },
                },
                tradeHistory: [newTrade, ...p.tradeHistory.slice(0, 99)],
              };
            }),
          }));

          return true;
        } else {
          const position = portfolio.positions[symbol];
          if (!position || position.quantity < quantity) return false;

          set((state) => ({
            portfolios: state.portfolios.map((p) => {
              if (p.id !== state.activePortfolioId) return p;

              const newQuantity = p.positions[symbol].quantity - quantity;
              const newPositions = { ...p.positions };

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
                ...p,
                cashBalance: p.cashBalance + total,
                positions: newPositions,
                tradeHistory: [newTrade, ...p.tradeHistory.slice(0, 99)],
              };
            }),
          }));

          return true;
        }
      },

      resetActivePortfolio: () => {
        set((state) => ({
          portfolios: state.portfolios.map((p) =>
            p.id === state.activePortfolioId
              ? {
                  ...p,
                  cashBalance: INITIAL_CASH,
                  positions: {},
                  tradeHistory: [],
                }
              : p
          ),
        }));
      },
    }),
    {
      name: 'wall-street-multi-portfolio',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
