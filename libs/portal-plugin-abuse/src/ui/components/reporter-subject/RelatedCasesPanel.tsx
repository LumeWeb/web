import type { RelatedCase } from "@/types/reporter-subject";
import type { LinkProps } from "react-router";

import {
  PRIORITY_BADGE_CONFIG,
  STATUS_BADGE_CONFIG,
} from "@/types/badge-configs";
import { ThemedBadge } from "@lumeweb/portal-framework-ui";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@lumeweb/portal-framework-ui-core";
import { Link, useList } from "@refinedev/core";
import { format } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
} from "lucide-react";
import React, { useState } from "react";
import { RefineResource } from "src/types/resources";

interface RelatedCasesPanelProps {
  entityId: number;
  entityType: RefineResource.Reporter | RefineResource.Subject;
}

export function RelatedCasesPanel({
  entityId,
  entityType,
}: RelatedCasesPanelProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const resource =
    entityType === RefineResource.Reporter
      ? RefineResource.ReporterCase
      : RefineResource.SubjectCase;
  const { data, isLoading } = useList<RelatedCase>({
    filters: [
      {
        field: `${entityType}Id`,
        operator: "eq",
        value: entityId,
      },
    ],
    pagination: {
      current: currentPage,
      pageSize,
    },
    resource,
  });

  const cases = data?.data || [];
  const total = data?.total || 0;
  const pageCount = Math.ceil(total / pageSize);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          Related Cases
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                className="h-10 bg-muted/50 rounded animate-pulse"
                key={index}
              />
            ))}
          </div>
        ) : cases.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p>No related cases found.</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cases.map((caseItem: RelatedCase) => (
                  <TableRow key={caseItem.id}>
                    <TableCell className="font-medium">
                      {caseItem.referenceNumber}
                    </TableCell>
                    <TableCell className="capitalize">
                      {caseItem.type.replace("_", " ")}
                    </TableCell>
                    <TableCell>
                      <ThemedBadge
                        className="capitalize"
                        config={STATUS_BADGE_CONFIG}
                        value={caseItem.status}
                      />
                    </TableCell>
                    <TableCell>
                      <ThemedBadge
                        className="capitalize"
                        config={PRIORITY_BADGE_CONFIG}
                        value={caseItem.priority}
                      />
                    </TableCell>
                    <TableCell>
                      {format(new Date(caseItem.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Button asChild size="icon" variant="ghost">
                        <Link<Omit<LinkProps, "to">>
                          go={{
                            to: {
                              action: "show",
                              id: caseItem.id,
                              resource: RefineResource.Case,
                            },
                          }}>
                          <ExternalLink className="h-4 w-4" />
                          <span className="sr-only">View case</span>
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {pageCount > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * pageSize + 1}-
                  {Math.min(currentPage * pageSize, total)} of {total}
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    size="icon"
                    variant="outline">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    disabled={currentPage === pageCount}
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, pageCount))
                    }
                    size="icon"
                    variant="outline">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
