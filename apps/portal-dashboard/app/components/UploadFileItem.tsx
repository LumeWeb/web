import type { FailedUppyFile, UppyFile } from "@uppy/core";
import {
  BoxCheckedIcon,
  ExclamationCircleIcon,
  PageIcon,
} from "~/components/icons.js";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip.js";
import filesize from "~/util/filesize.js";
import { Button } from "~/components/ui/button.js";
import { TrashIcon } from "@radix-ui/react-icons";
import { Progress } from "~/components/ui/progress.js";

export default function UploadFileItem({
  file,
  failedState,
  onRemove,
}: {
  file: UppyFile;
  failedState?: FailedUppyFile<Record<string, any>, Record<string, any>>;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="flex flex-col w-full py-4 px-2 bg-secondary">
      <div
        className={`flex items-center justify-between ${
          failedState ? "text-red-500" : "text-foreground"
        }`}>
        <div className="flex items-center">
          <div className="p-2">
            {file.progress?.uploadComplete ? (
              <BoxCheckedIcon className="w-4 h-4 " />
            ) : failedState?.error ? (
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
                  <span>({filesize(file.size, 2)})</span>
                </p>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {file.name} ({filesize(file.size, 2)})
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Button
          size={"icon"}
          variant={"ghost"}
          className="!text-inherit"
          onClick={() => onRemove(file.id)}>
          <TrashIcon className="w-4 h-4 text-foreground" />
        </Button>
      </div>

      {failedState ? (
        <div className="mt-2 text-red-500 text-sm">
          <p>Error uploading: {failedState.error}</p>
          <div className="flex gap-2">
            <Button
              size={"sm"}
              onClick={() => {
                /* Retry upload function here */
              }}>
              Retry
            </Button>
            <Button
              size={"sm"}
              variant={"outline"}
              onClick={() => onRemove(file.id)}>
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
          muted
        </div>
      ) : null}
      {file.progress?.uploadStarted && !file.progress.uploadComplete ? (
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
