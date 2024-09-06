import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(
        ({ id, title, description, action, cancelMutation, ...props }) => {
          const undoButton = cancelMutation ? (
            <ToastAction altText="Undo" onClick={cancelMutation}>
              Undo
            </ToastAction>
          ) : undefined;
          return (
            <Toast key={id} {...props} variant={"default"}>
              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
              {action}
              {undoButton}
              <ToastClose />
            </Toast>
          );
        },
      )}
      <ToastViewport />
    </ToastProvider>
  );
}
