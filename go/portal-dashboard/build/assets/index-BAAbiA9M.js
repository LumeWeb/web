import { q as useDashboardStore } from "./useTheme-DCF_-rVc.js";
function getAddService() {
  return useDashboardStore((state) => state.addService);
}
function getGetServices() {
  return useDashboardStore((state) => state.getServices);
}
function getServiceIds() {
  return getGetServices()().map((svc) => svc.id());
}
function getServiceById(id) {
  return useDashboardStore((state) => state.getServiceById)(id);
}
function getResetServices() {
  return useDashboardStore((state) => state.resetServices);
}
export {
  getAddService as a,
  getResetServices as b,
  getServiceById as c,
  getServiceIds as d,
  getGetServices as g
};
