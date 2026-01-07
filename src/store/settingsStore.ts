import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Theme = 'dark' | 'light';

interface SettingsState {
  theme: Theme;
  soundEnabled: boolean;
  showTutorial: boolean;
  hasCompletedTutorial: boolean;

  // Actions
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setSoundEnabled: (enabled: boolean) => void;
  toggleSound: () => void;
  setShowTutorial: (show: boolean) => void;
  completeTutorial: () => void;
  resetTutorial: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      soundEnabled: true,
      showTutorial: false,
      hasCompletedTutorial: false,

      setTheme: (theme) => {
        set({ theme });
        // Apply theme to document
        if (theme === 'light') {
          document.documentElement.classList.add('light-theme');
        } else {
          document.documentElement.classList.remove('light-theme');
        }
      },

      toggleTheme: () => {
        const newTheme = get().theme === 'dark' ? 'light' : 'dark';
        get().setTheme(newTheme);
      },

      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),

      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),

      setShowTutorial: (show) => set({ showTutorial: show }),

      completeTutorial: () => set({ showTutorial: false, hasCompletedTutorial: true }),

      resetTutorial: () => set({ hasCompletedTutorial: false }),
    }),
    {
      name: 'wall-street-settings',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        // Apply theme on hydration
        if (state?.theme === 'light') {
          document.documentElement.classList.add('light-theme');
        }
      },
    }
  )
);
