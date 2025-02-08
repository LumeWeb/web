import { createStore, useStore } from "zustand";

interface UIActions {
  setTheme: (theme: string) => void;
}

interface UIState {
  theme: string;
}

export const uiStore = createStore<UIActions & UIState>((set) => ({
  setTheme: (theme) => set({ theme }),
  theme: "default",
}));

export const useUIStore = <T>(selector: (state: UIActions & UIState) => T) =>
  useStore(uiStore, selector);
