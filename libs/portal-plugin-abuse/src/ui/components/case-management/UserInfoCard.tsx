import type { SubjectResponse } from "@/types/subject";
import type { ReporterResponse } from "@/types/reporter";
import { Refine, useOne } from "@refinedev/core";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@lumeweb/portal-framework-ui-core";
import { format } from "date-fns";
import { Mail, User } from "lucide-react";
import React from "react";
import type { BaseKey } from "@refinedev/core";
import { RefineResource } from "@/types/resources";

interface UserInfoCardProps {
  isReporter?: boolean;
  title: string;
  id: BaseKey;
}

export function UserInfoCard({
  isReporter = false,
  title,
  id,
}: UserInfoCardProps) {
  const previousLabel = isReporter ? "Previous Reports" : "Previous Violations";

  const { data, isLoading } = useOne<ReporterResponse | SubjectResponse>({
    resource: isReporter ? RefineResource.Reporter : RefineResource.Subject,
    id: id,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return <div>User not found.</div>;
  }

  const user = data;

  // TODO: Implement
  /*  const previousCount = isReporter
    ? (user as ReporterResponse).previousReports
    : (user as SubjectResponse).previousViolations;*/

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <User className="h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="grid grid-cols-[80px_1fr] gap-1">
          <span className="text-muted-foreground">Name:</span>
          <span className="font-medium">{user.name}</span>
        </div>
        <div className="grid grid-cols-[80px_1fr] gap-1">
          <span className="text-muted-foreground">Email:</span>
          <a
            className="flex items-center gap-1 text-primary hover:underline"
            href={`mailto:${user.email}`}>
            <Mail className="h-3.5 w-3.5" />
            {user.email}
          </a>
        </div>
        <div className="grid grid-cols-[80px_1fr] gap-1">
          <span className="text-muted-foreground">Account:</span>
          <span>{format(new Date(user.created_at), "MMM d, yyyy")}</span>
        </div>
        <div className="grid grid-cols-[80px_1fr] gap-1">
          <span className="text-muted-foreground">{previousLabel}:</span>
          {/*          <span
            className={
              previousCount > 0
                ? "text-amber-600 dark:text-amber-400 font-medium"
                : ""
            }>
            {previousCount}
          </span>*/}
        </div>
      </CardContent>
    </Card>
  );
}
