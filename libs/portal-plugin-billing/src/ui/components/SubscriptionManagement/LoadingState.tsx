import { cn } from "@lumeweb/portal-framework-ui-core";

interface LoadingStateProps {
  className?: string;
}

export function LoadingState({ className }: LoadingStateProps) {
  return (
    <div className={cn("border-border/30 bg-secondary/30 rounded-lg border p-6", className)}>
      <p className="text-muted-foreground">Loading management options...</p>
    </div>
  );
}
