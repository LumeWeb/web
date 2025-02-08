import type {
  NotificationProvider,
  OpenNotificationParams,
} from "@refinedev/core";
import type { ToastActionElement } from "@lumeweb/portal-framework-ui-core";
import { toast } from "@lumeweb/portal-framework-ui-core";

interface Provider extends Omit<NotificationProvider, "open"> {
  open: (
    params: OpenNotificationParams & {
      action?: ToastActionElement;
    },
  ) => void;
}

export const notificationProvider = () => {
  return {
    open: ({
      key,
      message,
      description,
      undoableTimeout,
      cancelMutation,
      action,
      type,
    }) => {
      const variant = type === 'error' ? 'destructive' : 'default';
      toast({
        variant,
        key,
        title: message,
        description,
        duration: undoableTimeout,
        action,
        cancelMutation,
      });
    },
    close: () => {},
  } satisfies Provider;
};
