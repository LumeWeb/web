"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@lumeweb/portal-framework-ui-core";
import { FileText, Scan } from "lucide-react";
import { useState } from "react";
import React from "react";

import { EvidenceList } from "./evidence/EvidenceList";
import { SubjectScanPanel } from "./scanning/SubjectScanPanel";

interface EvidenceScanningTabProps {
  caseId: number;
  subjectId: number;
}

export function EvidenceScanningTab({
  caseId,
  subjectId,
}: EvidenceScanningTabProps) {
  const [activeTab, setActiveTab] = useState<string>("evidence");

  return (
    <Tabs
      className="w-full"
      defaultValue="evidence"
      onValueChange={setActiveTab}
      value={activeTab}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger className="flex items-center gap-2" value="evidence">
          <FileText className="h-4 w-4" />
          Evidence Files
        </TabsTrigger>
        <TabsTrigger className="flex items-center gap-2" value="scanning">
          <Scan className="h-4 w-4" />
          Subject Scanning
        </TabsTrigger>
      </TabsList>
      <TabsContent className="mt-4" value="evidence">
        <EvidenceList caseId={caseId} />
      </TabsContent>
      <TabsContent className="mt-4" value="scanning">
        <SubjectScanPanel caseId={caseId} subjectId={subjectId} />
      </TabsContent>
    </Tabs>
  );
}
