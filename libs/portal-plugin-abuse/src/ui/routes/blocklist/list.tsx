//import { AddBlockForm } from "@/ui/components/blocklist/AddBlockForm";
import { BlocklistTable } from "@/ui/components/blocklist/BlocklistTable";
//import { useDialog } from "@lumeweb/portal-framework-ui";
import { Button } from "@lumeweb/portal-framework-ui-core";
import { Plus } from "lucide-react";
import React from "react";

export default function List() {
  return (
    <div className="mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-background">
            Content Blocklist
          </h1>
          <p className="text-muted-foreground">
            Manage blocked content across the platform
          </p>
        </div>
        <Button
          className="flex items-center gap-1"
          /* onClick={() =>
            openDialog({
              content: <AddBlockForm />,
              size: "2xl",
              title: "Add Content to Blocklist",
              type: "custom",
            })
          }*/
        >
          <Plus className="h-4 w-4" />
          Add Block
        </Button>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <BlocklistTable />
      </div>
    </div>
  );
}
