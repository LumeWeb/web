# 0008 — keyless share-link streaming via `SharedSdk`

## Status

Accepted (2026; implemented in `libs/sia-video-source`)

## Context

ADR [0007](0007-sia-share-url-src.md) made a full Sia share URL a first-class
`src` value: the worker parses the signed URL, resolves it through the SDK,
and streams the object. But that ADR explicitly recorded a hard limitation —
**a share URL grants decryption, not payment** — so share-URL playback still
required the app-key handshake of ADR
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
  Node) — `SharingKey.seed()` / `SharingKey.fromSeed(seed)` /
  `SharedSdk.connect(indexerUrl, seed)`.

The API bump is breaking in a narrow, mechanical way: `Sdk.sharedObject(url)`
became `Sdk.objectFromShareUrl(url)` and `Sdk.shareObject(object, date)` became
`Sdk.objectShareUrl(object, date)` (a *different* `Sdk.shareObject(key, object)`
was introduced for attaching objects to a sharing key).

## Decision

Keyless share-link playback is enabled by adopting `@siafoundation/sia-storage`
`^0.1.0` and routing share URLs through `SharedSdk` when a sharing-key seed is
available. The existing handshake machinery is extended, **not replaced**.

### 1. Dep bump and mechanical renames

`@siafoundation/sia-storage` moves from `^0.0.14` to `^0.1.0`. The SDK seams
that named the old methods are renamed to the new API: `SiaSdkLike`/worker
seams drop `sharedObject?` in favor of `objectFromShareUrl?`. No `.wasm`-loading
requirement changed — `0.1.0` loads `sia_storage_wasm_bg.wasm` identically via
`new URL(..., import.meta.url)` — and the `PinnedObject`/`DownloadOptions`
shapes are structurally unchanged, so the downstream `RangedReader` streaming
code is untouched.

### 2. The `APP_KEY` envelope gains a plaintext `keyType` tag — no new message

The existing X25519-static-recipient AEAD envelope (ADR 0006) is reused
unchanged for the sharing seed, with one addition to the envelope payload:

```ts
interface AppKeyEnvelope {
  ciphertext: Uint8Array;
  ephemeralPublicKey: Uint8Array;
  iv: Uint8Array;
  keyType?: 'app' | 'sharing'; // absent = 'app' (backward compatible)
}
```

`keyType` is **plaintext routing metadata, never secret**: it only tells the
worker which of its two seed slots (`seed` for the app key, `sharingSeed` for
the sharing key) to decrypt into. It is deliberately **not** added to the
AEAD's associated data — mutating the tag only changes which slot a reject
lands in, never the seed bytes. `encryptToWorker(publicKey, seed, keyType?)`
and the `isAppKeyEnvelope`/`isMainToWorkerMessage` guards learn the field,
with the default `'app'` keeping the wire byte-identical to ADR 0006 for
existing apps. The worker handshake stores the two credentials in **separate
slots**; a HELLO config change, a HELLO presence flag declaring a slot absent,
or `dispose` scrubs the affected slot(s).

The `HELLO` message gains the same additive treatment as the envelope tag: two
optional **presence booleans**, `appSeed?: boolean` and `sharingSeed?:
boolean`, declaring whether the host will supply each credential over a
subsequent `APP_KEY`. This is **metadata only, never the seeds themselves**.
Its purpose is scrubbing: a host that *removes* `getSharingKeySeed` (or
`getAppKeySeed`) but re-attaches with an **identical** `WorkerConfig` must not
leave the worker holding a stale — possibly revoked — seed slot (the worker
cannot otherwise tell "provider removed" from "envelope not yet arrived"). A
`false` flag scrubs that slot; `true` keeps it; an absent flag (an old-protocol
host) makes no claim. `PROTOCOL_VERSION` stays `0` (additive optional fields).

### 3. Sharing-key seed discipline

The sharing seed obeys exactly the ADR 0006 rules for the app-key seed:

- It never travels plaintext — only inside the AEAD envelope.
- It never appears in `WorkerConfig` (which stays structurally seed-free for
  *both* credential classes), never in URLs, never in React state, and never
  on host fields.
- The host holds only a **supplier function** (`getSharingKeySeed?:
  AppKeySeedProvider`, mirroring `getAppKeySeed`) per render/attach, reads it
  once at `HELLO_OK`, encapsulates, and **scrubs** the returned bytes in a
  `finally`.
- On the worker it is hex-encoded to the browser `SharedSdk.connect` form
  only inside the isolate, at the call site.

The threat distinction is central to the decision: the sharing key is a
**scoped, expirable, revocable, read-only** credential specifically designed
to be handed out — while the app key is a **full-account** credential. The
same envelope hygiene is cheap and keeps both out of the main-thread runtime
surface, but the *blast radius* of a leaked sharing seed is bounded to the
attached objects for the key's lifetime, versus total account control for the
app-key seed. The same revocation-facing reasoning drives the HELLO presence
flags: a sharing seed the host stops supplying (key revoked/expired by the
owner) must be scrubbed worker-side promptly — the worker should not keep a
live `SharedSdk` attached to a credential the host no longer vouches for —
even when the connection metadata otherwise re-attached unchanged. Both seeds
therefore carry the same "scrub when the provider disappears" hygiene, keeping
the blast radius of a dropping provider effectively nil.

### 4. Worker resolution order

`createDefaultSdk` builds the connection SDK by credential, and the byte-source
seam stays source-agnostic (it only ever calls `object` / `objectFromShareUrl`):

1. **Both seeds present** → return a routing adapter that resolves by source
   kind: a plain `src` object key → the app-key `Sdk.object(key)` (the object
   is pinned under the app account), and a share-URL `src` →
   `SharedSdk.object(parseSiaShareUrl(src).objectKey)` (the object is attached
   to the sharing key; the sharing key decrypts and the owner pays). The two
   SDKs connect **lazily, per route**: nothing connects at `createDefaultSdk`;
   the app-key SDK connects on the first plain-object resolution and the
   `SharedSdk` on the first share-URL resolution, each memoized (a failed
   connect is not cached — a later resolution reattempts). A dual-seed app
   playing only one source kind therefore pays zero connection/WASM-object
   cost for the unused credential. Tradeoff vs. the single-credential paths
   (which stay eager — with exactly one thing to validate, fail-fast is the
   cheapest way to surface an unregistered key): the eager fast-fail on
   createDefaultSdk disappears, so an unregistered key surfaces on its route's
   first source resolution, which stream-controller's error reporting already
   handles. Share URLs never silently degrade to app-key resolution. Download
   routing follows the resolver (each resolved object remembers which SDK it
   came from), and the adapter's disposal releases, exactly once through one
   release-once latch, only the SDKs that actually connected (an untouched
   route is never connected just to clean it up).
2. **Sharing seed only** → `SharedSdk.connect(config.indexerUrl, hex(seed))`,
   wrapped in an adapter whose `objectFromShareUrl(fetchForm)` delegates to
   `SharedSdk.object(objectKey)` — id-based, never URL-based.
3. **App-key seed only** → `Builder.connected(...)`; a share-URL `src` resolves
   through `sdk.objectFromShareUrl(share.fetchForm)` (the renamed
   `Sdk.sharedObject`), the ADR 0007 path, unchanged; a non-share `src`
   resolves through `sdk.object(key)`.
4. **Nothing fits** (no seed at all) → the descriptive
   "No Sia SDK is available: complete the HELLO + APP_KEY handshake or inject
   createSdk." error, as today.

The both-seeds routing replaces an earlier "sharing seed takes precedence"
rule that resolved *every* `src` through the `SharedSdk` — which silently broke
plain pinned-key `src` values (objects not attached to the sharing key). With
the routing adapter each source kind reaches the credential that can read it.
Both secrets are covered by the same connection memoization/scrub semantics in
`createLazySiaByteSourceFactory` (config + app-key seed + sharing seed **value**
all gate the memoized SDK), so a seed slot scrubbed by a HELLO presence flag
invalidates the memo key and the next `SOURCE` rebuilds (and disposes) the
previous SDK.

### 5. Public surface

- `SiaVideoSourceOptions` + `SiaVideoSource` gain `getSharingKeySeed?:
  AppKeySeedProvider` (per-render setter, same one-time-envelope semantics as
  `getAppKeySeed`).
- React `<SiaVideo>` gains the `getSharingKeySeed?: AppKeySeedProvider` prop,
  forwarded unconditionally each render like `getAppKeySeed`.

## Consequences

**Easier**

- A share link is now sufficient for playback: no app key, no SSO/approval,
  no account on the recipient side. This unlocks the "public share → inline
  player" use case outright.
- The handshake protocol change is additive and backward compatible: old
  hosts (no `keyType` tag) still drive the `'app'` slot exactly as ADR 0006
  specified; `PROTOCOL_VERSION` does not bump.
- The worker/byte-source seam stays source-agnostic; the `SharedSdk` adapter
  hides the id-vs-URL resolution, and the streaming pipeline is untouched.
- Revocation semantics are the key's own: the owner can expire or revoke, so
  a forwarded link has a bounded, revocable lifetime — strictly better than
  the shared URL's key material alone.

**Harder**

- Two credentials now live in the worker handshake; each must be scrubbed on
  replacement/dispose independently (a HELLO presence flag declaring a slot
  absent included), and the memoization gate for the SDK must compare both
  *values* (a stale sharing seed must never cache a newer connection, and a
  scrubbed slot must invalidate the memo so the next load rebuilds).
- With both seeds present, the per-route SDKs connect (and are held) only when
  their source kind is actually used; the routing adapter releases exactly the
  SDKs that connected, once, on dispose, and a config change that flips
  credential modes rebuilds (and disposes) the previous SDK set — the same
  cost the single-credential paths already pay.
- The seed hand-off is duplicated: whatever a caller does to obtain the
  sharing seed (fetch from a key-exchange service, parse from email, etc.)
  inherits the ADR 0006 supplier discipline — supplier function, never stored
  value.
- The browser-vs-Node seed encoding differs (`string` hex vs `Buffer`). This
  package is browser/worker-only, so the worker hex-encodes at the
  `SharedSdk.connect` call site; anyone reusing the seam on Node must pass a
  `Buffer` instead.

**Out of scope**

- Creating/attaching/revoking sharing keys (owner-side operations) — those
  are `Sdk` features this playback library does not expose; consumers use the
  raw `@siafoundation/sia-storage` SDK for key management, as they do for app
  registration.

## Related ADRs

- The app-key handshake this extension rides on →
  [0006](0006-app-key-handshake-to-worker.md)
- The share-URL `src` support this replaces the payment requirement of →
  [0007](0007-sia-share-url-src.md)
- Why the worker owns the SDK at all →
  [0002](0002-worker-owner-streaming-engine.md)
- The typed worker wire protocol →
  [0005](0005-custom-zero-copy-proto-over-comlink.md)
