# 0006 — hand the Sia app-key seed to the worker via an X25519 encapsulation handshake

## Status

Accepted (2026-09-08; implemented in `libs/sia-video-source`)

## Context

ADR [0002](0002-worker-owner-streaming-engine.md) places the entire Sia
engine — including the `@siafoundation/sia-storage` WASM SDK — in a
dedicated Web Worker. That SDK is keyed by a **Sia app-key seed**: a 32-byte
value that represents the user's master credential for Sia storage (exports
of an `AppKey` obtained from `@siafoundation/sia-storage` yield exactly these
bytes). The login flow produces this seed in an SDK living on the main
thread; the worker's own SDK instance is what actually reads ranged bytes
from the indexer. The seed therefore has to cross the worker boundary one
way, once per connection.

Two hard constraints shape how it crosses:

1. **The raw seed must not live on the main thread, in the React layer, or
   in browser storage.** The application renders with `src/react`; any prop,
   state, or field that carries the plaintext seed widens the code surface
   that can leak it into logs, devtools heap dumps, or persistence layers.
2. **The library must not require HTTPS-only platform crypto.** The player
   is deployable in plain-http origins and test harnesses where `crypto.subtle`
   is unavailable (Web Crypto's `SubtleCrypto` is restricted to Secure
   Contexts). A handshake that throws outside HTTPS would take the whole
   streaming path down with it.

An honest threat model dictates what this handshake can and cannot promise.
A Web Worker is a *threading* boundary, not an absolute security boundary:
same-origin JavaScript can post arbitrary messages to the worker and invoke
its capabilities at any time. The design goal is therefore narrower and
statically checkable — **minimize the raw-key-material exposure and lifetime
on the main thread, and make extraction out of the main thread's runtime
surface impossible by construction** — rather than claiming absolute
containment against arbitrary same-origin code.

## Decision

The seed is delivered to the worker as an **X25519-static-recipient AEAD
envelope**, freshly encapsulated by the host for every handshake:

- **The worker owns its key material.** On the first `HELLO` it generates a
  static X25519 key pair from the platform CSPRNG (`crypto.getRandomValues`,
  which — unlike `crypto.subtle` — has no Secure Context requirement),
  memoizes it for the worker's lifetime, and publishes **only the raw
  32-byte public key** inside `HELLO_OK` (ADR
  [0005](0005-custom-zero-copy-proto-over-comlink.md)'s wire protocol).
  The private half is never a protocol message, a config field, or an export
  return value; its confinement is a code contract on raw bytes instead of a
  platform `extractable` flag.
- **The host encapsulates, the application never sees ciphertext math.** The
  host's `SiaVideoSource` takes an application-supplied callback
  (`getAppKeySeed`) that closes over the *logged-in SDK reference*, not the
  key: at handshake time the callback asks that SDK to export its `AppKey`
  internally and hands over the 32-byte bytes for exactly one call. The
  plaintext exists only inside `#encryptAndSendSeed` — never on a field,
  never in React state, never in a message sent anywhere unencrypted — and
  is scrubbed (zeroed) in a `finally` after the envelope is built.
- **The encapsulation itself** (`src/app-key-handshake.ts`): a fresh
  ephemeral X25519 key pair per envelope, ECDH against the worker's public
  key, HKDF-SHA-256 down to a 256-bit key (salt and info derived from a
  protocol context string), and AES-GCM over the seed with that same
  context string as **additional authenticated data**. The resulting
  `AppKeyEnvelope` (`ephemeralPublicKey`, `iv`, `ciphertext`) travels as the
  `APP_KEY` wire message. Binding the AEAD to the protocol context means an
  envelope from a foreign context — or replayed outside this handshake —
  fails integrity; a fresh IV/ephemeral key per envelope makes identical
  seeds produce unlinkable wire bytes.
- **The worker decrypts internally and nothing reverses.** On `APP_KEY` the
  worker encapsulates down with its static private key, compares with the
  currently-held seed, and either keeps the SDK alive (same seed) or
  invalidates the connection (new seed) — the previous plaintext copy is
  scrubbed on replacement and at destroy. No protocol message, host field,
  or public export carries the seed or the worker's private key back out,
  and `WorkerConfig` structurally has no seed field at all (compile-time
  prevention, not a naming convention).
- **The player never holds the plaintext seed.** The v10 host classes
  (ADR [0001](0001-custom-media-contracts.md)) and React layer see only the
  opaque envelope flow across the existing typed wire protocol
  (ADR [0005](0005-custom-zero-copy-proto-over-comlink.md)).
- **All primitives are the pure-JS `noble` family** — `@noble/curves` for
  X25519, `@noble/hashes` for HKDF/SHA-256 and secure randomness,
  `@noble/ciphers` for AES-GCM. This is what removes the HTTPS/Secure-Context
  dependency outright: the handshake works in plain-http realms, workers, and
  test environments alike, with small, pure-JS, easily inspectable
  implementations instead of platform calls. Ed25519 is deliberately absent
  from the scheme: Ed25519 is a *signature* algorithm and cannot perform
  encryption or ECDH — X25519, the Diffie-Hellman sibling of the same curve
  family, is the correct primitive for the shared-secret step.

## Consequences

**Easier**

- The plaintext seed never crosses the wire, never enters application or
  React code, and never lands in browser storage. The host's retained state
  and every logged message contain, at most, ciphertext.
- After the handoff the seed lives only inside the worker isolate, reduced to
  one current copy that is scrubbed on replacement and on destroy — the
  key-material lifetime on the main thread is bounded to the single
  export-and-encrypt call window.
- No HTTPS dependency: `crypto.subtle` is never touched, so the handshake is
  identical in plain-http deployments and test runs, and the crypto stack is
  small, pure JS, and independently reviewable.
- AEAD context binding turns "wrong worker / wrong protocol / tampered
  bytes" into a hard rejection with no partial plaintext, keeping repeat
  attaches cheap while foreign envelopes stay inert.

**Harder**

- The transient main-thread exposure is unavoidable: for the moment between
  the SDK's internal export and the finished envelope, the plaintext exists
  in JS memory on the main thread (JS makes perfect zeroing impossible —
  runtimes may hold copies the code cannot reach). A same-origin attacker
  active at exactly that window could still observe the seed; this design
  shrinks the window and the reachable surface, it does not close it.
- The seed exists in plaintext in the worker isolate for the worker's
  lifetime; a compromise that escapes the worker's code entirely could read
  it. The boundary is a discipline enforced by message guards and the
  absence of export paths, not a kernel-level guarantee.
- The native `CryptoKey` opacity that WebCrypto would have provided is gone:
  the X25519 private key is plain bytes, so the "never leaves the worker"
  property is maintained by code review and the type surface rather than the
  platform.
- The `noble` family (`@noble/curves`, `@noble/hashes`, `@noble/ciphers`)
  becomes a direct dependency of a user-facing playback library, with the
  usual supply-chain review obligation.
- The handshake protocol is now part of the wire dialect of
  [0005](0005-custom-zero-copy-proto-over-comlink.md): `HELLO_OK`'s public
  key and the `APP_KEY` envelope shape must evolve in lockstep with
  `PROTOCOL_VERSION`, and the handshake primitives carry their own test
  obligations (round trip, fresh ephemeral material, tamper rejection,
  structural rejection, scrubbing).

**Out of scope**

- Persisting the seed across page reloads is explicitly not covered here:
  every new connection re-runs the handshake from the SDK holding the login
  credential, and nothing in this design stores or caches the key material
  in any durable form.

**Follow-on ADRs**

- The worker boundary this handshake rides on →
  [0005](0005-custom-zero-copy-proto-over-comlink.md)
- Why the seed consumer itself lives in a worker →
  [0002](0002-worker-owner-streaming-engine.md)
