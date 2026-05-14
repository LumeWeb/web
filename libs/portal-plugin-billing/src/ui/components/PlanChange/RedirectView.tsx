import { Button } from "@lumeweb/portal-framework-ui-core";
import { ExternalLink } from "lucide-react";

interface RedirectViewProps {
  url: string;
}

export function RedirectView({ url }: RedirectViewProps) {
  return (
    <div className="rounded-lg border border-border/30 bg-secondary/30 p-4">
      <p className="text-muted-foreground mb-3 text-sm">
        Plan changes must be completed through your payment provider&apos;s portal.
      </p>
      <Button asChild variant="outline" className="gap-2">
        <a href={url} target="_blank" rel="noopener noreferrer">
          Manage in Portal
          <ExternalLink className="h-4 w-4" />
        </a>
      </Button>
    </div>
  );
}
