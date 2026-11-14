/** Controlled native boundary records allocation without claiming WASM lifetime proof. */
export const events: string[] = [];
export let validationFails = false;
export let initFails = false;
export let builderFreeError: Error | undefined;
export let pending: (() => Promise<void>) | undefined;
export let registrationError: Error | undefined;
interface ControlledSdkOptions {
  readonly builderFreeError?: Error;
  readonly initFails?: boolean;
  readonly pending?: () => Promise<void>;
  readonly registrationError?: Error;
  readonly validationFails?: boolean;
}
export class AppKey {
  constructor(_bytes: Uint8Array) {
    events.push("key:new");
  }
  export() {
    return new Uint8Array(32).fill(7);
  }
  free() {
    events.push("key:free");
  }
}
export class Builder {
  constructor(_url: string, _app: unknown) {
    events.push("builder:new");
  }
  async connected(_key: AppKey) {
    events.push("connected");
    await pending?.();
    return new Sdk();
  }
  free() {
    events.push("builder:free");
    if (builderFreeError) throw builderFreeError;
  }
  async matchesExistingAppKey(_phrase: string) {
    events.push("match");
    await pending?.();
    return true;
  }
  async register(_phrase: string) {
    events.push("register");
    await pending?.();
    if (registrationError) throw registrationError;
    return new Sdk();
  }
  async requestConnection() {
    events.push("request");
  }
  responseUrl() {
    return "https://approve.test";
  }
  async waitForApproval() {
    events.push("wait");
    await pending?.();
  }
}
export class Sdk {
  appKey() {
    return new AppKey(new Uint8Array(32));
  }
  free() {
    events.push("sdk:free");
  }
}
export function configure(options: ControlledSdkOptions = {}) {
  validationFails = options.validationFails ?? false;
  initFails = options.initFails ?? false;
  builderFreeError = options.builderFreeError;
  pending = options.pending;
  registrationError = options.registrationError;
  events.length = 0;
}
export function generateRecoveryPhrase() {
  return "valid phrase";
}
export default async function init() {
  events.push("init");
  if (initFails) throw Error("asset");
}
export function validateRecoveryPhrase(phrase: string) {
  if (phrase !== "valid phrase" || validationFails)
    throw Error("invalid mnemonic");
}
