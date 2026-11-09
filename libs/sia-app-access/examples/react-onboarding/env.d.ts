import "vite/client";
import type { DemoInput } from "./demo-input.ts";

declare global {
  const __DEMO_INPUT__: DemoInput | undefined;
}
