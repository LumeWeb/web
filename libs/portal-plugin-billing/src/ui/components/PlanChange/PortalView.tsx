import { Button, Skeleton, lazyIcon } from "@lumeweb/portal-framework-ui-core";
const ExternalLink = lazyIcon("ExternalLink");


interface PortalViewProps {
  loading: boolean;
  url: string | null;
}

export function PortalView({ loading, url }: PortalViewProps) {
  return (
    <div className="py-4 text-center">
      <p className="text-muted-foreground mb-4">
        Your subscription is managed via an external payment portal. Click below to manage your plan.
      </p>
      {loading ? (
        <Button disabled>
          <Skeleton className="h-4 w-24" />
        </Button>
      ) : (
        <Button asChild>
          <a
            href={url ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="gap-2"
          >
            Open Payment Portal
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      )}
    </div>
  );
}
