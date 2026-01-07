import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface WatchlistState {
  watchlist: string[];

  // Actions
  addToWatchlist: (symbol: string) => void;
  removeFromWatchlist: (symbol: string) => void;
  isInWatchlist: (symbol: string) => boolean;
  toggleWatchlist: (symbol: string) => void;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      watchlist: [],

      addToWatchlist: (symbol) => {
        set((state) => {
          if (state.watchlist.includes(symbol)) return state;
          return { watchlist: [...state.watchlist, symbol] };
        });
      },

      removeFromWatchlist: (symbol) => {
        set((state) => ({
          watchlist: state.watchlist.filter((s) => s !== symbol),
        }));
      },

      isInWatchlist: (symbol) => {
        return get().watchlist.includes(symbol);
      },

      toggleWatchlist: (symbol) => {
        const state = get();
        if (state.watchlist.includes(symbol)) {
          state.removeFromWatchlist(symbol);
        } else {
          state.addToWatchlist(symbol);
        }
      },
    }),
    {
      name: 'wall-street-watchlist',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
