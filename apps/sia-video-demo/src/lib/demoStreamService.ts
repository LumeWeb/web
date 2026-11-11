/** The demo's playback service reads live account access and separate sharing settings. */
import { activeDemoAppKeyHex, subscribeDemoAccount } from "../stores/auth";
import { demoSettingsStore } from "../stores/authSettings";
import {
  createDemoNativeStreamService,
  createDemoStreamAuthSource,
  type DemoNativeStreamService,
} from "./streamService";

const auth = createDemoStreamAuthSource(demoSettingsStore, {
  activeAppKeyHex: activeDemoAppKeyHex,
  subscribe: subscribeDemoAccount,
});
let service: DemoNativeStreamService | null = null;

export function getDemoNativeStreamService(): DemoNativeStreamService {
  service ??= createDemoNativeStreamService(auth);
  return service;
}
