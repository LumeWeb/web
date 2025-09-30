import { Authenticated } from "@refinedev/core";
import { GeneralLayout } from "@lumeweb/portal-framework-ui";
import React from "react";
import { FileManager } from "@/ui/components";

function FileManagerPage() {
  return (
    <Authenticated key="file-manager" v3LegacyAuthProviderCompatible={false}>
      <GeneralLayout>
        <FileManager />
      </GeneralLayout>
    </Authenticated>
  );
}

export default FileManagerPage;
