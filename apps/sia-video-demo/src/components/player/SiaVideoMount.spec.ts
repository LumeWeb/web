import { describe, expect, it } from "vitest";
import { APP_META } from "../../lib/constants";
import type { ArmedPublishSource } from "./PublishEntryState";
import type { PublishAppKeySupplier } from "./PublishSuppliers";
import type {
  PublishSelectedSource,
  SharedSelectedSource,
} from "./SelectedSource";
import type { ArmedSharedSource } from "./SharedSourceState";
import type { SharedSharingKeySupplier } from "./SharedSuppliers";
import { siaVideoMountReloadKey, siaVideoMountState } from "./SiaVideoMount";

/**
 * Node unit tests for the Sia-player wiring helpers: the pure
 * `siaVideoMountState` (mount the selected source into the Video.js v10 Sia
 * shell) and the display-safe `siaVideoMountReloadKey` that drives the
 * in-place reload. The mount state also carries the centralized
 * developer-options output: the deterministic playback backend (auto while
 * native playback is enabled, worker-only `media-worker` once disabled) and
 * the demo native stream provider (built once from the demo stream service
 * through `createSiaNativeStreamProvider`). The React `SiaVideoMount`
 * component itself is not exercised here (it needs a `<Player>` DOM host);
 * only the pure derivations are pinned, exactly as the Sia status bridge
 * spec limits itself to its normalizers.
 */

const OBJECT_KEY =
  "a1b2c3d4e5f60718293a4b5c6d7e8f90112233445566778899aabbccddeeff01";
const OTHER_OBJECT_KEY =
  "ffeeddccbbaa99887766554433221100a1b2c3d4e5f60718293a4b5c6d7e8f90";
/** Opaque wire content for the mount. A fetch form is never parsed here. */
const FETCH_FORM = `sia://indexer.example/objects/${OBJECT_KEY}/shared#encryption_key=AQIDBAUGBwgJCgsMDQ4PEBESExQVFhcYGRobHB0eHyA`;
const SOURCE_ID = "11".repeat(32);
/** The same object re-armed under a DIFFERENT sharing key (a supplier change). */
const OTHER_SOURCE_ID = "22".repeat(32);

const INDEXER_URL = "https://indexer.example";
const OTHER_INDEXER_URL = "https://other-indexer.example";

/** A stand-in native stream provider; the mount must carry it through by identity. */
const NATIVE_STREAM_PROVIDER = {
  available: () => Promise.resolve(false),
  open: () => Promise.reject(new Error("no stream endpoint configured")),
} as const;

function appKeySupplier(): PublishAppKeySupplier {
  return { getAppKeySeed: () => Uint8Array.from([1, 2, 3]) };
}

/** The mount deps every derivation test routes: indexer + backend + provider. */
function mountDeps(overrides?: {
  backend?: "auto" | "media-worker";
  indexerUrl?: string;
}) {
  return {
    backend: overrides?.backend ?? "auto",
    indexerUrl: overrides?.indexerUrl ?? INDEXER_URL,
    nativeStreamProvider: NATIVE_STREAM_PROVIDER,
  };
}

function publishSource(
  supplier: null | PublishAppKeySupplier = appKeySupplier(),
  overrides?: null | Partial<ArmedPublishSource>,
): PublishSelectedSource {
  return {
    mode: "publish",
    source: {
      fetchForm: FETCH_FORM,
      indexerUrl: INDEXER_URL,
      objectKey: OBJECT_KEY,
      ...overrides,
    },
    supplier,
  };
}

function sharedSource(
  supplier: null | SharedSharingKeySupplier = sharingKeySupplier(),
  overrides?: null | Partial<ArmedSharedSource>,
): SharedSelectedSource {
  return {
    mode: "shared",
    source: { objectKey: OBJECT_KEY, sourceId: SOURCE_ID, ...overrides },
    supplier,
  };
}

function sharingKeySupplier(): SharedSharingKeySupplier {
  return { getSharingKeySeed: () => Uint8Array.from([4, 5, 6]) };
}

describe("siaVideoMountState (mount the selected Sia source)", () => {
  it("mounts no player for an unarmed selection", () => {
    expect(siaVideoMountState(null, mountDeps())).toBeNull();
  });

  it("routes the publish source: fetch-form src, app-key supplier only, current indexer config", () => {
    const supplier = appKeySupplier();
    const mount = siaVideoMountState(publishSource(supplier), mountDeps());
    expect(mount).not.toBeNull();
    expect(mount?.src).toBe(FETCH_FORM);
    expect(mount?.getAppKeySeed).toBe(supplier.getAppKeySeed);
    // Publish runs on the app key only; the sharing supplier never crosses.
    expect(mount?.getSharingKeySeed).toBeUndefined();
    expect(mount?.sia).toEqual({ app: APP_META, indexerUrl: INDEXER_URL });
  });

  it("keeps the player mounted for an armed publish source with no auth session", () => {
    const mount = siaVideoMountState(publishSource(null), mountDeps());
    expect(mount).not.toBeNull();
    expect(mount?.src).toBe(FETCH_FORM);
    expect(mount?.getAppKeySeed).toBeUndefined();
    expect(mount?.getSharingKeySeed).toBeUndefined();
  });

  it("routes the shared source: object-key src, sharing-key supplier only, current indexer config", () => {
    const supplier = sharingKeySupplier();
    const mount = siaVideoMountState(sharedSource(supplier), mountDeps());
    expect(mount).not.toBeNull();
    expect(mount?.src).toBe(OBJECT_KEY);
    expect(mount?.getSharingKeySeed).toBe(supplier.getSharingKeySeed);
    // Shared runs on the sharing key only; the app supplier never crosses,
    // even for an SSO/app-key session routed into shared mode.
    expect(mount?.getAppKeySeed).toBeUndefined();
    expect(mount?.sia).toEqual({ app: APP_META, indexerUrl: INDEXER_URL });
  });

  it("keeps the player mounted for an armed shared source with no sharing session", () => {
    const mount = siaVideoMountState(sharedSource(null), mountDeps());
    expect(mount).not.toBeNull();
    expect(mount?.src).toBe(OBJECT_KEY);
    expect(mount?.getSharingKeySeed).toBeUndefined();
    expect(mount?.getAppKeySeed).toBeUndefined();
  });

  it("uses the CURRENT indexer config for the worker connection, not the share's origin", () => {
    const mount = siaVideoMountState(
      publishSource(),
      mountDeps({
        indexerUrl: OTHER_INDEXER_URL,
      }),
    );
    expect(mount?.sia.indexerUrl).toBe(OTHER_INDEXER_URL);
    expect(mount?.sia.app).toBe(APP_META);
  });

  it("carries the auto backend and the demo native stream provider by identity", () => {
    const mount = siaVideoMountState(publishSource(), mountDeps());
    expect(mount?.backend).toBe("auto");
    expect(mount?.nativeStreamProvider).toBe(NATIVE_STREAM_PROVIDER);
  });

  it("carries the deterministic worker-only backend when native playback is disabled", () => {
    const mount = siaVideoMountState(
      publishSource(),
      mountDeps({ backend: "media-worker" }),
    );
    expect(mount?.backend).toBe("media-worker");
    expect(mount?.nativeStreamProvider).toBe(NATIVE_STREAM_PROVIDER);
  });
});

describe("siaVideoMountReloadKey (display-safe in-place reload identity)", () => {
  it("is stable for the same source and config", () => {
    const deps = { indexerUrl: INDEXER_URL };
    expect(siaVideoMountReloadKey(publishSource(), deps)).toBe(
      `publish|${OBJECT_KEY}|${INDEXER_URL}`,
    );
    expect(siaVideoMountReloadKey(sharedSource(), deps)).toBe(
      `shared|${OBJECT_KEY}|${SOURCE_ID}|${INDEXER_URL}`,
    );
  });

  it("changes when the indexer (worker config) changes, so a re-handshake ties to the new indexer", () => {
    const deps = { indexerUrl: INDEXER_URL };
    const nextDeps = { indexerUrl: OTHER_INDEXER_URL };
    expect(siaVideoMountReloadKey(publishSource(), deps)).not.toBe(
      siaVideoMountReloadKey(publishSource(), nextDeps),
    );
    expect(siaVideoMountReloadKey(sharedSource(), deps)).not.toBe(
      siaVideoMountReloadKey(sharedSource(), nextDeps),
    );
  });

  it("changes when the selected publish object changes", () => {
    expect(
      siaVideoMountReloadKey(publishSource(), { indexerUrl: INDEXER_URL }),
    ).not.toBe(
      siaVideoMountReloadKey(
        publishSource(undefined, { objectKey: OTHER_OBJECT_KEY }),
        { indexerUrl: INDEXER_URL },
      ),
    );
  });

  it("changes when the sharing-key supplier swaps for the SAME object (reload re-reads the seed)", () => {
    // Same object key, different sourceId (a re-armed digest under a new
    // sharing key) must bump the reload so the handshake re-reads the seed.
    expect(
      siaVideoMountReloadKey(sharedSource(), { indexerUrl: INDEXER_URL }),
    ).not.toBe(
      siaVideoMountReloadKey(
        sharedSource(undefined, { sourceId: OTHER_SOURCE_ID }),
        { indexerUrl: INDEXER_URL },
      ),
    );
  });

  it("changes when the selected shared object changes (even without a digest change)", () => {
    expect(
      siaVideoMountReloadKey(sharedSource(), { indexerUrl: INDEXER_URL }),
    ).not.toBe(
      siaVideoMountReloadKey(
        sharedSource(undefined, { objectKey: OTHER_OBJECT_KEY }),
        { indexerUrl: INDEXER_URL },
      ),
    );
  });

  it("carries the mode so a publish <-> shared switch re-handshakes", () => {
    const deps = { indexerUrl: INDEXER_URL };
    expect(siaVideoMountReloadKey(publishSource(), deps)).not.toBe(
      siaVideoMountReloadKey(sharedSource(), deps),
    );
  });

  it("is display-safe: publish never embeds the fetch form or its encryption key", () => {
    const reloadKey = siaVideoMountReloadKey(publishSource(), {
      indexerUrl: INDEXER_URL,
    });
    expect(reloadKey).not.toContain(FETCH_FORM);
  });
});
