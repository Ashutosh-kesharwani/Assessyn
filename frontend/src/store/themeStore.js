import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'shadow',
      setTheme: (themeId) => {
        document.documentElement.setAttribute('data-theme', themeId);
        localStorage.setItem('assessyn_theme', themeId);
        set({ theme: themeId });
      },
    }),
    {
      name: 'assessyn_theme_store',
      onRehydrateStorage: () => (state) => {
        if (state?.theme) {
          document.documentElement.setAttribute('data-theme', state.theme);
        }
      },
    }
  )
);
