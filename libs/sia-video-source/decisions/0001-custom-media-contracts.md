# 0001 — adopt video.js v10 media contracts for the Sia host

## Status

Accepted (2026-09-08; implemented and audit-hardened in `libs/sia-video-source`)

## Context

`libs/sia-video-source` exposes a custom media source for the video.js v10
stack (`@videojs/media` / `@videojs/react` 10.0.0-beta.32 as of this writing)
that plays video stored on the Sia network. The engine is a dedicated Web
Worker that streams bytes into MSE, which means the host element (`SiaVideoSource`)
must bridge two very different worlds:

- video.js v10 elements are plain classes that implement media *contracts* —
  `HTMLVideoElementHost` as the base for native-`<video>`-backed hosts,
  `MediaEngineHost` for the attach/detach/destroy lifecycle, and
  `MediaErrorCapability` for fatal-failure reporting.
- browsers and content still speak the older reality: `HTMLMediaElement`
  semantics (`error` getter, `error` events, `emptied`, native seek behavior)
  that UI features — and the `errorFeature` / `ErrorDialog` shipped with
  video.js v10 — already know how to render.

The v8 ecosystem solved extension via a `source-handler` model: factories
registered against MIME types, communicating with the player through events.
That model is hostile to this library's shape: the engine is a persistent
worker session with its own attach/detach lifecycle (React StrictMode remounts
included), push-based chunk delivery, and structured error reports from a
worker isolate — not a per-source callback registry. Wiring a worker session
through v8-style source handlers would mean re-implementing lifecycle the v10
contracts already define.

The contract must be the same one video.js v10's own media classes implement
(packaged `HlsJsMedia`, `ShakaMedia`): extend `HTMLVideoElementHost`, own one
engine, report fatal failures through the `error` getter plus `error` events,
and drop the stored error on the next load (announced with an `emptied` event).
React integration then falls out of the shipped hooks (`useMediaInstance`,
`useAttachMedia`, `useComposedRefs` in `src/react/index.tsx`).

One wrinkle: MIME. The library never pre-declares support by type —
`canPlayType` always returns `''`, because the decidable facts (container
layout, actual codecs, whether MSE can store it) live in the object's bytes
and the platform's `MediaSource.isTypeSupported`, neither of which a MIME
string vouches for. Routing therefore happens inside the pipeline: browser
support checks are performed against a *codec-qualified* MIME only (see
`#beginMainThreadMse` in `src/sia-video-source.ts` and the mirror check in
`src/sia-video-source-worker.ts`); bare container MIMEs like `video/mp4` are
not decisive, because browsers reject the string while the appended fMP4
bytes play fine. This keeps video.js routing to this source via the
programmatic engine contract rather than a per-type gate.

## Decision

`SiaVideoSource` implements the video.js v10 media contracts, modeled directly
on the packaged `HlsJsMedia`:

- The class extends `HTMLVideoElementHost` and fulfills the
  `MediaEngineHost` interface: idempotent `attach`/`detach` (safe across
  element swaps, including React StrictMode remounts) and `destroy` that
  terminates the worker and tears down any main-thread MSE fallback state.
- It fulfills `MediaErrorCapability` with an `error` getter (falling through
  to the element's own error when the engine has none) plus `error` events
  built by `mediaErrorEvent` / `mediaErrorFromWorkerMessage` (`src/errors.ts`);
  the stored error is dropped on the next load with an `emptied` event.
- The React wrapper (`src/react/index.tsx`) uses the v10 hooks
  (`useMediaInstance`, `useAttachMedia`, `useComposedRefs`) instead of a
  bespoke integration, so anything built for packaged v10 media classes
  (skins, `errorFeature`, `ErrorDialog`) works against this source unchanged.
- No `canPlayType`-based capability claim is made; viability is established
  at load time against codec-qualified MIME plus actual container probing.

## Consequences

**Easier**

- Composing with video.js v10 features is zero glue: the host reads like any
  packaged media class to the player, so `errorFeature`, `ErrorDialog`, skins,
  and the React `Player` context work without special cases.
- Error UX is uniform: worker failures surface as the
  `HTMLMediaElement`-shaped `MediaError` contract UI already renders, not as
  a second, library-specific error channel.
- Attach/detach/destroy semantics, error drop-on-load, and `emptied`
  boundaries follow a contract application code already understands from
  native media elements.

**Harder**

- The host must faithfully *resemble* a native element even where it is not
  one: async engine loads mean "unsupported content" fails after `src` was
  assigned, so code that expects synchronous `canPlayType` truth gets `''`
  always and must rely on the `error` event instead.
- The host carries lifecycle bookkeeping the v8 model delegated to the
  player: idempotent re-attach negotiation, pending-message gating until
  `HELLO_OK`, and per-attach source replay. (See ADR
  [0005](0005-custom-zero-copy-proto-over-comlink.md) for the wire side.)
- MIME truth is now split between two runtimes (worker and main thread); both
  perform the codec-qualified `MediaSource.isTypeSupported` check and must
  stay aligned — enforced today only by a shared constant and mirror comments.

**Follow-on ADRs**

- Worker ownership of the engine and its capabilities →
  [0002](0002-worker-owner-streaming-engine.md)
- What byte formats the engine can accept →
  [0003](0003-mse-fmp4-remux-and-unsupported-format.md)
- How seeks map onto ranged Sia reads →
  [0004](0004-ranged-seeking-and-deferred-seek.md)
- Main↔worker message transport chosen for this host →
  [0005](0005-custom-zero-copy-proto-over-comlink.md)

The contract versions tracked here (`@videojs/media` /
`@videojs/react` 10.0.0-beta.32, recorded 2026-09-08) are pre-GA betas; a
breaking change in the v10 contracts requires either a compatibility shim or
a superseding ADR.
