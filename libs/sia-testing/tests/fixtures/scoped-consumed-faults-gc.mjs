/** Explicit retention and unconsumed faults provide controls for selector collection. */
const { createRequestControls } =
  /** @type {typeof import("../../src/testing/controls.js")} */ (
    await import(process.argv[2])
  );
const controls = createRequestControls();
const actor = /** @type {import("../../src/testing/types.js").ActorRef} */ ({});
const signal = new AbortController().signal;
const mode = process.argv[3];
const kept = [];
const references = [];
for (let index = 0; index < 32; index++) {
  const object =
    /** @type {import("../../src/testing/types.js").TestObject} */ ({
      id: index.toString(16).padStart(64, "0"),
    });
  references.push(new WeakRef(object));
  if (mode === "retain") kept.push(object);
  controls.control.fail(
    { object, operation: "object" },
    { code: "unavailable", times: mode === "pending" ? 2 : 1 },
  );
  try {
    await controls.begin(actor, "object", object.id, signal);
  } catch (error) {
    if (/** @type {{code: string}} */ (error).code !== "unavailable")
      throw error;
  }
}
for (let index = 0; index < 8; index++) {
  await new Promise((resolve) => setTimeout(resolve, 0));
  globalThis.gc();
}
await controls.begin(actor, "objects", undefined, signal);
console.log(
  JSON.stringify({
    kept: kept.length,
    live: references.filter((reference) => reference.deref()).length,
  }),
);
