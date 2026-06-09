import * as React from "react";
import { Button, type ButtonProps } from "@/components/ui/button";

export interface TrackedButtonProps extends ButtonProps {
  trackEvent: string;
  trackProperties?: Record<string, unknown>;
}

const TrackedButton = React.forwardRef<HTMLAnchorElement, TrackedButtonProps>(
  ({ trackEvent, trackProperties, onClick, ...props }, ref) => {
    const handleClick = React.useCallback(
      (e: React.MouseEvent<HTMLAnchorElement>) => {
        window.posthog?.capture(trackEvent, trackProperties);
        onClick?.(e);
      },
      [trackEvent, trackProperties, onClick]
    );

    return <Button ref={ref} onClick={handleClick} {...props} />;
  }
);
TrackedButton.displayName = "TrackedButton";

export { TrackedButton };
