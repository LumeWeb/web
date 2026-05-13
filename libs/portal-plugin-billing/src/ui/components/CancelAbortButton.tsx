import { useState } from "react";
import { useCustomMutation } from "@refinedev/core";
import { DATA_PROVIDER_NAME } from "@lumeweb/portal-framework-auth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
} from "@lumeweb/portal-framework-ui-core";
import { useBillingAnalytics } from "@/ui/hooks/useBillingAnalytics";

interface CancelAbortButtonProps {
  willCancelAt?: string;
  onAborted?: () => void;
}

export function CancelAbortButton({ willCancelAt, onAborted }: CancelAbortButtonProps) {
  const { mutateAsync } = useCustomMutation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aborted, setAborted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const analytics = useBillingAnalytics();

  if (!willCancelAt || aborted) return null;

  async function handleAbort() {
    setIsLoading(true);
    setError(null);
    setShowConfirm(false);

    try {
      await mutateAsync({
        url: "/account/billing/cancel/abort",
        method: "post",
        values: {},
        dataProviderName: DATA_PROVIDER_NAME,
      });
      setAborted(true);
      analytics.cancellationAborted();
      onAborted?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to abort cancellation");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setShowConfirm(true)}
        disabled={isLoading}
      >
        {isLoading ? "Aborting..." : "Abort Cancellation"}
      </Button>
      {error && <p className="text-destructive mt-1 text-xs">{error}</p>}

      <AlertDialog open={showConfirm} onOpenChange={(open: boolean) => !open && setShowConfirm(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Abort Cancellation?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to keep your subscription active? Your scheduled cancellation will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Leave Cancelled</AlertDialogCancel>
            <AlertDialogAction onClick={handleAbort}>Yes, Keep Active</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
