/** Consumer command supervision with readiness checks under an existing cluster lease. */
import type {
  assertMutationAllowed,
  runWithGuardian,
} from "./owned-cluster-lease.mjs";
import type { preflight } from "./service-preflight.mjs";
/** Offline runner tests replace I/O here; the executable uses the real checks and guardian. */
export interface RunnerIO {
  assertMutation: typeof assertMutationAllowed;
  preflight: typeof preflight;
  run: typeof runWithGuardian;
}
/** Parses without a shell and refuses missing consent or a forged --locked invocation. */
export function commandMain(argv: string[], entry?: string): Promise<number>;
/** Reaps descendants before postflight and retains private diagnostics unless the whole run succeeds. */
export function runGuardedCommand(
  command: string,
  args: string[],
  cwd: string,
  env: NodeJS.ProcessEnv,
  io?: RunnerIO,
): Promise<number>;
