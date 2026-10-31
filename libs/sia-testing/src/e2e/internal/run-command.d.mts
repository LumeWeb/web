/** Internal argument-array runner used by the bin and checkout suite selector. */
import type { assertOwnedMutation, ownedRun } from "./owned-cluster-lease.mjs";
import type { preflight } from "./service-preflight.mjs";
export interface RunnerIO {
  assertMutation: typeof assertOwnedMutation;
  preflight: typeof preflight;
  run: typeof ownedRun;
}
export function commandMain(argv: string[], entry?: string): Promise<number>;
export function runGuardedCommand(command: string, args: string[], cwd: string, env: NodeJS.ProcessEnv, io?: RunnerIO): Promise<number>;
