import BaseService from "../services/base";
import { DashboardActions, useDashboardStore } from "@/stores/app";

export function getAddService(): DashboardActions["addService"] {
  return useDashboardStore((state) => state.addService);
}

export function addService(svc: BaseService) {
  return getAddService()(svc);
}

export function getGetServices(): DashboardActions["getServices"] {
  return useDashboardStore((state) => state.getServices);
}

export function getServiceIds(): string[] {
  return getGetServices()().map((svc) => svc.id());
}

export function getServiceById(id: string): BaseService | undefined {
  return useDashboardStore((state) => state.getServiceById)(id);
}

export function getResetServices() {
  return useDashboardStore((state) => state.resetServices);
}
