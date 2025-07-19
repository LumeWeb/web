import { type EvidenceResponse, EvidenceSource } from "@/types/evidence";
import { RefineResource } from "@/types/resources";
import { formatFileSize } from "@/ui/util";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@lumeweb/portal-framework-ui-core";
import { useList } from "@refinedev/core";
import { format } from "date-fns";
import { Download, Eye, FileIcon, FileText } from "lucide-react";
import React, { useState } from "react";

import { EvidenceDetailsDialog } from "./EvidenceDetailsDialog";

interface EvidenceListProps {
  caseId: number;
}

export function EvidenceList({ caseId }: EvidenceListProps) {
  const [selectedEvidence, setSelectedEvidence] =
    useState<EvidenceResponse | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { data, isLoading } = useList<EvidenceResponse>({
    filters: [
      {
        field: "caseId",
        operator: "eq",
        value: caseId,
      },
    ],
    pagination: {
      pageSize: 10,
    },
    resource: RefineResource.CaseEvidence,
  });

  const handleViewDetails = (evidence: EvidenceResponse) => {
    setSelectedEvidence(evidence);
    setDetailsOpen(true);
  };

  const handleDownload = (evidenceId: number) => {
    // In a real app, this would download the file
    window.open(`/api/abuse/evidence/${evidenceId}/content`, "_blank");
  };

  const getSourceLabel = (source: EvidenceSource) => {
    switch (source) {
      case EvidenceSource.api:
        return "API";
      case EvidenceSource.email:
        return "Email";
      case EvidenceSource.system:
        return "System";
      case EvidenceSource.web_upload:
        return "Web Upload";
      default:
        return source;
    }
  };

  const getFileTypeIcon = (contentType: string) => {
    if (contentType.startsWith("image/")) {
      return <FileIcon className="h-4 w-4 text-blue-500" />;
    } else if (contentType.startsWith("text/")) {
      return <FileText className="h-4 w-4 text-green-500" />;
    } else {
      return <FileIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">
            Evidence Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const evidenceFiles = data?.data || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">Evidence Files</CardTitle>
      </CardHeader>
      <CardContent>
        {evidenceFiles.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No evidence files found for this case.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {evidenceFiles.map((evidence) => (
                  <TableRow key={evidence.id}>
                    <TableCell className="flex items-center gap-2">
                      {getFileTypeIcon(evidence.content_type)}
                      <span className="truncate max-w-[200px]">
                        {evidence.file_name}
                      </span>
                    </TableCell>
                    <TableCell>{evidence.content_type}</TableCell>
                    <TableCell>{formatFileSize(evidence.file_size)}</TableCell>
                    <TableCell>{getSourceLabel(evidence.source)}</TableCell>
                    <TableCell>
                      {format(new Date(evidence.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={() => handleViewDetails(evidence)}
                          size="icon"
                          title="View Details"
                          variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDownload(evidence.id)}
                          size="icon"
                          title="Download"
                          variant="ghost">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {selectedEvidence && (
          <EvidenceDetailsDialog
            evidence={selectedEvidence}
            onDownload={() => handleDownload(selectedEvidence.id)}
            onOpenChange={setDetailsOpen}
            open={detailsOpen}
          />
        )}
      </CardContent>
    </Card>
  );
}
