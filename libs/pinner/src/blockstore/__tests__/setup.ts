import { afterEach, beforeEach } from "vitest";
import { setDriverFactory } from "../unstorage-base";
import memoryDriver from "unstorage/drivers/memory";

beforeEach(() => {
  // Set up in-memory driver for tests (no disk I/O)
  setDriverFactory(() => memoryDriver());
});

afterEach(() => {
  // Reset driver factory after each test
  setDriverFactory(null);
});
