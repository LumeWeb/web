/** Exposed GC runs in a child process so cancelled-call retention can be checked without changing the test runner. */
import { setImmediate } from "node:timers/promises";

const { createControls } = /** @type {typeof import("../../src/sdk/control.js")} */ (
  await import(process.argv[2])
);
const controls = createControls(1);
const release = controls.control.hold({ operation: "object" });

async function cancelledCall() {
  const abort = new AbortController();
  const request = controls.begin({
    accountId: "owner",
    device: "reader",
    operation: "object",
  });
  const pending = controls.before(request, abort.signal).catch(() => undefined);
  abort.abort();
  await pending;
  return new WeakRef(abort.signal);
}

const references = [];
for (let index = 0; index < 64; index++) references.push(await cancelledCall());
// WeakRef targets stay alive until their current job ends, even after their last strong reference is removed.
for (let index = 0; index < 10; index++) {
  await setImmediate();
  global.gc();
}
const retained = references.filter(
  (reference) => reference.deref() !== undefined,
).length;
release();
console.log(JSON.stringify({ retained }));
