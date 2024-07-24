import React from "react";

import { forwardRef } from "react";
import { Button } from "./ui/button";
import { CloudUploadIcon } from "./icons";

export const UploadButton = forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof Button>
>((props, ref) => {
  return (
    <Button
      ref={ref}
      size="lg"
      className="w-full text-base font-semibold bg-upload-file-background hover:bg-current/60 text-gray-800 mt-10 lg:mt-4"
      {...props}>
      <CloudUploadIcon className="mr-1" />
      Upload
    </Button>
  );
});

UploadButton.displayName = "UploadFileButton";
