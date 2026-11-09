import assert from "node:assert/strict";
import {
  createSessionFromClient,
  createSiaSdkSession,
  mapSiaSdkSession,
} from "@lumeweb/sia-session";
import {
  acquireSdkWhenAvailable,
  createLeaseAbortSignal,
} from "@lumeweb/sia-session/abort";
let frees = 0;
const sdk = {
  free() {
    frees++;
  },
  read() {
    return "archive";
  },
};
const session = createSessionFromClient(sdk);
const source = mapSiaSdkSession(session.source, (value) => ({
  read: () => value.read(),
}));
const lease = await acquireSdkWhenAvailable(source);
const link = createLeaseAbortSignal(lease);
assert.equal(lease.value.read(), "archive");
const closing = session.close();
assert.equal(frees, 0);
assert.equal(link.signal.aborted, true);
link.dispose();
lease.release();
await closing;
assert.equal(frees, 1);
await createSiaSdkSession().close();
const resolved = import.meta.resolve("@lumeweb/sia-session");
assert.ok(resolved.includes("/node_modules/"));
assert.ok(!resolved.includes("/worktrees/web/sia-session/"));
