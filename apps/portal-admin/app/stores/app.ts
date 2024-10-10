import { createStore, useStore } from "zustand";

export interface AdminState {}

export interface AdminActions {}

export const dashboardStore = createStore<AdminState & AdminActions>(
  (set, get) => ({}),
);

export const useDashboardStore = <T>(
  selector: (state: AdminState & AdminActions) => T,
) => useStore(dashboardStore, selector);
