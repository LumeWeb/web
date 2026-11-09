/** Only the local Vite server supplies these synthetic credentials; production code uses its own adapter. */
import type { MockConnection } from "@lumeweb/sia-testing/client";

export interface DemoInput {
  readonly owner: MockConnection;
  readonly phrase: string;
  readonly registration: MockConnection;
}
