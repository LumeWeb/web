import { Button } from "@lumeweb/portal-framework-ui-core";

interface ChangePlanCardProps {
  onOpen: () => void;
}

export function ChangePlanCard({ onOpen }: ChangePlanCardProps) {
  return (
    <div className="border-border/30 bg-secondary/30 rounded-lg border p-6">
      <h4 className="font-semibold">Change Plan</h4>
      <p className="text-muted-foreground mt-1 text-sm">Switch to a different plan</p>
      <Button
        className="mt-4"
        size="sm"
        variant="outline"
        onClick={onOpen}
      >
        Change Plan
      </Button>
    </div>
  );
}
