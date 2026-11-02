/** Journal tests use private files so recovery behavior includes filesystem ownership and torn writes. */
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { startOwnedProcess } from "../../src/testing/live/process.js";
import {
  appendFile,
  chmod,
  mkdtemp,
  readFile,
  rm,
  stat,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, it, vi } from "vitest";
import { setImmediate } from "node:timers/promises";
import { type FileHandle, open } from "node:fs/promises";
import {
  createJournal,
  readJournal,
  resumeJournal,
} from "../../src/testing/live/journal.js";
const header = {
  apiBaseUrl: "http://127.0.0.1:9980/",
  appId: "0".repeat(64),
  kind: "header",
  runId: "owned-run",
  version: 1,
} as const;
async function fixture(
  use: (path: string, directory: string) => Promise<void>,
) {
  const directory = await mkdtemp(join(tmpdir(), "sia-journal-"));
  try {
    await use(join(directory, "run.jsonl"), directory);
  } finally {
    await rm(directory, { force: true, recursive: true });
  }
}
it("intent and acknowledgement records survive closing and reopening the journal", () =>
  fixture(async (path) => {
    const journal = await createJournal(path, header);
    const intent = {
      id: "upload-1",
      input: { bytes: 4 },
      kind: "intent",
      operation: "upload",
    } as const;
    const pending = journal.append(intent);
    (intent.input as { bytes: number }).bytes = 99;
    await pending;
    await journal.append({
      id: "upload-1",
      kind: "ack",
      result: { objectId: "a".repeat(64) },
    });
    await journal.close();
    expect((await stat(path)).mode & 0o777).toBe(0o600);
    expect(await readJournal(path)).toMatchObject({
      records: [
        { ...header, sequence: 0 },
        { ...intent, input: { bytes: 4 }, sequence: 1 },
        { id: "upload-1", kind: "ack", sequence: 2 },
      ],
      truncated: false,
    });
    expect(JSON.stringify(journal)).not.toContain(path);
  }));
it("closing waits for queued appends and refuses later writes", () =>
  fixture(async (path) => {
    const journal = await createJournal(path, header);
    const first = journal.append({
      id: "one",
      input: {},
      kind: "intent",
      operation: "upload",
    });
    const second = journal.append({
      id: "two",
      input: {},
      kind: "intent",
      operation: "create-share",
    });
    await journal.close();
    await Promise.all([first, second]);
    expect(
      (await readJournal(path)).records.map((record) => record.sequence),
    ).toEqual([0, 1, 2]);
    await expect(
      journal.append({ cleanup: "clean", kind: "complete" }),
    ).rejects.toMatchObject({ code: "journal-closed" });
    await journal.close();
  }));
it("an append stays pending until its durability flush finishes", () =>
  fixture(async (path, directory) => {
    const journal = await createJournal(path, header);
    const probe = await open(join(directory, "probe"), "w", 0o600);
    const prototype = Object.getPrototypeOf(probe) as FileHandle;
    const original = Reflect.get(prototype, "sync");
    await probe.close();
    let entered!: () => void;
    let release!: () => void;
    const flushing = new Promise<void>((resolve) => {
      entered = resolve;
    });
    const blocked = new Promise<void>((resolve) => {
      release = resolve;
    });
    const spy = vi
      .spyOn(prototype, "sync")
      .mockImplementationOnce(async function (this: FileHandle) {
        entered();
        await blocked;
        await original.call(this);
      });
    let settled = false;
    const pending = journal
      .append({
        id: "upload-1",
        input: {},
        kind: "intent",
        operation: "upload",
      })
      .then(() => {
        settled = true;
      });
    try {
      await flushing;
      await setImmediate();
      expect(settled).toBe(false);
    } finally {
      release();
      await pending;
      spy.mockRestore();
      await journal.close();
    }
  }));
it("creating a journal never overwrites an existing file", () =>
  fixture(async (path) => {
    await writeFile(path, "operator-owned", { mode: 0o600 });
    await expect(createJournal(path, header)).rejects.toMatchObject({
      code: "journal-invalid",
    });
    expect(await readFile(path, "utf8")).toBe("operator-owned");
  }));
it("creating a journal rejects a shared parent directory", () =>
  fixture(async (path, directory) => {
    await chmod(directory, 0o755);
    await expect(createJournal(path, header)).rejects.toMatchObject({
      code: "journal-invalid",
    });
  }));
it("a journal cannot be created inside the checkout", () =>
  fixture(async (path, directory) => {
    await expect(createJournal(path, header, directory)).rejects.toMatchObject({
      code: "journal-invalid",
    });
  }));
it("a journal symlink cannot overwrite its target", () =>
  fixture(async (path, directory) => {
    const target = join(directory, "operator.json");
    await writeFile(target, "operator-owned", { mode: 0o600 });
    await symlink(target, path);
    await expect(createJournal(path, header)).rejects.toMatchObject({
      code: "journal-invalid",
    });
    expect(await readFile(target, "utf8")).toBe("operator-owned");
  }));
it("recovery preserves durable intents when the final acknowledgement is torn", () =>
  fixture(async (path) => {
    const journal = await createJournal(path, header);
    await journal.append({
      id: "upload-1",
      input: {},
      kind: "intent",
      operation: "upload",
    });
    await journal.close();
    await appendFile(path, '{"sequence":2,"kind":"ack"');
    const recovered = await readJournal(path);
    expect(recovered.truncated).toBe(true);
    expect(recovered.records).toHaveLength(2);
    expect(recovered.records[1]).toMatchObject({
      id: "upload-1",
      kind: "intent",
    });
  }));
it("resuming a closed journal continues its durable record sequence", () =>
  fixture(async (path) => {
    const first = await createJournal(path, header);
    await first.append({
      id: "upload-1",
      input: {},
      kind: "intent",
      operation: "upload",
    });
    await first.close();
    const { journal, snapshot } = await resumeJournal(path);
    expect(snapshot.records).toHaveLength(2);
    await journal.append({
      id: "upload-1",
      kind: "ack",
      result: { objectId: "a".repeat(64) },
    });
    await journal.close();
    expect(
      (await readJournal(path)).records.map((record) => record.sequence),
    ).toEqual([0, 1, 2]);
  }));
it("resumption removes a torn suffix before appending recovery records", () =>
  fixture(async (path) => {
    const first = await createJournal(path, header);
    await first.close();
    await appendFile(path, '{"kind":"intent"');
    const { journal, snapshot } = await resumeJournal(path);
    expect(snapshot.truncated).toBe(true);
    await journal.append({ cleanup: "uncertain", kind: "complete" });
    await journal.close();
    expect(await readJournal(path)).toMatchObject({
      records: [{ sequence: 0 }, { kind: "complete", sequence: 1 }],
      truncated: false,
    });
  }));
it("recovery rejects a malformed complete record", () =>
  fixture(async (path) => {
    const journal = await createJournal(path, header);
    await journal.close();
    await appendFile(path, "not-json\n");
    await expect(readJournal(path)).rejects.toMatchObject({
      code: "journal-invalid",
    });
  }));
it("recovery can record cleanup after normal writes fill the journal", () =>
  fixture(async (path) => {
    const journal = await createJournal(path, header);
    const capacity = 16 * 1024 * 1024;
    const size = (await readFile(path)).byteLength;
    const event = { id: "large", kind: "ack" as const, result: "" };
    const overhead = Buffer.byteLength(
      JSON.stringify({ ...event, sequence: 1 }) + "\n",
    );
    await journal.append({
      ...event,
      result: "x".repeat(capacity - size - overhead),
    });
    await expect(
      journal.append({ appKeyHex: "07".repeat(32), kind: "auth" }),
    ).rejects.toMatchObject({ code: "journal-limit" });
    await journal.close();
    const resumed = await resumeJournal(path);
    try {
      await resumed.journal.append(
        {
          id: "cleanup",
          input: { objectId: "a".repeat(64) },
          kind: "intent",
          operation: "delete",
        },
        { cleanup: true },
      );
      await resumed.journal.append(
        { id: "cleanup", kind: "ack", result: null },
        { cleanup: true },
      );
      await resumed.journal.append({ cleanup: "clean", kind: "complete" });
    } finally {
      await resumed.journal.close();
    }
    expect((await readJournal(path)).records.at(-1)).toMatchObject({
      cleanup: "clean",
      kind: "complete",
    });
  }));
it("a named pipe is rejected before waiting for a writer", () =>
  fixture(async (path) => {
    await promisify(execFile)("mkfifo", [path]);
    const agent = startOwnedProcess({
      cleanupDeadlineMs: 1000,
      deadlineMs: 500,
      entrypoint: new URL(
        "../fixtures/private-file-control.mjs",
        import.meta.url,
      ),
    });
    try {
      await expect(
        agent.request("read", {
          module: new URL(
            "../../src/testing/live/private-files.ts",
            import.meta.url,
          ).href,
          path,
        }),
      ).resolves.toEqual({ rejected: true });
    } finally {
      await agent.close();
    }
  }));
it("recovery rejects journal files readable by other users", () =>
  fixture(async (path) => {
    const journal = await createJournal(path, header);
    await journal.close();
    await chmod(path, 0o644);
    await expect(readJournal(path)).rejects.toMatchObject({
      code: "journal-invalid",
    });
  }));
