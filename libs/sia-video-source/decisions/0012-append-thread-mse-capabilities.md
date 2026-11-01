# 0012: probe MIME support on the MSE append thread

## Status

Accepted.

Scope note: this refines the media-worker capability checks in [0010](0010-mse-implementation-detection.md). Native-provider playback remains outside MSE negotiation, as described in [0011](0011-backend-policy-and-native-stream-provider.md).

## Context

Firefox exposes `MediaSource` on its main thread but not in a dedicated worker. The worker previously treated its missing constructor as a device failure before inspecting the object. Running main-thread playback therefore failed even though the browser could append and decode the video.

The worker discovers the codec-qualified output MIME during media inspection. That MIME cannot be checked in advance when the host constructs the worker, and the worker must not assume every MIME is supported.

## Decision

The host sends its MSE implementation as the optional `hostMse` field on `HELLO`. Worker-mode loads continue to use worker-local implementation and MIME checks. Main-mode loads use the host implementation when it is supplied, and query the host for the exact output MIME before preparing conversion or accepting the source.

The worker sends `MSE_QUERY` with `requestId`, `queryId` and `mime`. The host replies with `MSE_RESULT`, echoing both identities and a boolean `supported` verdict from the actual main-thread capability detector. The host answers only for its current load in main mode. The worker accepts only the matching pending query and load.

Each query belongs to the load's abort signal. Source replacement, detach and destruction remove the waiter and its timer. Query identities are not reused within a worker composition. An unanswered query fails after 5000 ms. A failed query reports a control-channel failure; a negative MIME verdict reports unsupported media.

Hosts that omit `hostMse` retain the prior local capability checks. The additions do not rename existing messages or change the unreleased protocol version.

Remote mock downloads expose a stream before their fetch receives headers. Cancelling that stream aborts the fetch, including requests held before headers. This lets the reader release an obsolete download in browsers that wait for body bytes before resolving fetch. HTTP download errors surface through reads on that stream.

## Consequences

Main-thread Firefox playback can use real MIME support without a worker-local MSE constructor. Unsupported codecs are rejected before `SOURCE_OK`, and stale replies cannot accept a replacement load.

Main-mode inspection adds a request/reply exchange. Both peers need the new protocol messages to use this path. Older hosts preserve their existing behavior, including their limits when a worker cannot probe MSE.

The mock-backed browser tests exercise decoding, seeking and cancellation in Chromium and Firefox. They do not establish real Sia SDK encryption or host-transport compatibility.
