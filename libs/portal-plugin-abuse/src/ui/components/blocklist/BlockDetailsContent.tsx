import type { BlockedContent } from "@/types/blocklist";

import {
  ACTION_BADGE_CONFIG,
  REASON_BADGE_CONFIG,
  SEVERITY_BADGE_CONFIG,
  SOURCE_BADGE_CONFIG,
} from "@/types/badge-configs";
import { RefineResource } from "@/types/resources";
import { formatFileSize } from "@/ui/util";
import { ComplexBadge } from "@lumeweb/portal-framework-ui";
import { Button } from "@lumeweb/portal-framework-ui-core";
import { Link as RLink } from "@refinedev/core";
import { format } from "date-fns";
import { FileIcon, Link } from "lucide-react";
import React from "react";

export function BlockDetailsContent({ block }: { block: BlockedContent }) {
  return (
    <div className="grid gap-4 py-2">
      <div className="flex items-start gap-4">
        <div className="bg-muted p-4 rounded-md">
          <FileIcon className="h-12 w-12 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-lg mb-1">{block.fileName}</h3>
          <p className="text-sm text-muted-foreground">{block.mimeType}</p>
          <p className="text-sm text-muted-foreground">
            {formatFileSize(block.size)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium mb-1">Hash</h4>
          <p className="text-sm font-mono break-all">{block.hash}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-1">Created At</h4>
          <p className="text-sm">
            {format(new Date(block.createdAt), "PPP p")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium mb-1">Reason</h4>
          <ComplexBadge config={REASON_BADGE_CONFIG} value={block.reason} />
        </div>
        <div>
          <h4 className="text-sm font-medium mb-1">Severity</h4>
          <ComplexBadge config={SEVERITY_BADGE_CONFIG} value={block.severity} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium mb-1">Action</h4>
          <ComplexBadge config={ACTION_BADGE_CONFIG} value={block.action} />
        </div>
        <div>
          <h4 className="text-sm font-medium mb-1">Source</h4>
          <ComplexBadge config={SOURCE_BADGE_CONFIG} value={block.source} />
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-1">Description</h4>
        <p className="text-sm whitespace-pre-line">{block.description}</p>
      </div>

      {block.caseId && (
        <div>
          <h4 className="text-sm font-medium mb-1">Related Case</h4>
          <Button asChild size="sm" variant="outline">
            <RLink
              className="flex items-center gap-1"
              go={{
                to: {
                  action: "show",
                  resource: RefineResource.Blocklist,
                },
              }}
              to={`/cases/${block.caseId}`}>
              <Link className="h-3.5 w-3.5" />
              View Case #{block.caseId}
            </RLink>
          </Button>
        </div>
      )}

      {block.uploaderId && (
        <div>
          <h4 className="text-sm font-medium mb-1">Uploader ID</h4>
          <p className="text-sm">{block.uploaderId}</p>
        </div>
      )}

      {block.expiresAt && (
        <div>
          <h4 className="text-sm font-medium mb-1">Expires At</h4>
          <p className="text-sm">
            {format(new Date(block.expiresAt), "PPP p")}
          </p>
        </div>
      )}

      {block.reviewedAt && (
        <div>
          <h4 className="text-sm font-medium mb-1">Reviewed At</h4>
          <p className="text-sm">
            {format(new Date(block.reviewedAt), "PPP p")}
          </p>
        </div>
      )}

      {block.metadata && Object.keys(block.metadata).length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-1">Metadata</h4>
          <pre className="text-xs bg-muted p-2 rounded-md overflow-auto max-h-[200px]">
            {JSON.stringify(block.metadata, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
