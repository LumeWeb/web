/**
 * Pure resolver for the deep-linkable `?error=` param set when the backend
 * redirects back to /login after a failed SSO round-trip. Only `email_taken`
 * is surfaced; every other (unknown) value is ignored so backend-side error
 * codes can't inject arbitrary copy.
 *
 * Copy contract (provider-generic — the backend passes at most a provider
 * slug): "An account with this email already exists — sign in with email,
 * then connect {provider} in Settings."
 */
export const EMAIL_TAKEN_ERROR_PARAM = "email_taken";

/**
 * Resolve the login page's inline error notice text.
 *
 * @returns the notice copy, or `null` when nothing should be rendered
 * (no/unknown `?error=` value).
 */
export function resolveLoginErrorNotice(
  errorParam: null | string,
  providerParam: null | string,
): null | string {
  if (errorParam !== EMAIL_TAKEN_ERROR_PARAM) {
    return null;
  }

  // Only trust a tight slug alphabet; anything else (or absent) falls back to
  // a generic provider label so a crafted URL can't smuggle arbitrary text.
  const providerLabel = providerParam?.match(/^[a-z0-9][a-z0-9-]{0,39}$/i)
    ? providerParam.charAt(0).toUpperCase() + providerParam.slice(1)
    : "your provider";

  return `An account with this email already exists — sign in with email, then connect ${providerLabel} in Settings.`;
}
