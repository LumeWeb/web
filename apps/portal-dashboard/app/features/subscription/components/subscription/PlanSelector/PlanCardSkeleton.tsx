import React from "react";
import { Card, CardContent, CardHeader } from "portal-shared/components/ui/card";

interface PlanCardSkeletonProps {
  count?: number;
}

export function PlanCardSkeleton({ count = 3 }: PlanCardSkeletonProps) {
  return (
    <div className="grid md:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader>
            <div className="h-8 bg-muted rounded" />
            <div className="h-12 bg-muted rounded mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="h-6 bg-muted rounded" />
              <div className="h-6 bg-muted rounded" />
              <div className="h-6 bg-muted rounded" />
            </div>
            <div className="h-10 bg-muted rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
