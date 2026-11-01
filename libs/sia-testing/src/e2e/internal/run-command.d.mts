/** Internal argument-array runner used by the bin and checkout suite selector. */
import type { assertMutationAllowed, runWithGuardian } from "./owned-cluster-lease.mjs";
import type { preflight } from "./service-preflight.mjs";
export interface RunnerIO {
  assertMutation: typeof assertMutationAllowed;
  preflight: typeof preflight;
  run: typeof runWithGuardian;
}
export function commandMain(argv: string[], entry?: string): Promise<number>;
export function runGuardedCommand(command: string, args: string[], cwd: string, env: NodeJS.ProcessEnv, io?: RunnerIO): Promise<number>;
