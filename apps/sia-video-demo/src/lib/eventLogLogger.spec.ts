import { beforeEach, describe, expect, it } from "vitest";
import { useEventLogStore } from "../stores/eventLog";
import { createEventLogLogger } from "./eventLogLogger";

/**
 * Node unit tests for the demo's typed `Logger` sink. The logger forwards the
 * library's `Logger` records (which the host derives its worker-wire threshold
 * from via `logger.level`) into the event-log store as one timestamped line,
 * mapping each log level onto an event-log severity. These tests pin the level
 * mapping, child-scope prefixing, scalar-fact rendering, the level filter, and
 * the seed-safety of the forwarding path (the sink never pulls seed state from
 * the auth store into a line).
 */
describe("createEventLogLogger", () => {
  beforeEach(() => {
    useEventLogStore.setState({ lines: [], verbose: false });
  });

  it("returns a logger with the typed Logger method surface", () => {
    const logger = createEventLogLogger();
    for (const method of ["child", "debug", "error", "info", "trace", "warn"]) {
      expect(
        typeof (logger as unknown as Record<string, unknown>)[method],
      ).toBe("function");
    }
    // Quiet by default: the demo is not a debug tool out of the box, so the
    // default filter is `info` (session milestones only), not `debug`.
    expect(logger.level).toBe("info");
  });

  it("maps each log level onto an event-log severity", () => {
    const logger = createEventLogLogger({ level: "debug" });
    logger.debug("debug line");
    logger.info("info line");
    logger.warn("warn line");
    logger.error("error line");
    const lines = useEventLogStore.getState().lines;
    expect(lines.map((line) => [line.message, line.level])).toEqual([
      ["error line", "error"],
      ["warn line", "warn"],
      ["info line", "milestone"],
      ["debug line", "debug"],
    ]);
  });

  it("keeps the default sink quiet: info and above only, debug dropped", () => {
    const logger = createEventLogLogger();
    logger.debug("debug line");
    logger.info("info line");
    const lines = useEventLogStore.getState().lines;
    expect(lines.map((line) => [line.message, line.level])).toEqual([
      ["info line", "milestone"],
    ]);
  });

  it("maps trace onto the debug severity when the trace filter is on", () => {
    const logger = createEventLogLogger({ level: "trace" });
    logger.trace("trace line");
    logger.debug("debug line");
    const lines = useEventLogStore.getState().lines;
    expect(lines.map((line) => [line.message, line.level])).toEqual([
      ["debug line", "debug"],
      ["trace line", "debug"],
    ]);
  });

  it("dot-joins child scopes into a [scope] prefix", () => {
    const logger = createEventLogLogger().child("worker");
    logger.info("hello");
    const nested = logger.child("reader");
    nested.warn("partial read");
    const lines = useEventLogStore.getState().lines;
    expect(lines.map((line) => line.message)).toEqual([
      "[worker.reader] partial read",
      "[worker] hello",
    ]);
  });

  it("renders scalar facts as key=value pairs after the message", () => {
    const logger = createEventLogLogger().child("worker");
    logger.info("object.resolved", { share: false, size: 7 });
    const [line] = useEventLogStore.getState().lines;
    expect(line.message).toBe("[worker] object.resolved share=false size=7");
  });

  it("condenses object facts instead of dropping them", () => {
    const logger = createEventLogLogger();
    logger.info("detail", { nested: { deep: [1, 2] } });
    const [line] = useEventLogStore.getState().lines;
    expect(line.message).toBe('detail nested={"deep":[1,2]}');
  });

  it("respects the configured level filter", () => {
    const logger = createEventLogLogger({ level: "info" });
    logger.debug("dropped");
    logger.info("kept");
    const lines = useEventLogStore.getState().lines;
    expect(lines.map((line) => line.message)).toEqual(["kept"]);
  });

  it("silent drops every line", () => {
    const logger = createEventLogLogger({ level: "silent" });
    logger.error("silenced");
    logger.info("silenced too");
    expect(useEventLogStore.getState().lines).toEqual([]);
  });

  it("forwards only the caller's message and fields — never auth seed state", () => {
    // A sharing-key seed lives in the auth store; a forwarding path that
    // serialized store state would leak it into a line. The logger only reads
    // the event-log store, so the seeding of the auth store must not appear.
    const seed =
      "d778398e336858ddc1a7de0c78ca22bbe9c821e2786d7b5a941c729e1e5ceb1f";
    createEventLogLogger()
      .child("worker")
      .info("sdk.built", { indexerUrl: "https://sia.storage" });
    const messages = useEventLogStore
      .getState()
      .lines.map((line) => line.message);
    expect(messages).toEqual([
      "[worker] sdk.built indexerUrl=https://sia.storage",
    ]);
    const joined = messages.join("\n");
    expect(joined).not.toContain(seed);
    expect(joined).not.toContain("sharingKeyHex");
  });
});
