import { Skeleton } from "@lumeweb/portal-framework-ui-core";

export function FeaturesSkeleton() {
  return (
    <>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-5/6" />
    </>
  );
}
