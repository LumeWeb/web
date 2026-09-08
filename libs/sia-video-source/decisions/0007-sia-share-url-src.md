# 0007 — accept a full Sia share URL as the media `src`

## Status

Accepted (2026-09-08; implemented in `libs/sia-video-source`)

## Context

The library's entry point is the media `src` attribute. Up to now `src`
carried no object identity of its own: callers played a Sia object by
passing the object's hash plus its encryption key as separate options
(see ADR [0001](0001-custom-media-contracts.md)), with the worker-side
connection, account, and app-key handshake described in ADR
[0006](0006-app-key-handshake-to-worker.md) supplying the payment path.

The Sia ecosystem itself, however, has a standard way to hand someone an
object: the **share URL**, as produced and consumed by the Sia storage Go
SDK and indexd. A share URL is a pre-signed URL of the form

    https://<indexer>/objects/<objectKey>/shared?<signed-params>#encryption_key=<base64url>

together with its `sia://` alias (the same URL with the `https://` prefix
rewritten, which is what the WASM SDK emits and accepts). The path segment
carries the object's identity — the 64-hex-character encoding of the
32-byte hash256 of the object — and the fragment carries the object's
32-byte decryption key, base64url-encoded. The signature lives in the
query string, so the fragment needs no signing: the URL alone is enough
to locate and decrypt the object.

When a caller already holds a share link, requiring them to additionally
decompose it into an object key and an encryption key just to feed the
library's options is redundant plumbing. Conversely, callers that directly
know the object (and hold the key out-of-band) should not need to
construct a synthetic share URL.

One factual limitation must be stated plainly: **a share URL grants
decryption, not payment.** Reading the object's bytes still requires a Sia
account that pays the hosts for the data transfer. A share URL therefore
does not change the worker's connection, account, or app-key flow (ADR
0006); on its own it is not sufficient to perform a transfer.

## Decision

The `src` value may now be a full Sia share URL, detected and parsed by a
dedicated module (`src/share-url.ts`):

- **Detection covers both forms.** `share-url.ts` recognizes the canonical
  pre-signed `https://<indexer>/objects/<objectKey>/shared#encryption_key=`
  form and its `sia://` alias (which is normalized back to `https://` for
  parsing, since `sia` is not always an acceptable scheme for the platform
  URL parser).
- **Parsing validates before use.** The parser requires the URL to be
  http(s), the path to match `/objects/<key>/shared`, the object key to be
  exactly 64 hex characters, and the `encryption_key` fragment — parsed as
  a query — to be present and to decode (base64url, padded or unpadded)
  to exactly 32 bytes. Malformed URLs fail early with descriptive errors,
  before any worker traffic is attempted.
- **Routing prefers the share URL.** When `src` is a share URL, the
  worker is configured from the object identity and encryption key
  extracted from it; the separately-passed indexer/object options remain
  the fallback for directly-known objects. Share-URL handling takes
  precedence over the fallback options, and the worker code does not need
  to know which path supplied its inputs.
- **The payment path is untouched.** The account connection and app-key
  handshake of ADR [0006](0006-app-key-handshake-to-worker.md) proceed
  exactly as before; a share URL only changes where the object identity
  and decryption key come from.

## Consequences

**Easier**

- Share links become first-class `src` values: a caller with a share link
  needs no separate object-identity or encryption-key plumbing.
- The format is the standard Sia one, so URLs copied out of indexd or the
  Go and Rust SDK tooling work without modification.
- The change is backwards-compatible: existing callers using scoped
  options are unaffected, and the fallback path is unchanged.
- All parsing and validation lives in one module, keeping the
  URL-handling concerns isolated from the worker and playback layers.

**Harder**

- A second URL shape must be parsed and validated, with its own edge
  cases (scheme aliasing, path shape, fragment encoding, key length) and
  its own test surface.
- A share URL embeds the decryption key: anyone holding the URL can read
  the object until it expires. Callers must treat the URL as sensitive
  material — kept out of configuration files and React state — mirroring
  the key-handling discipline of ADR
  [0006](0006-app-key-handshake-to-worker.md).
- Payment and account access are still required, so a share URL alone is
  not sufficient for a transfer; the worker's connection and app-key
  handshake remain mandatory inputs to playback.

## Related ADRs

- Where the engine runs and why the worker consumes these inputs →
  [0002](0002-worker-owner-streaming-engine.md)
- The account/app-key handshake a share URL does not replace →
  [0006](0006-app-key-handshake-to-worker.md)
