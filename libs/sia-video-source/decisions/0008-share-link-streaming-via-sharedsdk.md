# 0008: keyless share-link streaming via `SharedSdk`

## Status

Accepted (2026; implemented in `libs/sia-video-source`)

The SDK 0.1.0 change below records the version that introduced `SharedSdk`.
The package currently declares `@siafoundation/sia-storage` 0.2.0. Bare
shared object keys can also select the sharing route with the `SOURCE` field
`sourceKind: 'shared'`; URL shape is not the only routing signal.

## Context

ADR [0007](0007-sia-share-url-src.md) made a full Sia share URL a first-class
`src` value. The worker parses the signed URL, resolves it through the SDK,
and streams the object. At the time, that decision recorded a limitation:
a share URL carried the decryption key but not download authorization, so
share-URL playback still required the app-key handshake of ADR
[0006](0006-app-key-handshake-to-worker.md) to fund the downloads. A caller
who only holds a share link (no Sia app credential, no SSO/approval flow)
could not play anything, because `@siafoundation/sia-storage` `0.0.14` had no
credential-less read path.

`@siafoundation/sia-storage` `0.1.0` adds exactly that primitive: a
`SharedSdk` that authenticates with a **sharing key** rather than an app key.
A sharing key is a separate credential from the account's app key:

- It is **created by the account owner** (`Sdk.createSharingKey`) and attached
  to specific objects (`Sdk.shareObject(key, object)`); the recipient gets
  only the key's 32-byte **seed**.
- It grants **read-only** access to exactly the attached objects.
- It is **expiring and revocable**: the owner sets an expiry and can
  `Sdk.revokeSharingKey` (or `Sdk.unshareObject` / the key expiry) to cut off
  recipients.
- Downloads are **paid for by the owner**; recipients never need an account.
- The seed is exchanged as a **hex string on the browser** build (`Buffer` on
  Node): `SharingKey.seed()` / `SharingKey.fromSeed(seed)` /
  `SharedSdk.connect(indexerUrl, seed)`.

The API bump is breaking in a narrow, mechanical way: `Sdk.sharedObject(url)`
became `Sdk.objectFromShareUrl(url)` and `Sdk.shareObject(object, date)` became
`Sdk.objectShareUrl(object, date)` (a _different_ `Sdk.shareObject(key, object)`
was introduced for attaching objects to a sharing key).

## Decision

Keyless share-link playback is enabled by adopting `@siafoundation/sia-storage`
`^0.1.0` and routing share URLs through `SharedSdk` when a sharing-key seed is
available. The existing handshake machinery is extended, **not replaced**.

### 1. Dep bump and mechanical renames

`@siafoundation/sia-storage` moves from `^0.0.14` to `^0.1.0`. The SDK boundaries
that named the old methods are renamed to the new API: `SiaSdkLike`/worker
boundaries drop `sharedObject?` in favor of `objectFromShareUrl?`. No `.wasm`-loading
requirement changed: `0.1.0` loads `sia_storage_wasm_bg.wasm` identically via
`new URL(..., import.meta.url)`. At that migration, the `PinnedObject` and
`DownloadOptions` shapes did not require changes to `RangedReader`.

### 2. The `APP_KEY` envelope gains a plaintext `keyType` tag: no new message

The existing X25519-static-recipient AEAD envelope (ADR 0006) is reused
unchanged for the sharing seed, with one addition to the envelope payload:

```ts
interface AppKeyEnvelope {
  ciphertext: Uint8Array;
  ephemeralPublicKey: Uint8Array;
  iv: Uint8Array;
  keyType?: "app" | "sharing"; // absent = 'app' (backward compatible)
}
```

`keyType` is **plaintext routing metadata, never secret**: it only tells the
worker which of its two seed slots (`seed` for the app key, `sharingSeed` for
the sharing key) to decrypt into. It is deliberately **not** added to the
AEAD's associated data. Changing the tag does not change the decrypted
bytes, but can route a valid seed into the wrong slot; `keyType` is not an
authenticated statement about which credential the bytes represent.
`encryptToWorker(publicKey, seed, keyType?)` and the
`isAppKeyEnvelope`/`isMainToWorkerMessage` guards accept the field,
with the default `'app'` keeping the wire byte-identical to ADR 0006 for
existing apps. The worker handshake stores the two credentials in **separate
slots**; a HELLO config change, a HELLO presence flag declaring a slot absent,
or `dispose` scrubs the affected slot(s).

The `HELLO` message gains the same additive treatment as the envelope tag: two
optional presence booleans, `appSeed?: boolean` and
`sharingSeed?: boolean`, declaring whether the host will supply each credential over a
subsequent `APP_KEY`. This is **metadata only, never the seeds themselves**.
Its purpose is scrubbing: a host that _removes_ `getSharingKeySeed` (or
`getAppKeySeed`) but re-attaches with an **identical** `WorkerConfig` must not
leave the worker holding a stale, possibly revoked seed slot (the worker
cannot otherwise tell "provider removed" from "envelope not yet arrived"). A
`false` flag scrubs that slot; `true` keeps it; an absent flag (an old-protocol
host) makes no claim. `PROTOCOL_VERSION` stays `0` (additive optional fields).

### 3. Sharing-key seed discipline

The sharing seed obeys exactly the ADR 0006 rules for the app-key seed:

- It never travels plaintext: only inside the AEAD envelope.
- It never appears in `WorkerConfig` (which stays structurally seed-free for
  _both_ credential classes), never in React state, and never on host fields.
  The sharing seed is separate from the decryption key embedded in a share URL.
- The host holds only a supplier function (`getSharingKeySeed?:
  AppKeySeedProvider`, mirroring `getAppKeySeed`) per render/attach, reads it
  once at `HELLO_OK`, encapsulates, and **scrubs** the returned bytes in a
  `finally`.
- On the worker it is hex-encoded to the browser `SharedSdk.connect` form
  only inside the isolate, at the call site.

The threat distinction is central to the decision: the sharing key is a
**scoped, expirable, revocable, read-only** credential specifically designed
to be handed out, while the app key is a full-account credential. The
host briefly receives each seed from its supplier before encrypting it.
A leaked sharing seed grants access to the
attached objects for the key's lifetime; a leaked app-key seed grants broader
account access. The same revocation-facing reasoning drives the HELLO presence
flags: a sharing seed the host stops supplying (key revoked/expired by the
owner) must be scrubbed when the host declares it absent on `HELLO`, even
when the connection config is unchanged. An already active download can still
hold a lease on its SDK until cancellation settles; scrubbing the seed slot
does not revoke an active remote sharing key.

### 4. Worker resolution order

`createDefaultSdk` builds the connection SDK by credential, and the byte-source
boundary resolves according to URL shape or explicit `sourceKind`:

1. **Both seeds present**: return a routing adapter that resolves by source
   kind: a plain `src` object key uses the app-key `Sdk.object(key)` (the object
   is pinned under the app account), and a share-URL `src`:
   `SharedSdk.object(parseSiaShareUrl(src).objectKey)` (the object is attached
   to the sharing key; the sharing key decrypts and the owner pays). An explicit
   `sourceKind: 'shared'` also routes a bare object key through
   `SharedSdk.object(key)`. Neither SDK connects at `createDefaultSdk`.
   Each connects on the first resolution through its route, including a bare
   shared key with `sourceKind: 'shared'`. Failed connections are retried on
   later resolutions. Single-credential paths connect eagerly to report an
   unregistered key before source resolution. With both seeds, this check
   waits until the relevant route is used, and an unregistered key fails
   on that route's first source resolution. With both seeds, share URLs do
   not fall back to app-key resolution. Download routing follows the resolver (each resolved object remembers which SDK it
   came from), and the adapter's disposal releases, exactly once through one
   release-once latch, only the SDKs that actually connected (an untouched
   route is never connected just to clean it up).
2. **Sharing seed only**: `SharedSdk.connect(config.indexerUrl, hex(seed))`,
   wrapped in an adapter whose `objectFromShareUrl(fetchForm)` passes through to
   `SharedSdk.object(objectKey)`, using the parsed key rather than the URL.
3. **App-key seed only**: `Builder.connected(...)`; a share-URL `src` resolves
   through `sdk.objectFromShareUrl(share.fetchForm)` (the renamed
   `Sdk.sharedObject`), the ADR 0007 path, unchanged; a non-share `src`
   resolves through `sdk.object(key)`.
4. **No seed**: the descriptive
   "No Sia SDK is available: complete the HELLO + APP_KEY handshake or inject
   createSdk." error, as today.

The both-seeds routing replaces an earlier "sharing seed takes precedence"
rule that resolved _every_ `src` through the `SharedSdk`, which broke
plain pinned-key `src` values (objects not attached to the sharing key). With
the routing adapter each source kind reaches the credential that can read it.
Both secrets are covered by the same connection memoization/scrub semantics in
`createLazySiaByteSourceFactory` (config + app-key seed + sharing seed **value**
all check the memoized SDK), so a seed slot scrubbed by a HELLO presence flag
invalidates the memo key and the next `SOURCE` rebuilds (and disposes) the
previous SDK.

### 5. Public surface

- `SiaVideoSourceOptions` and `SiaVideoSource` gain the per-render
  `getSharingKeySeed` setter, with the same envelope flow as `getAppKeySeed`.
- React `<SiaVideo>` gains the `getSharingKeySeed?: AppKeySeedProvider` prop,
  forwarded unconditionally each render like `getAppKeySeed`.

## Consequences

**Easier**

- A recipient with a share link and the corresponding sharing-key seed can
  play without an app key or recipient account. The URL alone does not grant
  download authorization.
- The handshake protocol change is additive and backward compatible: old
  hosts (no `keyType` tag) still drive the `'app'` slot exactly as ADR 0006
  specified; `PROTOCOL_VERSION` does not bump.
- The byte-source boundary selects `object`, `objectFromShareUrl`, or
  `objectFromSharedKey` from the URL and optional source kind. The media
  conversion pipeline does not depend on which credential resolved the object.
- The owner can expire or revoke a sharing key. Revocation is enforced by
  the storage service; scrubbing a seed slot does not revoke the key.

**Harder**

- Two credentials now live in the worker handshake; each must be scrubbed on
  replacement/dispose independently (a HELLO presence flag declaring a slot
  absent included), and the memoization check for the SDK must compare both
  _values_ (a stale sharing seed must never cache a newer connection, and a
  scrubbed slot must invalidate the memo so the next load rebuilds).
- With both seeds present, the per-route SDKs connect (and are held) only when
  their source kind is actually used; the routing adapter releases exactly the
  SDKs that connected, once, on dispose, and a config change that flips
  credential modes rebuilds (and disposes) the previous SDK set. The same
  connection rebuild applies to single-credential paths.
- The seed hand-off is duplicated: whatever a caller does to obtain the
  sharing seed (fetch from a key-exchange service, parse from email, etc.)
  inherits the ADR 0006 supplier discipline: supplier function, never stored
  value.
- The browser-vs-Node seed encoding differs (`string` hex vs `Buffer`). This
  package runs in browsers and workers, so the worker hex-encodes at the
  `SharedSdk.connect` call site; anyone reusing the boundary on Node must pass a
  `Buffer` instead.

**Out of scope**

- Creating/attaching/revoking sharing keys (owner-side operations): those
  are `Sdk` features this playback library does not expose; consumers use the
  raw `@siafoundation/sia-storage` SDK for key management, as they do for app
  registration.

## Related ADRs

- The app-key handshake this extension rides on:
  [0006](0006-app-key-handshake-to-worker.md)
- The share-URL `src` support this replaces the payment requirement of:
  [0007](0007-sia-share-url-src.md)
- Why the worker owns the SDK at all:
  [0002](0002-worker-owner-streaming-engine.md)
- The typed worker wire protocol:
  [0005](0005-custom-zero-copy-proto-over-comlink.md)
