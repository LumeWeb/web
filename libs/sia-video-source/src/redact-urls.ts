/**
 * Scrubs URL-shaped runs out of a diagnostic string before it enters `LOG`
 * detail. Share URLs embed the object decryption key in the fragment, and an
 * SDK/fetch error message can carry the resolved share URL verbatim; replacing
 * any http(s)/`sia://` URL-ish run with `[redacted]` keeps the key (and the
 * object identity) out of worker logs while leaving the rest of the message
 * readable. The replacement may consume trailing punctuation to avoid retaining URL secrets.
 */
export function redactUrls(text: string): string {
  return text.replace(/(?:https?|sia):\/\/\S+/g, '[redacted]');
}
