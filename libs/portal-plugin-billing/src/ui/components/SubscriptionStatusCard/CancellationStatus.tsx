import { CancelAbortButton } from "../CancelAbortButton";

interface CancellationStatusProps {
  willCancelAt: string;
  onAborted?: () => void;
}

export function CancellationStatus({ willCancelAt, onAborted }: CancellationStatusProps) {
  const formattedDate = new Date(willCancelAt).toLocaleDateString();

  return (
    <div className="mt-4">
      <div className="flex justify-between">
        <span className="text-muted-foreground text-sm">Cancels</span>
        <span className="text-destructive font-medium">{formattedDate}</span>
      </div>
      <div className="mt-3">
        <CancelAbortButton willCancelAt={willCancelAt} onAborted={onAborted} />
      </div>
    </div>
  );
}
