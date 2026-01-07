import { create } from 'zustand';
import { FALLBACK_PRICES } from '@/utils/constants';
import type { AssetPrice } from './types';

interface MarketState {
  prices: Record<string, AssetPrice>;
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
}

export const useMarketStore = create<MarketState>((set, get) => ({
  prices: {},
  selectedSymbol: 'AAPL',
  isSimulated: true,
  isConnected: false,

  setPrice: (symbol, price, change, changePercent) => {
    set((state) => ({
      prices: {
        ...state.prices,
        [symbol]: {
          price,
          change,
          changePercent,
          lastUpdated: Date.now(),
        },
      },
    }));
  },

  updatePriceFromWebSocket: (symbol, newPrice) => {
    set((state) => {
      const existing = state.prices[symbol];
      const previousPrice = existing?.price ?? newPrice;
      const change = newPrice - previousPrice;
      const changePercent = previousPrice > 0 ? (change / previousPrice) * 100 : 0;

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
      };
    });
  },

  selectSymbol: (symbol) => set({ selectedSymbol: symbol }),

  setSimulated: (isSimulated) => set({ isSimulated }),

  setConnected: (isConnected) => set({ isConnected }),

  initializeFallbackPrices: () => {
    const prices: Record<string, AssetPrice> = {};

    Object.entries(FALLBACK_PRICES).forEach(([symbol, data]) => {
      const changePercent = data.price > 0 ? (data.change / data.price) * 100 : 0;
      prices[symbol] = {
        price: data.price,
        change: data.change,
        changePercent,
        lastUpdated: Date.now(),
      };
    });

    set({ prices, isSimulated: true });
  },

  simulatePriceMovement: () => {
    const state = get();
    if (!state.isSimulated) return;

    const newPrices: Record<string, AssetPrice> = {};

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
    });

    set({ prices: newPrices });
  },
}));
