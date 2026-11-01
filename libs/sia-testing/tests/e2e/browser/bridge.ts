/** Types follow the browser operations; Node imports no SDK runtime from the page. */
import type { BrowserProbe } from "./app/browser-harness.js";

export type { BrowserProbe };
declare global {
  interface Window {
    probe: BrowserProbe;
  }
}
