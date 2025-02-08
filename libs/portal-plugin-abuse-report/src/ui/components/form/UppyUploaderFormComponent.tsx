import React from "react";
import { UppyUploader } from "@/ui/components/file-uploader/UppyUploader";
import type { FormComponentProps } from "@lumeweb/portal-framework-ui";

export const UppyUploaderFormComponent = React.forwardRef<
  HTMLDivElement,
  FormComponentProps
>(({ value, onChange, disabled }, ref) => {
  const handleUploadSuccess = (file: any) => {
    // Update form value with uploaded file info
    onChange?.([...(Array.isArray(value) ? value : []), file]);
  };

  return (
    <UppyUploader
      ref={ref}
      accessToken={localStorage.getItem("caseAccessToken") || ""}
      onUploadSuccess={handleUploadSuccess}
      onUploadError={(error) => console.error("Upload failed:", error)}
      // referenceNumber should come from case data
      disabled={disabled}
    />
  );
});
