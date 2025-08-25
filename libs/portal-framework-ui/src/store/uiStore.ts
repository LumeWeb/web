import { createStore, useStore } from "zustand";
import { persist } from "zustand/middleware";

interface UIActions {
  setTheme: (theme: string) => void;
}

interface UIState {
  theme: string;
}

const uiStore = createStore<UIActions & UIState>()(
  persist(
    (set) => ({
      setTheme: (theme) => set({ theme }),
      theme: "default",
    }),
    {
      name: "ui-store",
      partialize: (state) => ({ theme: state.theme }),
    },
  ),
);

export const useUIStore = <T>(selector: (state: UIActions & UIState) => T) =>
  useStore(uiStore, selector);
