import { cn } from "@lumeweb/portal-framework-ui-core";
import React, { type ReactNode } from "react";

/**
 * Identity data for the app (3rd-party client) whose login/consent flow is
 * being driven by the auth portal (e.g. an SIA desktop client asking the
 * user to connect). Rendered by `AuthPage` via its `appIdentity` prop.
 */
export interface AppIdentity {
  /** Optional brand mark for the app (icon/ReactNode). Falls back to a
   * neutral glyph when absent. */
  icon?: ReactNode;
  /** Human-readable app name (from the `?app=` param, or "an application"). */
  name: string;
  /** One-line description of what the app is asking for. */
  requestedAction?: string;
}

interface AppIdentityCardProps extends AppIdentity {
  className?: string;
}

const DefaultAppIcon = () => (
  <svg
    className="h-5 w-5 text-muted-foreground"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    viewBox="0 0 24 24">
    <rect height="18" rx="2" width="18" x="3" y="3" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="M21 15l-5-5L5 21" />
  </svg>
);

/**
 * Compact "which app is asking" card used at the top of app-login chains.
 * The heading doubles as the page's app-name heading (level 2) so screen
 * readers announce the app before the form.
 */
export function AppIdentityCard({
  className,
  icon,
  name,
  requestedAction,
}: AppIdentityCardProps): React.JSX.Element {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border border-border bg-muted/50 p-3",
        className,
      )}>
      <div className="flex flex-shrink-0 items-center justify-center rounded-lg border border-border bg-background p-2.5">
        {icon ?? <DefaultAppIcon />}
      </div>
      <div className="min-w-0">
        <h2 className="truncate text-sm font-semibold text-foreground">
          {name}
        </h2>
        {requestedAction && (
          <p className="text-xs text-muted-foreground">{requestedAction}</p>
        )}
      </div>
    </div>
  );
}
