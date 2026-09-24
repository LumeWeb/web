# 0010 — detect the MSE implementation and map no-MSE devices to a `device` error

## Status

Accepted (implemented in `libs/sia-video-source`)

## Context

The library feeds browser MSE on every playable load — inside a dedicated
worker on capable runtimes, on the main thread otherwise. But "browser MSE" is
not one API. iPhone Safari had **no MSE at all** before iOS 17.1; from 17.1 it
ships only WebKit's `ManagedMediaSource` (a `MediaSource` subclass for
low-power/time-shifted playback) — never the standard `MediaSource` global.
Internally Safari 17.1+ still exposes manual-maintenance MSE through
`URL.createObjectURL` against a `ManagedMediaSource`, which the library can
drive exactly like a standard `MediaSource`, with three sharp edges:

- `ManagedMediaSource` only fires `sourceopen` when `element.disableRemotePlayback
  = true` is set BEFORE the source is attached (MDN; WebKit blog, Oct 25 2023).
- It can be constructed in dedicated workers (`canConstructInDedicatedWorker
  === true`), so worker-mode MSE is reachable on iPhone Safari 18.1+ — but the
  transferred handle attaches on the main thread, so the element-side prep must
  happen there.
- When BOTH `MediaSource` and `ManagedMediaSource` exist (Safari 17+ desktop /
  iPad), the standard surface must be preferred (videojs/v10 issue #838).

Older runtimes expose only the legacy prefixed `WebKitMediaSource` /
`webkitSourceAppend` surface (or nothing at all). Those devices cannot play
this library's output through any supported path. Today they would grind
through a worker roundtrip and surface a generic `unsupported` source error —
honest about the object, dishonest about the device. The library needs one
place to classify the runtime's MSE surface, one code path that says "this
device is too old" with a dedicated wire kind, and no accidental reference to
`MediaSource`/`SourceBuffer`/`ManagedMediaSource` globals that a unit-test
page or old runtime simply does not have.

## Decision

Add a capability layer that resolves the runtime's MSE surface structurally and
routes no-MSE devices to a new `device` error kind.

### MSE implementation matrix

| Impl            | Probe surface                | Managed | Behavior                          |
| --------------- | ---------------------------- | ------- | --------------------------------- |
| `standard`      | `MediaSource` (any runtime)  | false   | Preferred when both exist         |
| `managed`       | `ManagedMediaSource` (17.1+) | true    | iPhone Safari MSE, needs element prep |
| `webkit-legacy` | `WebKitMediaSource` only     | false   | Detect-only → device too old      |
| `none`          | no MSE surface               | false   | Device too old                    |

### Resolution order and construction site

`src/capabilities/mse-runtime.ts` probes in fixed order — standard
`MediaSource`, then `ManagedMediaSource`, then `WebKitMediaSource`, else
`none` — and the rest of the library consults that single resolved answer.
`browser-capabilities.ts` probes MIME support through the **resolved** impl's
`isTypeSupported` (so MMS-only runtimes report their real MIME support), the
worker MSE root constructs its worker MediaSource through the same resolver (so
a worker-mode MMS posts its `.handle` and the transfer still works), and the
host main-thread fallback constructs through the resolver too.

### `ManagedMediaSource` element prep

Before any MSE source is attached — both the main-thread `target.src` object
URL and the worker-HANDLE `srcObject` assignment (which happens on the main
thread even in worker mode) — the host calls `prepareMediaElementForMse`,
which sets `disableRemotePlayback = true` and registers non-once
`startstreaming`/`endstreaming` listeners treated as diagnostics only (the
append pipe keeps running). A no-op for every non-managed impl.

### The `device` wire kind

`protocol.ts` grows `device`; `errors.ts` maps it to
`MEDIA_ERR_SRC_NOT_SUPPORTED` (4) with the message "This device or browser is
too old to stream this video. Update to iOS 17.1+ or use a recent desktop
browser." The session coordinator and the host gate a no-MSE runtime before
any worker roundtrip and report `device`/`no-mse`. The host playback machine
treats `device` exactly like `unsupported` — fatal, no repair owed.

## Consequences

**Easier**

- iPhone Safari 17.1+ plays through `ManagedMediaSource` on both the main
  thread and (18.1+) in worker mode, with the mandatory
  `disableRemotePlayback` prep applied at every attach site.
- Old devices fail fast and honestly: no worker roundtrip, no misleading
  object-level `unsupported` error — a dedicated `device` kind with code 4.
- One structural resolver owns the "which MSE is this" question, so no caller
  touches `MediaSource`/`SourceBuffer`/`ManagedMediaSource` globals directly
  (the code never references a `SourceBuffer` or `ManagedMediaSource` global;
  TS types are fine).

**Harder**

- The `managed` path leans on per-runtime quirks (the `disableRemotePlayback`
  precondition, streaming-diagnostics events) that a future WebKit change
  could move; these are isolated to `prepareMediaElementForMse`.
- Legacy runtimes are permanently excluded by policy, documented, and reported
  as `device` rather than degrading silently.

**Non-goal**

- No legacy playback path: `WebKitMediaSource`/`webkitSourceAppend`, OPFS,
  ServiceWorker-`fetch`-based MSE, or any other historical MSE workaround is
  intentionally **not** implemented — the prefixed surface is detect-only and
  maps to `device`-too-old. Recent desktop browsers provide one of the
  supported surfaces.
