/** Node owns a run's local adapters and fixture descriptors; the portable backend owns storage cleanup. */
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { basename, join } from "node:path";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import {
  limitedProfile,
  loadLiveProfile,
  profileDocument,
} from "./live/profile.js";
import { withLiveRun } from "./live/run.js";
import { recoverLiveRun } from "./live/recovery.js";
import type { LiveConsent } from "./live/types.js";
import { Readable } from "node:stream";
import { fileURLToPath } from "node:url";
import { createMockSia } from "./mock.js";
import { mockCredential, startMockServer } from "./http.js";
import type {
  ActorRef,
  AppDefinition,
  BrowserAccess,
  LiveRun,
  LiveRunSummary,
  MockOptions,
  MockRun,
  MockRunSummary,
  RunLimits,
  RunResult,
  SiaRun,
  TestFile,
} from "./types.js";

export interface LiveNodeRunOptions {
  readonly backend: {
    readonly consent: LiveConsent;
    readonly kind: "live";
    readonly profileFile: string;
  };
  readonly journalFile?: string;
  readonly limits?: Partial<RunLimits>;
  readonly signal?: AbortSignal;
}
export interface MockNodeRunOptions {
  readonly backend: {
    readonly app: AppDefinition;
    readonly kind: "mock";
    readonly options?: MockOptions;
  };
  readonly limits?: Partial<RunLimits>;
  readonly signal?: AbortSignal;
}
export interface RecoveryOptions {
  readonly backend: LiveNodeRunOptions["backend"];
  readonly journalFile: string;
}
export type RunOptions = LiveNodeRunOptions | MockNodeRunOptions;
interface Session {
  readonly app: AppDefinition;
  readonly resources: (() => Promise<void>)[];
  server?: ReturnType<typeof startMockServer>;
}
const sessions = new WeakMap<SiaRun, Session>();
export async function fileFixture(path: string | URL): Promise<TestFile> {
  const filename = typeof path === "string" ? path : fileURLToPath(path);
  const hash = createHash("sha256");
  let sizeBytes = 0;
  const stream = createReadStream(filename);
  try {
    for await (const chunk of stream) {
      const bytes = chunk as Buffer;
      sizeBytes += bytes.length;
      if (sizeBytes > 16 * 1024 * 1024)
        throw new Error("Fixture exceeds 16 MiB");
      hash.update(bytes);
    }
  } finally {
    stream.destroy();
  }
  return Object.freeze({
    name: basename(filename),
    open: () =>
      Readable.toWeb(createReadStream(filename)) as ReadableStream<Uint8Array>,
    sha256: hash.digest("hex"),
    sizeBytes,
  });
}
export function ownRunResource(run: SiaRun, close: () => Promise<void>): void {
  const session = sessions.get(run);
  if (!session) throw new Error("Run is not open");
  session.resources.push(close);
}
export async function privateConnection(
  run: MockRun,
  access: BrowserAccess,
  actor?: ActorRef,
) {
  const session = sessions.get(run);
  if (!session) throw new Error("Run is not open");
  const credential = mockCredential(run.mock, access);
  if (!session.server) {
    session.server = startMockServer(run.mock);
    session.resources.push(async () => {
      await (await session.server!).close();
    });
  }
  const server = await session.server;
  return {
    backend: {
      connection: server.connection({
        access,
        as: actor ?? run.mock.actor("browser"),
      }),
      credential:
        credential.kind === "registration"
          ? { ...credential, app: session.app, phrase: run.auth.fixturePhrase }
          : credential,
      kind: "mock" as const,
    },
  };
}
export async function recoverSiaRun(
  options: RecoveryOptions,
): Promise<LiveRunSummary> {
  const profile = await loadLiveProfile(
    options.backend.profileFile,
    options.backend.consent,
  );
  return recoverLiveRun({ journalFile: options.journalFile, profile });
}
export function withSiaRun<T>(
  options: MockNodeRunOptions,
  use: (run: MockRun) => Promise<T>,
): Promise<RunResult<T, MockRunSummary>>;
export function withSiaRun<T>(
  options: LiveNodeRunOptions,
  use: (run: LiveRun) => Promise<T>,
): Promise<RunResult<T, LiveRunSummary>>;
export function withSiaRun<T>(
  options: RunOptions,
  use: (run: SiaRun) => Promise<T>,
): Promise<RunResult<T>>;
export async function withSiaRun<T>(
  options: RunOptions,
  use: ((run: LiveRun) => Promise<T>) | ((run: MockRun) => Promise<T>),
): Promise<RunResult<T>> {
  if (isLiveOptions(options)) {
    const profile = limitedProfile(
      await loadLiveProfile(
        options.backend.profileFile,
        options.backend.consent,
      ),
      options.limits,
    );
    const journalFile =
      options.journalFile ??
      join(await mkdtemp(join(tmpdir(), "sia-testing-run-")), "journal.jsonl");
    let current: LiveRun | undefined;
    return withLiveRun(
      {
        journalFile,
        profile,
        ...(options.signal ? { signal: options.signal } : {}),
        beforeCleanup: async () => {
          if (!current) return;
          const session = sessions.get(current);
          sessions.delete(current);
          const errors: unknown[] = [];
          for (const close of [...(session?.resources ?? [])].reverse()) {
            try {
              await close();
            } catch (error) {
              errors.push(error);
            }
          }
          if (errors.length)
            throw new AggregateError(errors, "Application cleanup failed");
        },
      },
      async (run) => {
        current = run;
        sessions.set(run, { app: profileDocument(profile).app, resources: [] });
        return (use as (run: LiveRun) => Promise<T>)(run);
      },
    );
  }
  if (options.backend.kind !== "mock")
    throw Object.assign(new Error("Unsupported test backend"), {
      code: "invalid-input",
    });
  const mock = createMockSia(options.backend.options);
  const failures: unknown[] = [];
  let result: RunResult<T, MockRunSummary> | undefined;
  try {
    result = await mock.run(
      {
        app: options.backend.app,
        ...(options.limits && { limits: options.limits }),
        ...(options.signal && { signal: options.signal }),
      },
      async (run) => {
        const session: Session = { app: options.backend.app, resources: [] };
        sessions.set(run, session);
        const errors: unknown[] = [];
        let value!: T;
        try {
          value = await (use as (run: MockRun) => Promise<T>)(run);
        } catch (error) {
          errors.push(error);
        }
        for (const close of [...session.resources].reverse()) {
          try {
            await close();
          } catch (error) {
            errors.push(error);
          }
        }
        sessions.delete(run);
        if (errors.length === 1) throw errors[0];
        if (errors.length)
          throw new AggregateError(
            errors,
            "Application and adapter cleanup failed",
          );
        return value;
      },
    );
  } catch (error) {
    failures.push(error);
  }
  try {
    await mock.close();
  } catch (error) {
    failures.push(error);
  }
  if (failures.length === 1) throw failures[0];
  if (failures.length)
    throw new AggregateError(failures, "Run and final close failed");
  return result!;
}
function isLiveOptions(options: RunOptions): options is LiveNodeRunOptions {
  return options.backend.kind === "live";
}
