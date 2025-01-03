import BaseService from "@/services/base";
import UploadManager from "@/features/uploadManager/lib/uploadManager";
import { createStore, useStore } from "zustand";

export interface DashboardState {
  services: BaseService[];
  portalUrl: string;
  uploader: UploadManager;
}

export interface DashboardActions {
  addService: (service: BaseService) => void;
  getServices: () => BaseService[];
  getServiceById: <S extends BaseService>(id: string) => S | undefined;
  resetServices: () => void;
}

export const dashboardStore = createStore<DashboardState & DashboardActions>(
  (set, get) => ({
    services: [],
    portalUrl: "", // You need to set this value
    uploader: new UploadManager(),
    addService: (service) => {
      service.register();
      set((state) => ({ services: [...state.services, service] }));
    },
    getServices: () => get().services,
    getServiceById: <S extends BaseService>(id: string): S | undefined =>
      get().services.find((service): service is S => service.id() === id),
    resetServices: () => set({ services: [] }),
  }),
);

export const useDashboardStore = <T>(
  selector: (state: DashboardState & DashboardActions) => T,
) => useStore(dashboardStore, selector);
