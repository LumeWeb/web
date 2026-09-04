import { Authenticated } from "@refinedev/core";
import React from "react";

export type SafeAuthenticatedProps = React.ComponentProps<typeof Authenticated>;

/**
 * Drop-in replacement for Refine's `<Authenticated>` pinned to
 * `appendCurrentPathToQuery: false`.
 *
 * Refine's default `appendCurrentPathToQuery: true` composes
 * `query: { to: parsed.params.to }` on top of the auth provider's
 * `check().redirectTo`. Because this app's authProvider.check() already
 * embeds a single-encoded `?to=` inside its redirectTo, the composed URL
 * becomes `/login?to=E1?to=E1` (URLSearchParams then reads `to` as
 * `E1?to=E1`, whose destination degrades to /dashboard).
 *
 * With `appendCurrentPathToQuery: false` the unauthenticated bounce
 * navigates to exactly the provider's `check().redirectTo` (single `?to=`
 * intact): unauthenticated + `?to=E1` → URL is exactly `/login?to=E1`.
 */
export const SafeAuthenticated: React.FC<SafeAuthenticatedProps> = (props) => {
  return <Authenticated {...props} appendCurrentPathToQuery={false} />;
};
