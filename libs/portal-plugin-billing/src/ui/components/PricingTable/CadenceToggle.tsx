import { Label, Switch } from "@lumeweb/portal-framework-ui-core";

interface CadenceToggleProps {
  cadence: string;
  onChange: (cadence: string) => void;
}

export function CadenceToggle({ cadence, onChange }: CadenceToggleProps) {
  return (
    <div className="mb-8 flex items-center justify-center gap-3">
      <Label className="text-muted-foreground text-sm">Monthly</Label>
      <Switch
        checked={cadence === "yearly"}
        onCheckedChange={(checked: boolean) =>
          onChange(checked ? "yearly" : "monthly")
        }
      />
      <Label className="text-muted-foreground text-sm">Yearly</Label>
    </div>
  );
}
