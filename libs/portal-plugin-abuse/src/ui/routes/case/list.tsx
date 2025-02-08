import { CaseTable } from "@/ui/components/case-management/CaseTable";
import { TableContainer } from "@lumeweb/portal-framework-ui";
import React from "react";

export default function List() {
  return (
    <div className="mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-background">
          Case Management
        </h1>
        <p className="text-muted-foreground">
          Manage and view all cases in the system
        </p>
      </div>

      <div className="grid gap-6">
        <TableContainer>
          <CaseTable />
        </TableContainer>
      </div>
    </div>
  );
}
