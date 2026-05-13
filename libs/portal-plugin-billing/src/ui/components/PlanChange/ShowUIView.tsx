interface ShowUIViewProps {
  canAbort: boolean;
  confirmationMessage?: string;
  effectiveTime?: string;
}

export function ShowUIView({
  canAbort,
  confirmationMessage,
  effectiveTime,
}: ShowUIViewProps) {
  return (
    <div className="space-y-2 rounded-lg border border-border/30 bg-secondary/30 p-4">
      {confirmationMessage && (
        <p className="text-sm font-medium">{confirmationMessage}</p>
      )}
      {effectiveTime && (
        <p className="text-muted-foreground text-sm">
          Effective: {new Date(effectiveTime).toLocaleString()}
        </p>
      )}
      {canAbort && (
        <p className="text-muted-foreground text-xs">
          This change can be reverted within 24 hours
        </p>
      )}
    </div>
  );
}
