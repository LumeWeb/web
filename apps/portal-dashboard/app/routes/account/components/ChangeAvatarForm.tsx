import { DialogClose } from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import { useEffect, useMemo } from "react";
import { CloudCheckIcon, CloudUploadIcon } from "~/components/icons.js";
import { Button } from "~/components/ui/button";
import { DialogHeader, DialogTitle } from "~/components/ui/dialog.js";

function useUppy() {
  return {
    getRootProps: () => ({}),
    getInputProps: () => ({}),
    getFiles: () => [],
    upload: () => {},
    state: "idle",
    removeFile: () => {},
    cancelAll: () => {},
  };
}

export default function ChangeAvatarForm({ close }: { close: () => void }) {
  const {
    getRootProps,
    getInputProps,
    getFiles,
    upload,
    state,
    removeFile,
    cancelAll,
  } = useUppy();
  const isUploading = state === "uploading";
  const isCompleted = state === "completed";
  const hasStarted = state !== "idle" && state !== "initializing";

  const file = getFiles()?.[0];

  const imagePreview = useMemo(() => {
    if (file) {
      return URL.createObjectURL(file?.data);
    }
  }, [file]);

  useEffect(() => {
    if (isCompleted) {
      close();
    }
  }, [isCompleted, close]);

  return (
    <>
      <DialogHeader className="mb-6">
        <DialogTitle>Edit Avatar</DialogTitle>
      </DialogHeader>
      {!hasStarted && !getFiles().length ? (
        <div
          {...getRootProps()}
          className="border border-border rounded text-muted bg-primary-dark h-48 flex flex-col items-center justify-center">
          <input
            hidden
            aria-hidden
            name="uppyFiles[]"
            key={new Date().toISOString()}
            multiple
            {...getInputProps()}
          />
          <CloudUploadIcon className="w-24 h-24 stroke stroke-primary-dark" />
          <p>Drag & Drop Files or Browse</p>
        </div>
      ) : null}

      {!hasStarted && file && (
        <div className="border border-border rounded p-4 bg-primary-dark relative">
          <Button
            className="absolute top-1/2 right-1/2 rounded-full bg-gray-800/50 hover:bg-primary p-2 text-sm"
            onClick={() => removeFile(file?.id)}>
            <Cross2Icon className="size-4" />
          </Button>
          <img
            className="w-full h-48 object-contain"
            src={imagePreview}
            alt="New Avatar Preview"
          />
        </div>
      )}

      {hasStarted ? (
        <div className="flex flex-col items-center gap-y-2 w-full text-primary-1">
          <CloudCheckIcon className="w-32 h-32" />
          {isCompleted ? "Upload completed" : "0% completed"}
        </div>
      ) : null}

      {isUploading ? (
        <DialogClose asChild onClick={cancelAll}>
          <Button size={"lg"} className="mt-6">
            Cancel
          </Button>
        </DialogClose>
      ) : null}

      {isCompleted ? (
        <DialogClose asChild>
          <Button size={"lg"} className="mt-6">
            Close
          </Button>
        </DialogClose>
      ) : null}

      {!hasStarted && !isCompleted && !isUploading ? (
        <Button size={"lg"} className="mt-6" onClick={upload}>
          Upload
        </Button>
      ) : null}
    </>
  );
}
