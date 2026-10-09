/**
 * Type-level guard for the native stream provider factory overloads.
 *
 * Applications ship stream services with a concrete resolved-source type
 * (`resolve` returns it, `session` takes it). The factory must accept such a
 * service directly, which only holds if `SiaNativeStreamService` is generic in
 * the source type: a fixed `unknown` source type would reject the `session`
 * parameter under strict function types. This is enforced against the BUILT
 * root declarations (run `pnpm build` first): the service type is exported,
 * a typed service compiles against the factory, the dependency callback
 * object still compiles, and the removed `FromService` factory is gone.
 *
 * Node-only: `./fixtures/declaration-check` provides the shared lazy helpers.
 */
import { describe, expect, it } from "vitest";
import {
  builtFile,
  compileConsumer,
  IS_BROWSER,
  messageTexts,
} from "./fixtures/declaration-check";

describe("root createSiaNativeStreamProvider service declarations", () => {
  it.skipIf(IS_BROWSER)(
    "root d.ts exports the factory and the service type, and no FromService factory",
    () => {
      const { exists, path, text } = builtFile("index.d.ts");
      expect(exists, `missing ${path}; run \`pnpm build\` first`).toBe(true);
      expect(text).toContain("createSiaNativeStreamProvider");
      expect(text).toContain("SiaNativeStreamService");
      expect(text).not.toContain("createSiaNativeStreamProviderFromService");
    },
  );

  it.skipIf(IS_BROWSER)(
    "a consumer passes a service with a concrete resolved-source type",
    () => {
      const { exists, path } = builtFile("index.js");
      expect(exists, `missing ${path}; run \`pnpm build\` first`).toBe(true);

      const consumer = `
import {
  createSiaNativeStreamProvider,
  type SiaNativeStreamProvider,
  type SiaNativeStreamService,
  type SiaNativeStreamSession,
} from ${JSON.stringify(path)};

interface PinnedObject {
  key: string;
}

class StreamService implements SiaNativeStreamService<PinnedObject> {
  isAvailable(signal?: AbortSignal): Promise<boolean> {
    return Promise.resolve(true);
  }
  resolve(src: string, signal?: AbortSignal): Promise<PinnedObject> {
    return Promise.resolve({ key: src });
  }
  session(source: PinnedObject, signal?: AbortSignal): SiaNativeStreamSession {
    return {
      url: (object, options) =>
        Promise.resolve({
          release: () => undefined,
          url: "https://streams.example/" + (object as PinnedObject).key,
        }),
    };
  }
}

const provider: SiaNativeStreamProvider =
  createSiaNativeStreamProvider(new StreamService());
void provider;
`;

      const diagnostics = compileConsumer(consumer);
      expect(
        messageTexts(diagnostics),
        "a service whose resolve and session share a concrete source type must compile against the built root entry",
      ).toEqual([]);
    },
  );

  it.skipIf(IS_BROWSER)(
    "a consumer still passes the dependency callback object",
    () => {
      const { exists, path } = builtFile("index.js");
      expect(exists, `missing ${path}; run \`pnpm build\` first`).toBe(true);

      const consumer = `
import {
  createSiaNativeStreamProvider,
  type SiaNativeStreamProvider,
} from ${JSON.stringify(path)};

const provider: SiaNativeStreamProvider = createSiaNativeStreamProvider({
  capability: () => Promise.resolve(true),
  resolveSource: (src) => Promise.resolve(src),
  createStreamSession: () => ({
    url: () =>
      Promise.resolve({
        release: () => undefined,
        url: "https://streams.example/objects/abc123",
      }),
  }),
});
void provider;
`;

      const diagnostics = compileConsumer(consumer);
      expect(
        messageTexts(diagnostics),
        "the dependency callback object must still compile against the built root entry",
      ).toEqual([]);
    },
  );
});
