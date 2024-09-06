import BaseService from "../services/base";
import { AppActions, useAppStore } from "@/stores/app.js";

export function getAddService(): AppActions["addService"] {
  return useAppStore((state) => state.addService);
}

export function addService(svc: BaseService) {
  return getAddService()(svc);
}

export function getGetServices(): AppActions["getServices"] {
  return useAppStore((state) => state.getServices);
}

export function getServiceIds(): string[] {
  return getGetServices()().map((svc) => svc.id());
}

export function getServiceById(id: string): BaseService | undefined {
  return useAppStore((state) => state.getServiceById)(id);
}

export function getResetServices() {
  return useAppStore((state) => state.resetServices);
}
