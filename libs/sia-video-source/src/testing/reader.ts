/** Bridges scoped read ports to the video worker without replacing its media pipeline. */
import {
  createMockReader,
  type MockConnection,
  type ReadObject,
  type ReadPort,
} from "@lumeweb/sia-testing/client";
import type { SiaObjectLike } from "../ranged-reader.js";
import type { SiaVideoSdk } from "../worker-runtime.js";
export function createMockPlaybackSdk(
  indexerUrl: string,
  appSeed?: null | Uint8Array,
  sharingSeed?: null | Uint8Array,
): SiaVideoSdk {
  const target = new URL(
    indexerUrl.endsWith("/") ? indexerUrl : indexerUrl + "/",
  );
  const client = target.pathname.split("/").filter(Boolean).at(-1);
  if (!client) throw new Error("Mock reader URL has no client");
  const root = new URL("../", target).href;
  const routes = new WeakMap<SiaObjectLike, SiaVideoSdk>();
  function sdk(
    seed: null | Uint8Array | undefined,
    kind: "app-key" | "sharing-key",
  ) {
    if (!seed) return undefined;
    const keyHex = [...seed]
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
    const connection: MockConnection = { client: client!, kind, url: root };
    return createVideoReaderSdk(createMockReader(connection, { keyHex, kind }));
  }
  const app = sdk(appSeed, "app-key");
  const shared = sdk(sharingSeed, "sharing-key");
  async function resolve(route: SiaVideoSdk | undefined, id: string) {
    if (!route) throw new Error("The required playback credential is missing");
    const handle = await route.object(id);
    routes.set(handle, route);
    return handle;
  }
  return {
    async dispose() {
      await Promise.all([app?.dispose?.(), shared?.dispose?.()]);
    },
    download(object, range) {
      const route = routes.get(object);
      if (!route)
        return Promise.reject(
          new Error("Object belongs to another playback session"),
        );
      return route.download(object, range);
    },
    object: (id) => resolve(app, id),
    objectFromSharedKey: (id) => resolve(shared, id),
  };
}
export function createVideoReaderSdk(reader: ReadPort): SiaVideoSdk {
  const handles = new WeakMap<SiaObjectLike, ReadObject>();
  async function object(id: string) {
    const info = await reader.object(id);
    // The video byte source derives length from slabs, so an empty map would hide nonempty payloads.
    const handle: SiaObjectLike = {
      id: () => info.id,
      size: () => info.sizeBytes,
      slabs: () =>
        info.sizeBytes === 0
          ? []
          : [
              {
                encryptionKey: "",
                length: info.sizeBytes,
                minShards: 1,
                offset: 0,
                sectors: [],
                version: 1,
              },
            ],
    };
    handles.set(handle, info);
    return handle;
  }
  return {
    dispose: () => reader.close(),
    download(handle, range) {
      const info = handles.get(handle);
      if (!info)
        return Promise.reject(new Error("Object belongs to another reader"));
      return reader.download(info, range);
    },
    object,
    objectFromSharedKey: object,
  };
}
