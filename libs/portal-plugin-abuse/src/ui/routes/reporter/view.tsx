import type { BaseKey } from "@refinedev/core";
import type { ReporterDetailResponse } from "abuse-management/types/reporter-subject";

import { RelatedCasesPanel } from "@/ui/components/reporter-subject/RelatedCasesPanel";
import { ReporterInfoCard } from "@/ui/components/reporter-subject/ReporterInfoCard";
import { Button } from "@lumeweb/portal-framework-ui-core";
import { useNavigation, useParsed, useShow } from "@refinedev/core";
import { ArrowLeft, Edit } from "lucide-react";
import React from "react";
import { RefineResource } from "@/types/resources";

export default function CaseView() {
  const params = useParsed();

  return <ReporterViewContent id={params.id} />;
}

function ReporterViewContent({ id }: { id: BaseKey }) {
  const { queryResult } = useShow<ReporterDetailResponse>({
    id,
    resource: RefineResource.Reporter,
  });
  const { goBack } = useNavigation();

  const { data, isLoading } = queryResult;
  const record = data?.data;

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex animate-pulse flex-col gap-4">
          <div className="h-8 w-1/4 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-64 rounded bg-gray-200 dark:bg-gray-700"></div>
        </div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="container mx-auto py-6">
        <div className="rounded-lg border bg-card p-6 text-center shadow-sm">
          <h2 className="text-xl font-semibold">Reporter not found</h2>
          <p className="mt-2 text-muted-foreground">
            The reporter you are looking for does not exist or has been removed.
          </p>
          <Button className="mt-4" onClick={() => goBack()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      {/* Header section */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            className="h-9 w-9"
            onClick={() => goBack()}
            size="icon"
            variant="outline">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold text-background">
            {record.name}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button className="flex items-center gap-1" variant="outline">
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <ReporterInfoCard reporter={record} />
        </div>
        <div className="md:col-span-2">
          <RelatedCasesPanel entityId={record.id} entityType="reporter" />
        </div>
      </div>
    </div>
  );
}
