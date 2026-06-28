import { useDialog } from "@lumeweb/portal-framework-ui";
import { Button, lazyIcon } from "@lumeweb/portal-framework-ui-core";

import { uploadWizardDialogConfig } from "@/ui/dialogs/uploadWizard";
import { useUploadManager } from "@/ui/hooks/useUploadManager";
const Upload = lazyIcon("Upload");


export default function UploadButton() {
  const { openDialog } = useDialog();
  const uploadManager = useUploadManager();

  const handleUploadClick = () => {
    openDialog(
      uploadWizardDialogConfig(
        uploadManager.services,
        uploadManager,
        () => {
          // Upload completed callback
          console.log("Upload process completed successfully");
        },
        (error) => {
          // Upload error callback
          console.error("Upload process failed:", error);
        },
      ),
    );
  };

  return (
    <Button
      className={"relative h-16 w-full justify-center"}
      onClick={handleUploadClick}>
      <Upload className={"absolute left-4 h-4 w-4"} />
      <span className={"flex-1 text-center"}>Upload</span>
    </Button>
  );
}
