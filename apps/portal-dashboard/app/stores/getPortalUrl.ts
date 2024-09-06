import { appStore } from "@/stores/app";

export default function getPortalUrl() {
  if (appStore.getState().portalUrl) {
    return appStore.getState().portalUrl;
  }

  return `https://${appStore.getState().meta?.domain}`;
}
