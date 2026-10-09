# 0005: define a typed wire protocol instead of Comlink

## Status

Accepted (2026-09-08; implemented in `libs/sia-video-source`)

## Context

The worker must push media chunks, progress, lifecycle facts, and errors without
waiting for a host RPC call. Chunk buffers also need an explicit transfer policy.
Loads can supersede one another, so every asynchronous reply needs request
identity that the host can check.

## Decision

The worker boundary uses the discriminated unions in `src/protocol.ts`, not
Comlink. `PROTOCOL_VERSION` is currently `0`. Runtime guards validate every
incoming message before it reaches the session state machine.

The main-to-worker union contains `HELLO`, `APP_KEY`, `ATTACH`, `DETACH`,
`SOURCE`, `PLAY`, `SEEK`, `BUFFERED_STATE`, `PLAYHEAD`, and `DESTROY`. The
worker-to-main union contains `HELLO_OK`, `ATTACH_OK`, `SOURCE_OK`, `HANDLE`,
`CHUNK`, `PROGRESS`, `ENDED`, `ERROR`, and `LOG`. Optional additive
fields, including credential presence metadata, remain compatible with the
current protocol version.

`nextRequestId()` allocates load identity on the host. The host filters source,
chunk, progress, handle, and error messages against its current request. The
session coordinator posts chunk data from its transfer path in
`src/session/session-coordinator.ts`; a conditional slice gives a chunk its own
buffer before transfer when the source view does not own its backing buffer.
`HANDLE` transfers the worker MSE handle directly.

`DEFAULT_FMP4_MIME` and error kinds live in the protocol module so worker and
host MSE paths share the same values. The protocol also carries worker log
milestones when the host opts into a logger threshold; the worker caps that
stream at 256 messages per connection.

## Consequences

Push messages and request-scoped data match the playback pipeline directly.
Transfer behavior is visible at the call site, and malformed or foreign
messages are rejected before state changes.

The unions, runtime guards, and tests must change together when a message is
added. Consumers that construct a worker or composition themselves must use the
exported protocol types and current version. A future protocol change needs a
new ADR or a superseding note here.

## Related ADRs

- Worker ownership: [0002](0002-worker-owner-streaming-engine.md)
- Conversion output: [0003](0003-mse-fmp4-remux-and-unsupported-format.md)
- Ranged reads: [0004](0004-ranged-seeking-and-deferred-seek.md)
- Media contract: [0001](0001-custom-media-contracts.md)
