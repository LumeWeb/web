import { Card, lazyIcon } from "@lumeweb/portal-framework-ui-core";
import Compressor from "@uppy/compressor";
import Uppy from "@uppy/core";
import ImageEditor from "@uppy/image-editor";
import { Dashboard } from "@uppy/react";
import ScreenCapture from "@uppy/screen-capture";
import Webcam from "@uppy/webcam";
import XHRUpload from "@uppy/xhr-upload";

import React, { useEffect, useState } from "react";
import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";
import "@uppy/webcam/dist/style.min.css";
import "@uppy/screen-capture/dist/style.min.css";
import "@uppy/image-editor/dist/style.min.css";
const AlertCircle = lazyIcon("AlertCircle");


interface UppyUploaderProps {
  accessToken: string;
  onUploadError?: (error: Error) => void;
  onUploadSuccess?: (result: any) => void;
  referenceNumber: string;
}

export function UppyUploader({
  accessToken,
  onUploadError,
  onUploadSuccess,
  referenceNumber,
}: UppyUploaderProps) {
  const [error, setError] = useState<null | string>(null);
  const [uppy, setUppy] = useState<null | Uppy>(null);

  useEffect(() => {
    const uppyInstance = new Uppy({
      allowMultipleUploadBatches: true,
      autoProceed: false,
      id: "case-uploader",
      restrictions: {
        allowedFileTypes: [
          "image/*",
          "application/pdf",
          ".doc",
          ".docx",
          ".txt",
          ".csv",
          ".xlsx",
          ".xls",
        ],
        maxFileSize: 10 * 1024 * 1024, // 10MB
        maxNumberOfFiles: 5,
      },
    })
      .use(Compressor)
      .use(Webcam)
      .use(ScreenCapture)
      .use(ImageEditor)
      .use(XHRUpload, {
        endpoint: `/api/cases/${referenceNumber}/attachments`,
        fieldName: "file",
        formData: true,
      });

    uppyInstance.on("upload-success", (_, response) => {
      onUploadSuccess?.(response.body);
    });

    uppyInstance.on("upload-error", (_, error) => {
      setError(`Upload failed: ${error.message}`);
      onUploadError?.(error);
    });

    setUppy(uppyInstance);

    return () => {
      uppyInstance.destroy();
    };
  }, [referenceNumber, accessToken, onUploadSuccess, onUploadError]);

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm">{error}</p>
        </div>
      )}
      {uppy && (
        <Dashboard
          height={300}
          plugins={["Webcam", "ScreenCapture", "ImageEditor"]}
          proudlyDisplayPoweredByUppy={false}
          uppy={uppy}
          width="100%"
        />
      )}
    </div>
  );
}
