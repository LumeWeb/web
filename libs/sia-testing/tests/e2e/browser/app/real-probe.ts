/** Installs one real WASM harness for this page; Node retains provisioning authority. */
import { initSia, setLogger } from "@siafoundation/sia-storage";
import { createSDKDiagnostics } from "../../support/sdk-diagnostics.js";
import { createBrowserHarness } from "./browser-harness.js";
await initSia();
const diagnostics = createSDKDiagnostics();
setLogger((message) => diagnostics.record(message), "debug");
export const probe = createBrowserHarness(diagnostics);
window.probe = probe;
document.querySelector("#status")!.textContent = "ready";
