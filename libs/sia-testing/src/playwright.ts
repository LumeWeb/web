/** Browser bindings own isolated contexts and keep access material out of test configuration. */
export { createSiaTest } from "./testing/playwright.js";
export type { BrowserBinding, BrowserRun } from "./testing/playwright.js";
