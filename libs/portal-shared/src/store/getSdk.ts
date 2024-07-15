import { baseStore } from "./baseStore";

export default function getSdk() {
  return baseStore.getState().sdk;
}
