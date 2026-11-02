/** Empty source chunks must be collectible while fixture collection waits for payload bytes. */
import { setImmediate } from "node:timers/promises";
const { digest, readFixture } =
  /** @type {typeof import("../../src/testing/files.js")} */ (
    await import(process.argv[2])
  );
const retain = process.argv[3] === "retain";
/** @type {WeakRef<Uint8Array>[]} */
const references = [];
/** @type {Uint8Array[]} */
const retained = [];
/** @type {ReadableStreamDefaultController<Uint8Array> | undefined} */
let controller;
let emitted = 0;
/** @type {() => void} */
let drained;
/** @type {Promise<void>} */
const ready = new Promise((resolve) => {
  drained = resolve;
});
class EmptyChunk extends Uint8Array {
  slice() {
    return this;
  }
}
/** @type {import("../../src/testing/types.js").TestFile} */
const file = {
  name: "empty-chunks",
  open: () =>
    new ReadableStream(
      {
        pull(source) {
          controller = source;
          if (emitted === 128) {
            drained();
            return;
          }
          const chunk = new EmptyChunk(0);
          references.push(new WeakRef(chunk));
          if (retain) retained.push(chunk);
          emitted++;
          source.enqueue(chunk);
        },
      },
      { highWaterMark: 0 },
    ),
  sha256: await digest(Uint8Array.of(1)),
  sizeBytes: 1,
};
const collection = readFixture(file, new AbortController().signal);
await ready;
// WeakRef targets stay alive until their current job ends.
for (let index = 0; index < 10; index++) {
  await setImmediate();
  global.gc();
}
const live = references.filter(
  (reference) => reference.deref() !== undefined,
).length;
if (!controller) throw new Error("Fixture source did not open");
controller.enqueue(Uint8Array.of(1));
controller.close();
const bytes = await collection;
console.log(
  JSON.stringify({
    bytes: [...bytes],
    emitted,
    kept: retained.map((chunk) => chunk.length).length,
    live,
  }),
);
