import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "portal-shared/components/ui/dropdown-menu";
import { Button } from "portal-shared/components/ui/button";
import { Download, MoreVertical, Trash } from "lucide-react";
import { CID } from "multiformats/cid";
import { useActiveService } from "../hooks/useActiveService";
import { showSaveFilePicker } from "native-file-system-adapter";
import { useDelete, useNavigation } from "@refinedev/core";

interface ItemActionsProps {
  cid: CID;
  isFolder: boolean;
  suggestedDownloadName?: string;
}

export default function ItemActions({
  cid,
  isFolder,
  suggestedDownloadName,
}: ItemActionsProps) {
  const svc = useActiveService();

  const [isDownloading, setIsDownloading] = useState(false);
  const [isUnpinning, setIsUnpinning] = useState(false);

  const nav = useNavigation();
  const { mutate } = useDelete();

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const file = await svc?.downloadFile(cid);
      const fileHandle = await showSaveFilePicker({
        _preferPolyfill: false,
        suggestedName: suggestedDownloadName ?? file?.name,
      });
      const writer = await fileHandle.createWritable();
      await writer.write(file?.blob);
      await writer.close();
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleUnpin = async () => {
    setIsUnpinning(true);
    try {
      await mutate({
        resource: svc?.id()!,
        id: cid.toString(),
        successNotification() {
          return {
            message: "Item successfully unpinned",
            type: "success",
          };
        },
        errorNotification(error) {
          if (error) {
            return {
              message: "Failed to unpin item",
              description: error.message,
              type: "error",
            };
          }
          return false;
        },
      });
    } catch (error) {
      console.error("Unpin failed:", error);
    } finally {
      setIsUnpinning(false);
    }
  };

  const taskInProgress = isDownloading || isUnpinning;

  return (
    <div className="flex justify-end items-center">
      {taskInProgress ? (
        <Loading />
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {!isFolder && (
              <DropdownMenuItem
                onClick={handleDownload}
                disabled={isDownloading}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={handleUnpin} disabled={isUnpinning}>
              <Trash className="mr-2 h-4 w-4" />
              Unpin
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

function Loading() {
  return (
    <div
      className="flex space-x-1 h-8 w-8 items-center justify-center"
      role="status"
      aria-label="Loading">
      <div
        className="w-2 h-2 bg-primary rounded-full animate-bounce"
        style={{ animationDelay: "0s" }}></div>
      <div
        className="w-2 h-2 bg-primary rounded-full animate-bounce"
        style={{ animationDelay: "0.2s" }}></div>
      <div
        className="w-2 h-2 bg-primary rounded-full animate-bounce"
        style={{ animationDelay: "0.4s" }}></div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}
