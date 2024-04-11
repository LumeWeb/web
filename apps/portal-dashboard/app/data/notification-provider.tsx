import type {
  NotificationProvider,
  OpenNotificationParams,
} from "@refinedev/core";
import type { ToastActionElement } from "~/components/ui/toast";
import { toast } from "~/components/ui/use-toast";

interface Provider extends Omit<NotificationProvider, "open"> {
  open: (
    params: Omit<OpenNotificationParams, "type"> & {
      action?: ToastActionElement;
      type: "default" | "destructive";
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
      toast({
        variant: type,
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