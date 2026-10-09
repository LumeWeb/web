# 0003: accept CMAF output for MSE and reject unsupported media

## Status

Accepted (2026-09-08; implemented in `libs/sia-video-source`)

Scope note: this decision covers media-worker inspection, conversion, and MSE
appends. ADR [0011](0011-backend-policy-and-native-stream-provider.md) covers
native provider URLs, which bypass this conversion path.

## Context

MSE accepts media only when the browser supports the codec-qualified output
MIME and the appended bytes follow the expected fragmented format. Sia objects
have no required container. The package therefore needs one conversion path
that can produce appendable CMAF bytes and a clear failure for unsupported
inputs.

## Decision

The media-worker pipeline uses mediabunny for format recognition and conversion.
It writes forced packet copies to CMAF output and sends the resulting fragments
to the MSE append sink. The pipeline does not use a package-local MP4 box
parser, `container-probe.ts`, `sniffContainer`, or mux.js.

The output MIME is the codec-qualified `DEFAULT_FMP4_MIME` from
`src/protocol.ts` when the pipeline has established the track codecs. The worker
and host check that MIME through the shared capability layer before appending.
A source that mediabunny cannot recognize, convert, or describe for the target
MSE surface reports `unsupported`; a browser append failure reports `decode` or
`quota` according to the failure kind.

This decision applies to the media-worker backend only. A native provider owns
its URL and browser media compatibility.

## Consequences

The media-worker append sink receives one CMAF-shaped output contract, and
mediabunny owns recognition and serialization. Unsupported content fails at the
media pipeline instead of being presented as a successful source assignment.

Progressive containers and codecs that the selected browser cannot append remain
unsupported. Consumers must provide content with browser-supported video and
audio tracks. Declared transport MIME is metadata; it does not prove that the
bytes can be appended.

## Supersession and related ADRs

ADR 0011 supersedes this decision for native provider loads. This ADR remains
the conversion policy for `media-worker` and `auto` loads that select the worker.

- Media contract: [0001](0001-custom-media-contracts.md)
- Worker ownership: [0002](0002-worker-owner-streaming-engine.md)
- Ranged reads: [0004](0004-ranged-seeking-and-deferred-seek.md)
- Wire MIME and errors: [0005](0005-custom-zero-copy-proto-over-comlink.md)
