# 0003 — accept fragmented MP4 for MSE and remux TS, rejecting non-remuxable containers

## Status

Accepted (2026-09-08; implemented and audit-hardened in `libs/sia-video-source`)

## Context

MSE `SourceBuffer.appendBuffer` accepts exactly what `MediaSource.isTypeSupported`
blesses, and in practice every browser MSE implementation accepts only
fragmented containers with init-segment/media-segment separation. Sia objects
are raw bytes with no container contract — they can be anything anyone pinned.
The engine therefore has to decide, per load, whether the bytes can be appended
and by what MIME.

The candidate containers the library must handle:

- **Fragmented MP4 (fMP4)** — already in appendable form; MSE can tolerate it
  directly.
- **MPEG-TS** — the dominant transport format for H.264/AAC streams (e.g.
  HLS segments); cannot be appended, but is mechanically transmuxable to
  fMP4 because the media framing is per-packet and stateless enough.
  mux.js (version 7.1.0 as of this writing) ships exactly this Transmuxer.
- **Progressive MP4** — media lives inside `moov`/`mdat` with sample tables,
  not fragment boundaries. Appending it requires a *different* remux (index
  extraction per-sample), and no library in the dependency set provides it;
  mux.js is a demuxer, not a general MP4-to-fMP4 rewriter.
- **MKV / WebM (EBML)** — no remuxer is available; remuxing Matroska to fMP4
  is a substantial project, not a dependency away.

Two further forces shape the decision:

1. **fMP4 vs progressive MP4 is an MSE-specific distinction that no existing
   library makes.** mux.js can parse TS and produce fMP4, but it does not
   classify an arbitrary ISO BMFF file as fragmented or progressive. Third
   party sniffers classify "MP4 vs Matroska", not "appenable append bytes" —
   and the difference (`moof` presence vs `moov`-followed-by-media) is exactly
   what decides MSE usability.
2. **MIME strings are not evidence.** `MediaSource.isTypeSupported('video/mp4')`
   varies by normalization and browser; a bare container type like
   `video/mp4` is not decisive in either direction (browsers reject the string
   itself, yet appended fMP4 bytes play). Only a *codec-qualified* MIME —
   e.g. `video/mp4; codecs="avc1.640028,mp4a.40.2"` — is decisive, and only
   the remux pipeline can vouch for a codec set it produces itself.

The error contract matters: an unappendable object must fail *up front*, in
one place, with a semantic the UI can map — not deep inside a `SourceBuffer`
append chain with a misleading `MEDIA_ERR_DECODE`.

## Decision

MSE appendable media is **fragmented MP4 only**:

- MPEG-TS input is remuxed to fMP4 through the mux.js Transmuxer
  (`#remux` in `src/sia-video-source-worker.ts`); the resulting MIME is forced
  to the pipeline's codec-qualified `DEFAULT_FMP4_MIME`
  (`video/mp4; codecs="avc1.640028,mp4a.40.2"` in `src/protocol.ts`), and any
  declared transport type like `video/mp2t` is ignored — the pipeline, not the
  caller, owns the append format's description.
- Progressive MP4, MKV, and WebM are **rejected as unsupported** at probe
  time. There is no remuxer for them in the dependency set, and appending a
  non-fragmented file would fail inside `appendBuffer` with a decode error
  that blames the wrong layer.
- Container classification is done by a **custom zero-dependency probe**
  (`src/container-probe.ts`, `sniffContainer`): it distinguishes fMP4 from
  progressive MP4 by walking the ISO BMFF box chain for `moof` in the head
  (bounded to 64 KiB), verifies MPEG-TS via sync-byte strides at 188-byte
  packet intervals, and splits EBML into `webm` vs `mkv` by DocType. This
  exists because mux.js is a demuxer, not an identifier, and no library covers
  the fragmented-vs-progressive distinction that *MSE specifically* requires.
- Decisiveness of MIME: only a codec-qualified MIME is checked against
  `MediaSource.isTypeSupported` (in both the worker's MSE path and the
  host's main-thread fallback, `#beginMainThreadMse`); a bare type is never
  decisive, and the concrete attempt is made by actual appends.
- The error contract: unsupported input — unknown container, non-remuxable
  container, or a codec-qualified MIME the platform's MSE rejects — maps to
  `unsupported → MEDIA_ERR_SRC_NOT_SUPPORTED` (code 4) in `src/errors.ts`,
  reported as a request-scoped `ERROR` before any bulk download begins.

## Consequences

**Easier**

- The append pipeline has one invariant: everything that reaches a
  SourceBuffer is fMP4 — for `ftyp`-with-`moof` input by passthrough, for TS
  by remux. Downstream code (`#deliverPassthrough`, `#ensureWorkerSourceBuffer`,
  `#drainAppendQueue`, the host's fallback) has no per-container branching
  beyond the two admitted kinds.
- Unsupported content fails fast and legibly: a 4 KiB probe precedes any bulk
  I/O, so a Matroska file errors as code 4 with a `container:` context in
  milliseconds instead of after megabytes and a confusing decode failure.
- Declared MIME becomes advisory metadata, not load-bearing truth; the
  pipeline's trust in its own output (remuxer-produced codecs) is the single
  source of the append MIME.

**Harder**

- Increased scope: a hand-rolled box parser now exists, requiring its own
  tests (`src/__tests__/container-probe.spec.ts`) for 64-bit largesize
  handling, truncated heads, and coincidental sync bytes.
- The mux.js dependency is load-bearing for TS only; its quirks (no error
  events emitted by the v7.1.0 Transmuxer; partial-packet buffering across
  `push`/`flush`) had to be engineered around in `#remux`. A future TS
  feature (e.g. other codecs) needs a mux.js-compatible path.
- Common real-world formats (progressive MP4 from most cameras and screen
  recorders, MKV, WebM) fail with code 4 while `canPlayType` on the element
  has no opinion; the rejection happens past the MIME-looking stage and can
  surprise consumers who assumed `type="video/mp4"` was sufficient.
- TS remuxing means transcoding-free playback only applies to content with
  H.264+AAC (the transmuxer's codec set); TS with other codecs is
  unsupported at the MIME check even though the container is accepted.

**Follow-on ADRs**

- How a rejected load interacts with pending seek/play intent →
  [0004](0004-ranged-seeking-and-deferred-seek.md)
- Where `DEFAULT_FMP4_MIME` and the error kinds cross the worker boundary →
  [0005](0005-custom-zero-copy-proto-over-comlink.md)
- The v10 error contract that consumes code 4 →
  [0001](0001-custom-media-contracts.md)

Versioned facts recorded 2026-09-08: mux.js 7.1.0 (Transmuxer behavior),
`@videojs/media` 10.0.0-beta.32 `MediaError` code constants, and
`MediaSource.isTypeSupported` codec-qualification semantics — all subject to
change; re-verify when upgrading either library.
