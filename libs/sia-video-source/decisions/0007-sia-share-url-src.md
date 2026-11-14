# 0007: accept a full Sia share URL as the media `src`

## Status

Accepted (2026-09-08; implemented in `libs/sia-video-source`)

Scope note: ADR [0008](0008-share-link-streaming-via-sharedsdk.md) adds
sharing-key playback for a recipient without an app-key credential. The
account-payment requirement below describes the app-key path at the time of
this decision, not every supported share-URL load.

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
carries the object's identity, a 64-character hex encoding of the
32-byte hash256 of the object. The fragment carries the object's
32-byte decryption key, base64url-encoded. The signature lives in the
query string, so the fragment needs no signing. The URL alone is enough
to locate and decrypt the object.

When a caller already holds a share link, requiring them to also
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
  pre-signed `https://<indexer>/objects/<objectKey>/shared?<signed-params>#encryption_key=`
  form and its `sia://` alias (which is normalized back to `https://` for
  parsing, since `sia` is not always an acceptable scheme for the platform
  URL parser).
- **Parsing validates during worker source resolution.** The host sends the
  full URL as `SOURCE.src`. The worker parser requires an http(s) URL or
  `sia://` alias, a `/objects/<key>/shared` path, a 64-character hex key,
  and a base64url `encryption_key` fragment that decodes to 32 bytes.
  Malformed recognized URLs fail before SDK object resolution, not before
  the host sends worker messages.
- **Routing follows `src`.** The worker resolves a full share URL through
  `objectFromShareUrl` on the app-key SDK or through the sharing-key SDK
  when one is supplied (ADR [0008](0008-share-link-streaming-via-sharedsdk.md)).
  A bare object key resolves through `object`; callers need not extract a
  separate encryption key from a share URL.
- **The original payment path uses the app key.** With only an app-key seed,
  the worker uses the account SDK to resolve a share URL. ADR
  [0008](0008-share-link-streaming-via-sharedsdk.md) adds a sharing-key path
  whose owner pays for downloads.

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
- A share URL embeds the decryption key. Anyone holding it can decrypt the
  object if they also have download authorization. Callers must treat the
  URL as sensitive, including when they pass it as a React `src` prop; do not
  put it in logs or public configuration. ADR
  [0006](0006-app-key-handshake-to-worker.md) covers the separate app-key seed.
- A share URL alone does not supply download authorization. The worker also
  needs an app-key seed or a sharing-key seed; ADR
  [0008](0008-share-link-streaming-via-sharedsdk.md) covers keyless recipients.

## Related ADRs

- Where the engine runs and why the worker consumes these inputs:
  [0002](0002-worker-owner-streaming-engine.md)
- The account/app-key handshake a share URL does not replace:
  [0006](0006-app-key-handshake-to-worker.md)
