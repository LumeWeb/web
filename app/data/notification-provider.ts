import { NotificationProvider } from "@refinedev/core";
import { ToastAction } from "~/components/ui/toast";
import { toast } from "~/components/ui/use-toast";

export const notificationProvider = (): NotificationProvider => {
  
  return {
    open: ({
      key,
      message,
      type,
      description,
      undoableTimeout,
      cancelMutation,
    }) => {
      toast({
        variant: type,
        key,
        title: message,
        description,
        duration: undoableTimeout,
      })
    },
    close: () => {}
  }
};
