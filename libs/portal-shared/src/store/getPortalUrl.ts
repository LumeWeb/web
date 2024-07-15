import { baseStore } from "./baseStore";

export default function getPortalUrl() {
  const state = baseStore.getState();
  if (state.portalUrl) {
    return state.portalUrl;
  }

  return `https://${state.meta?.domain}`;
}
