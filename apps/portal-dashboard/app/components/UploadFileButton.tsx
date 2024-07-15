import React from "react";
import { CloudUploadIcon } from "./icons";
import { Button } from "./ui/button";

import { forwardRef } from "react";

export const UploadFileButton = forwardRef<
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

UploadFileButton.displayName = "UploadFileButton";
