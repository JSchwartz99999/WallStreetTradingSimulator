import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { OrderType, AssetFilter, ChartTab, Timeframe } from '@/utils/constants';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface UIState {
  orderType: OrderType;
  timeframe: Timeframe;
  chartTab: ChartTab;
  assetFilter: AssetFilter;
  toasts: Toast[];

  // Actions
  setOrderType: (orderType: OrderType) => void;
  setTimeframe: (timeframe: Timeframe) => void;
  setChartTab: (chartTab: ChartTab) => void;
  setAssetFilter: (assetFilter: AssetFilter) => void;
  showToast: (message: string, type?: Toast['type']) => void;
  dismissToast: (id: string) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      orderType: 'market',
      timeframe: '1D',
      chartTab: 'chart',
      assetFilter: 'all',
      toasts: [],

      setOrderType: (orderType) => set({ orderType }),

      setTimeframe: (timeframe) => set({ timeframe }),

      setChartTab: (chartTab) => set({ chartTab }),

      setAssetFilter: (assetFilter) => set({ assetFilter }),

      showToast: (message, type = 'info') => {
        const id = crypto.randomUUID();
        set((state) => ({
          toasts: [...state.toasts, { id, message, type }],
        }));

        // Auto-dismiss after 3 seconds
        setTimeout(() => {
          set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
          }));
        }, 3000);
      },

      dismissToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        })),
    }),
    {
      name: 'wall-street-ui',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        orderType: state.orderType,
        timeframe: state.timeframe,
        chartTab: state.chartTab,
        assetFilter: state.assetFilter,
      }),
    }
  )
);
