import {
  DialogClose,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.js";
import { CloudCheckIcon, CloudSelectIcon } from "@/components/icons.js";
import useUploader from "@/features/uploadManager/hooks/useUploader";
import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button.js";
import { ServiceConfig } from "@/features/uploadManager/api/service";
import UploadItem from "@/features/uploadManager/components/UploadItem.js";
import { UppyFileDefault } from "@/features/uploadManager/lib/uploadManager.js";
import { ErrorList } from "@/components/Forms.js";
import useForceUpdate from "use-force-update";
import { Body, Meta, UppyEventMap } from "@uppy/core";

export default function UploadForm() {
  const uploader = useUploader();
  const forceUpdate = useForceUpdate();

  const state = "";

  const activeServices = uploader.getServices();

  const [selectedService, setSelectedService] = useState<ServiceConfig>();
  const inputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let files =
      event.target.files && event.target.files.length > 0
        ? Array.from(event.target.files)
        : [];
    files.forEach((item) => {
      uploader.addFile(item, selectedService!.id);
    });
    // We clear the input after a file is selected, because otherwise
    // change event is not fired in Chrome and Safari when a file
    // with the same name is selected.
    // ___Why not use value="" on <input/> instead?
    //    Because if we use that method of clearing the input,
    //    Chrome will not trigger change if we drop the same file twice (Issue #768).
    // @ts-expect-error TS freaks out, but this is fine
    // eslint-disable-next-line no-param-reassign
    event.target.value = null;
  };

  const openDialog = () => {
    if (inputRef.current) {
      //@ts-expect-error -- dumb html
      inputRef.current.value = null;
      inputRef.current.focus();
      inputRef.current.click();
    }
  };

  const updateSelectedService = function (value: string) {
    const svc = activeServices.filter((item) => item.id === value);
    if (svc.length === 0) {
      return;
    }

    setSelectedService(svc[0]);
  };

  const startUpload = () => {
    if (isValid) {
      uploader.start();
    }
  };

  const inputRef = React.useRef<HTMLInputElement>(null);
  const zoneRef = React.useRef<HTMLDivElement>(null);

  const hasStarted = false;
  const isCompleted = false;
  const isUploading = false;
  const isValid = !!selectedService && uploader.getFiles().length > 0;
  const hasErrored = false;

  useEffect(() => {
    if (zoneRef.current) {
      uploader.setUIDropTarget(zoneRef.current);
    }

    return () => {
      uploader.clearUIDropTarget();
    };
  }, [hasStarted, selectedService, zoneRef]);

  useEffect(() => {
    const events: Array<keyof UppyEventMap<Meta, Body>> = [
      "file-removed",
      "file-added",
      "preprocess-progress",
      "preprocess-complete",
      "upload-progress",
      "upload-retry",
      "upload-stalled",
      "upload-success",
      "upload-error",
    ];

    function handleLinkService(file: UppyFileDefault) {}

    events.forEach((event) => {
      uploader.addEvent(event as any, forceUpdate);
    });

    uploader.addEvent("file-added", async (file: UppyFileDefault) => {
      if (!selectedService?.id) {
        return;
      }
      const pluginId = await uploader.getFilePluginId(
        file.data as File,
        selectedService.id,
      );

      uploader.patchFilesState({
        [file.id]: {
          plugins: [pluginId],
        },
      });
    });

    return () => {
      events.forEach((event) => {
        uploader.removeEvent(event, forceUpdate);
      });

      uploader.removeEvent("file-added", handleLinkService);
    };
  }, [selectedService]);

  useEffect(() => {
    uploader.removeCompletedUploads();
  }, []);

  return (
    <>
      <DialogHeader className="mb-6">
        <DialogTitle>Upload Files</DialogTitle>
      </DialogHeader>
      <div className="mb-4">
        <Label htmlFor="service-select" className="block mb-2">
          Select Service
        </Label>
        <Select onValueChange={updateSelectedService}>
          <SelectTrigger className="w-full p-2 border rounded">
            <SelectValue placeholder="Service" />
          </SelectTrigger>

          <SelectContent>
            {activeServices.map((service) => (
              <SelectItem value={service.id}>{service.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {!hasStarted && selectedService ? (
        <div
          role="presentation"
          className="border border-border rounded text-foreground bg-background/30 h-48 flex flex-col items-center justify-center cursor-pointer"
          onClick={openDialog}
          ref={zoneRef}>
          <input
            type="file"
            ref={inputRef}
            onChange={inputChange}
            hidden
            aria-hidden="true"
            key={new Date().toISOString()}
            multiple
            name="files[]"
          />
          <CloudSelectIcon className="w-24 h-24 stroke stroke-background" />
          <p>Drag & Drop Files or Browse</p>
        </div>
      ) : null}

      <div className="w-full mt-3 space-y-3 max-h-44 lg:max-h-[calc(60%)] overflow-y-auto">
        {uploader.getFiles().map((file: UppyFileDefault) => {
          return <UploadItem key={file.id} file={file} />;
        })}
      </div>

      {<ErrorList errors={[...(hasErrored ? ["An error occurred"] : [])]} />}

      {hasStarted && !hasErrored ? (
        <div className="flex flex-col items-center gap-y-2 w-full text-foreground">
          <CloudCheckIcon className="w-32 h-32 text-foreground" />
          {isCompleted
            ? "Upload completed"
            : `${uploader.getFiles().length} files being uploaded`}
        </div>
      ) : null}

      {isUploading ? (
        <DialogClose asChild onClick={uploader.cancelAll}>
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
          onClick={startUpload}
          className="mt-6 w-full"
          disabled={!isValid}>
          Upload
        </Button>
      ) : null}
    </>
  );
}
