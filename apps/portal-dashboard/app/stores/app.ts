import { create } from "zustand";
import { Sdk } from "@lumeweb/portal-sdk";

export interface AppState {
  sdk?: Sdk;
  setSdk: (sdk: Sdk) => void;
}

const useAppStore = create<AppState>()((set) => ({
  sdk: undefined,
  setSdk: (sdk) => set({ sdk }),
}));

export default useAppStore;
