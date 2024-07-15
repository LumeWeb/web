import { useUppy } from "~/hooks/uppy.js";
import { DialogHeader, DialogTitle } from "~/components/ui/dialog.js";
import { CloudCheckIcon, CloudSelectIcon } from "~/components/icons.js";
import { ErrorList } from "~/components/Forms.js";
import { DialogClose } from "@radix-ui/react-dialog";
import { Button } from "~/components/ui/button.js";
import UploadFileItem from "~/components/UploadFileItem";

export default function UploadFileForm() {
  const {
    getRootProps,
    getInputProps,
    getFiles,
    state,
    removeFile,
    cancelAll,
    failedFiles,
    upload,
  } = useUppy();

  const inputProps = getInputProps();

  const isUploading = state === "uploading";
  const isCompleted = state === "completed";
  const hasErrored = state === "error";
  const hasStarted = state !== "idle" && state !== "initializing";
  const isValid = getFiles().length > 0;
  const getFailedState = (id: string) =>
    failedFiles.find((file) => file.id === id);

  return (
    <>
      <DialogHeader className="mb-6">
        <DialogTitle>Upload Files</DialogTitle>
      </DialogHeader>
      {!hasStarted ? (
        <div
          {...getRootProps()}
          className="border border-border rounded text-foreground bg-background/30 h-48 flex flex-col items-center justify-center">
          <input
            hidden
            aria-hidden
            key={new Date().toISOString()}
            multiple
            name="uppyFiles[]"
            {...inputProps}
          />
          <CloudSelectIcon className="w-24 h-24 stroke stroke-background" />
          <p>Drag & Drop Files or Browse</p>
        </div>
      ) : null}

      <div className="w-full mt-3 space-y-3 max-h-44 lg:max-h-[calc(60%)] overflow-y-auto">
        {getFiles().map((file) => (
          <UploadFileItem
            key={file.id}
            file={file}
            onRemove={(id) => {
              removeFile(id);
            }}
            failedState={getFailedState(file.id)}
          />
        ))}
      </div>

      <ErrorList errors={[...(hasErrored ? ["An error occurred"] : [])]} />

      {hasStarted && !hasErrored ? (
        <div className="flex flex-col items-center gap-y-2 w-full text-foreground">
          <CloudCheckIcon className="w-32 h-32 text-foreground" />
          {isCompleted
            ? "Upload completed"
            : `${getFiles().length} files being uploaded`}
        </div>
      ) : null}

      {isUploading ? (
        <DialogClose asChild onClick={cancelAll}>
          <Button type="button" size={"lg"} className="mt-6 w-full">
            Cancel
          </Button>
        </DialogClose>
      ) : null}

      {isCompleted ? (
        <DialogClose asChild>
          <Button type="button" size={"lg"} className="mt-6">
            Close
          </Button>
        </DialogClose>
      ) : null}

      {!hasStarted && !isCompleted && !isUploading ? (
        <Button
          type="submit"
          size={"lg"}
          onClick={isValid ? upload : () => {}}
          className="mt-6 w-full"
          disabled={!isValid}>
          Upload
        </Button>
      ) : null}
    </>
  );
}
