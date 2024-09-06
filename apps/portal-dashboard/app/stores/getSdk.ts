import { appStore } from "@/stores/app";

export default function getSdk() {
  return appStore.getState().sdk;
}
