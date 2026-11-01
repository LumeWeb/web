/** The transfer allowance counts repeated ranges across owned stream URLs. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { createTransferBudget } from "./budget.ts";

await test("separate stream counters share one transfer allowance", () => {
  let exceeded = 0;
  const budget = createTransferBudget(10, () => {
    exceeded++;
  });
  const first = budget.progress(),
    second = budget.progress();
  first(6);
  first(6);
  second(4);
  assert.equal(exceeded, 0);
  second(5);
  assert.equal(exceeded, 1);
  first(8);
  assert.equal(exceeded, 1);
});

for (const value of [-1, 0.5, NaN, Infinity]) {
  await test(`an invalid progress count ${String(value)} stops the run`, () => {
    let stopped = false;
    const progress = createTransferBudget(10, () => {
      stopped = true;
    }).progress();
    progress(value);
    assert.equal(stopped, true);
  });
}

await test("a counter moving backward cannot erase an earlier transfer", () => {
  let stopped = false;
  const progress = createTransferBudget(10, () => {
    stopped = true;
  }).progress();
  progress(6);
  progress(5);
  assert.equal(stopped, true);
});
