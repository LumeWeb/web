# 0006: hand the Sia app-key seed to the worker via an X25519 encapsulation handshake

## Status

Accepted (2026-09-08; implemented in `libs/sia-video-source`)

Scope note: this decision covers credentials for the package's media-worker
SDK. ADR [0011](0011-backend-policy-and-native-stream-provider.md) records the
native-provider boundary; native playback does not use this worker handshake.

## Context

ADR [0002](0002-worker-owner-streaming-engine.md) places the entire Sia
engine, including the `@siafoundation/sia-storage` WASM SDK, in a
dedicated Web Worker. That SDK is keyed by a **Sia app-key seed**: a 32-byte
value that represents the user's master credential for Sia storage (exports
of an `AppKey` obtained from `@siafoundation/sia-storage` yield exactly these
bytes). The login flow produces this seed in an SDK living on the main
thread; the worker's own SDK instance is what actually reads ranged bytes
from the indexer. The seed therefore has to cross the worker boundary one
way for each worker handshake.

Two hard constraints shape how it crosses:

1. **The library must not retain the raw seed on a host field, in React state,
   or in browser storage.** The application renders with `src/react`; any prop,
   state, or field that carries the plaintext seed widens the code surface
   that can leak it into logs, devtools heap dumps, or persistence layers.
2. **The library must not require HTTPS-only platform crypto.** The player
   is deployable in plain-http origins and test harnesses where `crypto.subtle`
   is unavailable (Web Crypto's `SubtleCrypto` is restricted to Secure
   Contexts). A handshake that throws outside HTTPS would take the whole
   streaming path down with it.

An honest threat model dictates what this handshake can and cannot promise.
A Web Worker is a _threading_ boundary, not an absolute security boundary:
same-origin JavaScript can post arbitrary messages to the worker and invoke
its capabilities at any time. The design goal is therefore narrower and
limited to the library's own state: minimize how long the raw seed stays in
host memory and expose no protocol path that sends it back. This does not
protect against code that can call the seed supplier or inspect same-origin
JavaScript memory.

## Decision

The seed is delivered to the worker as an **X25519-static-recipient AEAD
envelope**, freshly encapsulated by the host for every handshake:

- **The worker owns its key material.** On the first `HELLO` it generates a
  static X25519 key pair from the platform CSPRNG (`crypto.getRandomValues`,
  which has no Secure Context requirement, unlike `crypto.subtle`),
  memoizes it for the worker's lifetime, and publishes **only the raw
  32-byte public key** inside `HELLO_OK` (ADR
  [0005](0005-custom-zero-copy-proto-over-comlink.md)'s wire protocol).
  The private half is never a protocol message, a config field, or an export
  return value; its confinement is a code contract on raw bytes instead of a
  platform `extractable` flag.
- **The host encapsulates, the application never sees ciphertext math.** The
  host's `SiaVideoSource` takes an application-supplied callback
  (`getAppKeySeed`) that closes over the _logged-in SDK reference_, not the
  key: at handshake time the callback asks that SDK to export its `AppKey`
  internally and hands over the 32-byte bytes for exactly one call. The
  plaintext exists briefly inside `#encryptAndSendSeed`, not on a host field
  or in React state. The host scrubs the returned buffer in a `finally` after
  building the envelope; it sends only the encrypted envelope.
- **The encapsulation itself** (`src/app-key-handshake.ts`): a fresh
  ephemeral X25519 key pair per envelope, ECDH against the worker's public
  key, HKDF-SHA-256 down to a 256-bit key (salt and info derived from a
  protocol context string), and AES-GCM over the seed with that same
  context string as **additional authenticated data**. The resulting
  `AppKeyEnvelope` (`ephemeralPublicKey`, `iv`, `ciphertext`) travels as the
  `APP_KEY` wire message. Binding the AEAD to the protocol context means an
  envelope made for a different key or protocol context fails integrity.
  The envelope is not bound to a unique `HELLO` or request, so this
  check does not prevent replay to the same worker. A fresh IV and
  ephemeral key per envelope make independently produced envelopes differ.
- **The worker decrypts internally and nothing reverses.** On `APP_KEY` the
  worker decrypts with its static private key and compares the result with
  the currently held seed. A matching seed keeps the connection; a changed
  seed replaces the old slot and invalidates the cached SDK on the next load.
  The worker scrubs the previous slot on replacement and at destroy. No
  protocol message, host field, or public export carries the seed or the
  worker's private key back out,
  and `WorkerConfig` structurally has no seed field at all (compile-time
  prevention, not a naming convention).
- **The host does not retain the plaintext seed.** The React layer passes a
  supplier, while the host briefly receives its bytes for encryption and
  sends an envelope across the typed wire protocol
  (ADR [0005](0005-custom-zero-copy-proto-over-comlink.md)).
- **All primitives are the pure-JS `noble` family**: `@noble/curves` for
  X25519, `@noble/hashes` for HKDF/SHA-256 and secure randomness,
  `@noble/ciphers` for AES-GCM. This is what removes the HTTPS/Secure-Context
  dependency: the handshake can run on plain-http origins where
  `crypto.getRandomValues` is available. Ed25519 is deliberately absent
  from the scheme: Ed25519 is a _signature_ algorithm and cannot perform
  encryption or ECDH. X25519 supplies the shared-secret step.

## Consequences

**Easier**

- The library sends only encrypted seed bytes to its worker; it does not
  store them in React state or browser storage. The application SDK that
  supplies the seed already holds the credential, and the host temporarily
  receives the exported bytes.
- The worker holds decrypted credential slots for its connection and scrubs
  them on replacement and destroy. The library's host scrubs its supplier's
  returned buffer after encryption; the application SDK may retain its own
  credential.
- The handshake does not call `crypto.subtle`, so it can run on a plain-http
  origin with a platform CSPRNG.
- AEAD context binding rejects tampered bytes or envelopes made for another
  key or protocol context. It does not reject a valid envelope replayed to
  the same worker.

**Harder**

- The transient main-thread exposure is unavoidable: for the moment between
  the SDK's internal export and the finished envelope, the plaintext exists
  in JS memory on the main thread (JS makes perfect zeroing impossible:
  runtimes may hold copies the code cannot reach). Same-origin code with
  access to the supplier or application SDK can also obtain the seed; the
  handshake does not protect against that code.
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

- The worker boundary this handshake rides on:
  [0005](0005-custom-zero-copy-proto-over-comlink.md)
- Why the seed consumer itself lives in a worker:
  [0002](0002-worker-owner-streaming-engine.md)
