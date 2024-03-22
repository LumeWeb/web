import { Button } from "~/components/ui/button";
import logoPng from "~/images/lume-logo.png?url";
import lumeColorLogoPng from "~/images/lume-color-logo.png?url";
import discordLogoPng from "~/images/discord-logo.png?url";
import { Link, useLocation } from "@remix-run/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { useUppy } from "./lib/uppy";
import type { UppyFile } from "@uppy/core";
import { Progress } from "~/components/ui/progress";
import { DialogClose } from "@radix-ui/react-dialog";
import { ChevronDownIcon, ExitIcon, TrashIcon } from "@radix-ui/react-icons";
import {
  ClockIcon,
  DriveIcon,
  CircleLockIcon,
  CloudUploadIcon,
  CloudCheckIcon,
  BoxCheckedIcon,
  PageIcon,
  ThemeIcon,
} from "./icons";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "./ui/dropdown-menu";
import { Avatar } from "@radix-ui/react-avatar";
import { cn } from "~/utils";
import { useGetIdentity, useLogout } from "@refinedev/core";
import { PinningNetworkBanner } from "./pinning-network-banner";
import { PinningProvider } from "~/providers/PinningProvider";
import type { Identity } from "~/data/auth-provider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "./ui/tooltip";

export const GeneralLayout = ({ children }: React.PropsWithChildren) => {
  const location = useLocation();
  const { data: identity } = useGetIdentity<Identity>();
  const { mutate: logout } = useLogout();
  return (
    <PinningProvider>
      <div className="h-full flex flex-row">
        <header className="p-10 pr-0 flex flex-col w-[240px] h-full scroll-m-0 overflow-hidden">
          <img src={logoPng} alt="Lume logo" className="h-10 w-32" />

          <nav className="my-10 flex-1">
            <ul>
              <li>
                <Link to="/dashboard">
                  <NavigationButton
                    active={location.pathname.includes("dashboard")}>
                    <ClockIcon className="w-5 h-5 mr-2" />
                    Dashboard
                  </NavigationButton>
                </Link>
              </li>
              <li>
                <Link to="/file-manager">
                  <NavigationButton
                    active={location.pathname.includes("file-manager")}>
                    <DriveIcon className="w-5 h-5 mr-2" />
                    File Manager
                  </NavigationButton>
                </Link>
              </li>
              <li>
                <Link to="/account">
                  <NavigationButton
                    active={location.pathname.includes("account")}>
                    <CircleLockIcon className="w-5 h-5 mr-2" />
                    Account
                  </NavigationButton>
                </Link>
              </li>
            </ul>
          </nav>
          <span className="text-primary-2 mb-3 -space-y-1 opacity-40">
            <p>Freedom</p>
            <p>Privacy</p>
            <p>Ownership</p>
          </span>
          <Dialog>
            <DialogTrigger asChild>
              <Button size={"lg"} className="w-[calc(100%-3rem)] font-semibold">
                <CloudUploadIcon className="w-5 h-5 mr-2" />
                Upload Files
              </Button>
            </DialogTrigger>
            <DialogContent className="border rounded-lg p-8">
              <UploadFileForm />
            </DialogContent>
          </Dialog>
        </header>
        <div className="flex-1 overflow-y-auto p-10">
          <div className="flex items-center gap-x-4 justify-end">
            <Button variant="ghost" className="rounded-full w-fit">
              <ThemeIcon className="text-ring" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button className="border rounded-full h-auto p-2 gap-x-2 text-ring font-semibold">
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

const UploadFileForm = () => {
  const {
    getRootProps,
    getInputProps,
    getFiles,
    upload,
    state,
    removeFile,
    cancelAll,
  } = useUppy();

  console.log({ state, files: getFiles() });

  const isUploading = state === "uploading";
  const isCompleted = state === "completed";
  const hasStarted = state !== "idle" && state !== "initializing";

  return (
    <>
      <DialogHeader className="mb-6">
        <DialogTitle>Upload Files</DialogTitle>
      </DialogHeader>
      {!hasStarted ? (
        <div
          {...getRootProps()}
          className="border border-border rounded text-primary-2 bg-primary-dark h-48 flex flex-col items-center justify-center">
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

      <div className="w-full space-y-3 max-h-48 overflow-y-auto">
        {getFiles().map((file) => (
          <UploadFileItem
            key={file.id}
            file={file}
            onRemove={(id) => {
              removeFile(id);
            }}
          />
        ))}
      </div>

      {hasStarted ? (
        <div className="flex flex-col items-center gap-y-2 w-full text-primary-1">
          <CloudCheckIcon className="w-32 h-32" />
          {isCompleted
            ? "Upload completed"
            : `${getFiles().length} files being uploaded`}
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
};

function bytestoMegabytes(bytes: number) {
  return bytes / 1024 / 1024;
}

const UploadFileItem = ({
  file,
  onRemove,
}: {
  file: UppyFile;
  onRemove: (id: string) => void;
}) => {
  const sizeInMb = bytestoMegabytes(file.size).toFixed(2);
  return (
    <div className="flex flex-col w-full py-4 px-2 bg-primary-dark">
      <div className="flex text-primary-1 items-center justify-between">
        <div className="flex items-center">
          <div className="p-2">
            {file.progress?.uploadComplete ? (
              <BoxCheckedIcon className="w-4 h-4" />
            ) : (
              <PageIcon className="w-4 h-4" />
            )}
          </div>
          <TooltipProvider>
            <Tooltip delayDuration={500}>
              <TooltipTrigger>
                <p className="w-full flex justify-between items-center">
                  <span className="truncate text-ellipsis max-w-[20ch]">
                    {file.name}
                  </span>{" "}
                  <span>({sizeInMb}MB)</span>
                </p>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {file.name} ({sizeInMb}MB)
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
          <TrashIcon className="w-4 h-4" />
        </Button>
      </div>

      {file.progress?.uploadStarted && !file.progress.uploadComplete ? (
        <Progress max={100} value={file.progress.percentage} className="mt-2" />
      ) : null}
    </div>
  );
};

const NavigationButton = ({
  children,
  active,
}: React.PropsWithChildren<{ active?: boolean }>) => {
  return (
    <Button
      variant="ghost"
      className={cn(
        "justify-start h-14 w-full font-semibold",
        active && "bg-secondary-1 text-secondary-1-foreground",
      )}>
      {children}
    </Button>
  );
};
