import type { UppyFile, Meta, Body } from "@uppy/core";
import {
  BoxCheckedIcon,
  ExclamationCircleIcon,
  PageIcon,
} from "~/components/icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import filesize from "~/util/filesize";
import { Button } from "~/components/ui/button";
import { TrashIcon } from "@radix-ui/react-icons";
import { Progress } from "~/components/ui/progress";
import { UppyFileDefault } from "~/features/uploadManager/lib/uploadManager";
import useUploader from "~/features/uploadManager/hooks/useUploader.js";

export default function UploadItem({ file }: { file: UppyFileDefault }) {
  const error = !!file.error;

  const uploader = useUploader();
  return (
    <div className="flex flex-col w-full py-4 px-2 bg-secondary">
      <div
        className={`flex items-center justify-between ${
          error ? "text-red-500" : "text-foreground"
        }`}>
        <div className="flex items-center">
          <div className="p-2">
            {file.progress?.uploadComplete ? (
              <BoxCheckedIcon className="w-4 h-4 " />
            ) : error ? (
              <ExclamationCircleIcon className="w-4 h-4" />
            ) : (
              <PageIcon className="w-4 h-4 text-foreground" />
            )}
          </div>
          <TooltipProvider>
            <Tooltip delayDuration={500}>
              <TooltipTrigger>
                <p className="w-full flex justify-between items-center text-foreground">
                  <span className="truncate text-ellipsis max-w-[20ch]">
                    {file.name}
                  </span>{" "}
                  <span>({filesize(file!.size as number, 2)})</span>
                </p>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {file.name} ({filesize(file!.size as number, 2)})
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Button
          size={"icon"}
          variant={"ghost"}
          className="!text-inherit"
          onClick={() => uploader.removeFile(file.id)}>
          {!file.progress?.uploadComplete && (
            <TrashIcon className="w-4 h-4 text-foreground" />
          )}
        </Button>
      </div>

      {error ? (
        <div className="mt-2 text-red-500 text-sm">
          <p>Error uploading: {file.error}</p>
          <div className="flex gap-2">
            <Button size={"sm"} onClick={() => uploader.retryFile(file)}>
              Retry
            </Button>
            <Button
              size={"sm"}
              variant={"outline"}
              onClick={() => uploader.removeFile(file.id)}>
              Remove
            </Button>
          </div>
        </div>
      ) : null}

      {file.progress?.preprocess ? (
        <div>
          <p className="text-sm text-muted-foreground ml-2">
            {file.progress?.preprocess?.message ?? "Processing..."}
          </p>
          <Progress
            max={100}
            value={file.progress?.preprocess?.value ?? 0}
            className="mt-2"
          />
        </div>
      ) : null}
      {file.progress?.uploadStarted &&
      !file.progress.uploadComplete &&
      !error ? (
        <div>
          <p className="text-sm text-muted-foreground ml-2">Uploading...</p>
          <Progress
            max={100}
            value={file.progress.percentage}
            className="mt-2"
          />
        </div>
      ) : null}
    </div>
  );
}
