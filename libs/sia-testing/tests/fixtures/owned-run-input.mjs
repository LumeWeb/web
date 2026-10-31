/** Isolates invalid stdio descriptors so a broken guard cannot abort the test runner. */
import { ownedRun } from "../../src/e2e/internal/owned-cluster-lease.mjs";
const [descriptor, logPath, lockPath] = process.argv.slice(2);
try {
  process.exitCode = await ownedRun(
    process.execPath,
    ["-e", "process.exit(0)"],
    {
      ...process.env,
      SIA_NATIVE_TOKEN_LOCK_FD:
        descriptor === "missing" ? undefined : descriptor,
    },
    false,
    lockPath,
    1000,
    100,
    process.cwd(),
    logPath,
  );
} catch {
  process.exitCode = 1;
}
