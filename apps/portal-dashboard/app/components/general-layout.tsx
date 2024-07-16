import { Avatar } from "@radix-ui/react-avatar";
import { DialogClose } from "@radix-ui/react-dialog";
import { ChevronDownIcon, ExitIcon, TrashIcon } from "@radix-ui/react-icons";
import { useGetIdentity, useLogout } from "@refinedev/core";
import { Link, useLocation } from "@remix-run/react";
import type { FailedUppyFile, UppyFile } from "@uppy/core";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Progress } from "~/components/ui/progress";
import type { Identity } from "~/data/auth-provider";
import useIsMobile from "~/hooks/useIsMobile";
import { ThemeSwitcher } from "~/hooks/useTheme";
import discordLogoPng from "~/images/discord-logo.png?url";
import lumeColorLogoPng from "~/images/lume-color-logo.png?url";
import { PinningProvider } from "~/providers/PinningProvider";
import DesktopSidebar from "./desktop-sidebar";
import { ErrorList } from "./forms";
import {
  BoxCheckedIcon,
  CircleLockIcon,
  ClockIcon,
  CloudCheckIcon,
  CloudSelectIcon,
  CloudUploadIcon,
  DriveIcon,
  ExclamationCircleIcon,
  PageIcon,
  ThemeIcon,
} from "./icons";
import filesize from "./lib/filesize";
import { useUppy } from "./lib/uppy";
import MobileSidebar from "./mobile-sidebar";
import { PinningNetworkBanner } from "./pinning-network-banner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

export const GeneralLayout = ({ children }: React.PropsWithChildren) => {
  const { data: identity } = useGetIdentity<Identity>();
  const { mutate: logout } = useLogout();

  const isMobile = useIsMobile();

  return (
    <PinningProvider>
      {!identity?.verified ? (
        <div className="bg-secondary text-foreground p-2">
          We have sent you a verification email. Please click on the link in the
          email to start using the platform.
        </div>
      ) : null}
      <div className="w-full h-full flex flex-col sm:flex-row">
        {isMobile ? <MobileSidebar /> : <DesktopSidebar />}
        <div className="flex-1 overflow-y-auto p-4 sm:p-10">
          <div className="hidden sm:flex items-center gap-x-4 justify-end">
            <ThemeSwitcher />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="border rounded-full h-auto p-2 gap-x-2 text-foreground font-semibold">
                  <Avatar className="bg-ring h-7 w-7 rounded-full" />
                  {`${identity?.firstName} ${identity?.lastName}`}
                  <ChevronDownIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => logout()}>
                    <ExitIcon className="mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {children}
          <footer className="mt-5">
            <ul className="flex flex-row">
              <li>
                <Link to="https://discord.lumeweb.com">
                  <Button
                    variant={"link"}
                    className="flex flex-row gap-x-2 text-input-placeholder">
                    <img
                      className="h-5"
                      src={discordLogoPng}
                      alt="Discord Logo"
                    />
                    Connect with us
                  </Button>
                </Link>
              </li>
              <li>
                <Link to="https://lumeweb.com">
                  <Button
                    variant={"link"}
                    className="flex flex-row gap-x-2 text-input-placeholder">
                    <img
                      className="h-5"
                      src={lumeColorLogoPng}
                      alt="Lume Logo"
                    />
                    Connect with us
                  </Button>
                </Link>
              </li>
            </ul>
          </footer>
        </div>
      </div>
      <PinningNetworkBanner />
    </PinningProvider>
  );
};
export const UploadFileForm = () => {
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
};

const UploadFileItem = ({
  file,
  failedState,
  onRemove,
}: {
  file: UppyFile;
  failedState?: FailedUppyFile<Record<string, any>, Record<string, any>>;
  onRemove: (id: string) => void;
}) => {
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
};
