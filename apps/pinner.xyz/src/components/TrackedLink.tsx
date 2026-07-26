import * as React from "react";

export interface TrackedLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  trackEvent: string;
  trackProperties?: Record<string, unknown>;
}

const TrackedLink = React.forwardRef<HTMLAnchorElement, TrackedLinkProps>(
  ({ trackEvent, trackProperties, onClick, ...props }, ref) => {
    const handleClick = React.useCallback(
      (e: React.MouseEvent<HTMLAnchorElement>) => {
        window.posthog?.capture(trackEvent, trackProperties);
        onClick?.(e);
      },
      [trackEvent, trackProperties, onClick]
    );

    return <a ref={ref} onClick={handleClick} {...props} />;
  }
);
TrackedLink.displayName = "TrackedLink";

export { TrackedLink };
