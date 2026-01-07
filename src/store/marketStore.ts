import { create } from 'zustand';
import { FALLBACK_PRICES } from '@/utils/constants';
import type { AssetPrice } from './types';

const MAX_PRICE_HISTORY = 20;

interface MarketState {
  prices: Record<string, AssetPrice>;
  priceHistory: Record<string, number[]>;
  selectedSymbol: string;
  isSimulated: boolean;
  isConnected: boolean;

  // Actions
  setPrice: (
    symbol: string,
    price: number,
    change: number,
    changePercent: number
  ) => void;
  updatePriceFromWebSocket: (symbol: string, price: number) => void;
  selectSymbol: (symbol: string) => void;
  setSimulated: (isSimulated: boolean) => void;
  setConnected: (isConnected: boolean) => void;
  initializeFallbackPrices: () => void;
  simulatePriceMovement: () => void;
  getPriceHistory: (symbol: string) => number[];
}

export const useMarketStore = create<MarketState>((set, get) => ({
  prices: {},
  priceHistory: {},
  selectedSymbol: 'AAPL',
  isSimulated: true,
  isConnected: false,

  setPrice: (symbol, price, change, changePercent) => {
    set((state) => {
      const history = state.priceHistory[symbol] ?? [];
      const newHistory = [...history, price].slice(-MAX_PRICE_HISTORY);

      return {
        prices: {
          ...state.prices,
          [symbol]: {
            price,
            change,
            changePercent,
            lastUpdated: Date.now(),
          },
        },
        priceHistory: {
          ...state.priceHistory,
          [symbol]: newHistory,
        },
      };
    });
  },

  updatePriceFromWebSocket: (symbol, newPrice) => {
    set((state) => {
      const existing = state.prices[symbol];
      const previousPrice = existing?.price ?? newPrice;
      const change = newPrice - previousPrice;
      const changePercent = previousPrice > 0 ? (change / previousPrice) * 100 : 0;

      const history = state.priceHistory[symbol] ?? [];
      const newHistory = [...history, newPrice].slice(-MAX_PRICE_HISTORY);

      return {
        prices: {
          ...state.prices,
          [symbol]: {
            ...existing,
            price: newPrice,
            change,
            changePercent,
            lastUpdated: Date.now(),
          },
        },
        priceHistory: {
          ...state.priceHistory,
          [symbol]: newHistory,
        },
      };
    });
  },

  selectSymbol: (symbol) => set({ selectedSymbol: symbol }),

  setSimulated: (isSimulated) => set({ isSimulated }),

  setConnected: (isConnected) => set({ isConnected }),

  initializeFallbackPrices: () => {
    const prices: Record<string, AssetPrice> = {};
    const priceHistory: Record<string, number[]> = {};

    Object.entries(FALLBACK_PRICES).forEach(([symbol, data]) => {
      const changePercent = data.price > 0 ? (data.change / data.price) * 100 : 0;
      prices[symbol] = {
        price: data.price,
        change: data.change,
        changePercent,
        lastUpdated: Date.now(),
      };
      // Initialize with some historical data points
      const basePrice = data.price;
      priceHistory[symbol] = Array.from({ length: 10 }, (_, i) => {
        const variation = (Math.random() - 0.5) * 0.02 * basePrice;
        return basePrice + variation * (i / 10);
      });
      priceHistory[symbol].push(data.price);
    });

    set({ prices, priceHistory, isSimulated: true });
  },

  simulatePriceMovement: () => {
    const state = get();
    if (!state.isSimulated) return;

    const newPrices: Record<string, AssetPrice> = {};
    const newHistory: Record<string, number[]> = {};

    Object.entries(state.prices).forEach(([symbol, asset]) => {
      // Random change between -0.25% and +0.25%
      const changePercent = (Math.random() - 0.5) * 0.5;
      const priceChange = asset.price * (changePercent / 100);
      const newPrice = Math.max(0.01, asset.price + priceChange);

      newPrices[symbol] = {
        ...asset,
        price: newPrice,
        change: priceChange,
        changePercent,
        lastUpdated: Date.now(),
      };

      const history = state.priceHistory[symbol] ?? [];
      newHistory[symbol] = [...history, newPrice].slice(-MAX_PRICE_HISTORY);
    });

    set({ prices: newPrices, priceHistory: newHistory });
  },

  getPriceHistory: (symbol) => {
    return get().priceHistory[symbol] ?? [];
  },
}));
