import Uppy, { debugLogger, FailedUppyFile, type State, type UppyFile } from "@uppy/core";
import NoopUrlStorage from "tus-js-client/lib.es5/noopUrlStorage.js";

import Tus from "@uppy/tus";
import toArray from "@uppy/utils/lib/toArray";

import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import DropTarget, { type DropTargetOptions } from "./uppy-dropzone";
import { useSdk } from "~/components/lib/sdk-context";
import UppyFileUpload from "~/components/lib/uppy-file-upload";
import { PROTOCOL_S5, type Sdk } from "@lumeweb/portal-sdk";
import type { S5Client, HashProgressEvent } from "@lumeweb/s5-js";
import { useInvalidate } from "@refinedev/core";

const LISTENING_EVENTS = [
  "upload-progress",
  "upload",
  "upload-success",
  "upload-error",
  "file-added",
  "file-removed",
  "files-added",
  "preprocess-progress"
] as const;

export function useUppy() {
  const invalidate = useInvalidate()
  const sdk = useSdk();

  const [uploadLimit, setUploadLimit] = useState<number>(0);

  useEffect(() => {
    async function getUploadLimit() {
      try {
        const limit = await sdk.account!().uploadLimit();
        setUploadLimit(limit);
      } catch (err) {
        console.log("Error occured while fetching upload limit", err);
      }
    }
    getUploadLimit();
  }, [sdk.account]);

  const inputRef = useRef<HTMLInputElement>(null);
  const [targetRef, _setTargetRef] = useState<HTMLElement | null>(null);
  const uppyInstance = useRef<Uppy>();
  const setRef = useCallback(
    (element: HTMLElement | null) => _setTargetRef(element),
    [],
  );
  const [, setUppyState] = useState<State>();
  const [state, setState] = useState<
    "completed" | "idle" | "initializing" | "error" | "uploading"
  >("initializing");

  const [inputProps, setInputProps] = useState<{
        ref: typeof inputRef;
        type: "file";
        onChange: (event: ChangeEvent<HTMLInputElement>) => void;
      }
  >();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [failedFiles, setFailedFiles] = useState<FailedUppyFile<Record<string, any>, Record<string, any>>[]>([])
  const getRootProps = useMemo(
    () => () => {
      return {
        ref: setRef,
        onClick: () => {
          if (inputRef.current) {
            //@ts-expect-error -- dumb html
            inputRef.current.value = null;
            inputRef.current.click();
          }
        },
        role: "presentation",
      };
    },
    [setRef],
  );
  const removeFile = useCallback(
    (id: string) => {
      uppyInstance.current?.removeFile(id);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [targetRef, uppyInstance],
  );
  const cancelAll = useCallback(
    () => uppyInstance.current?.cancelAll({ reason: "user" }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [targetRef, uppyInstance],
  );

  useEffect(() => {
    if (!targetRef) return;

    const tusPreprocessor = async (fileIDs: string[]) => {
      for (const fileID of fileIDs) {
        const file = uppyInstance.current?.getFile(fileID) as UppyFile;
        // @ts-ignore
        if (file.uploader === "tus") {
          const hashProgressCb = (event: HashProgressEvent) => {
            uppyInstance.current?.emit("preprocess-progress", file, {
                mode: "determinate",
                message: "Hashing file...",
                value: Math.round((event.bytes / event.total) * 100),
            });
          };
          const options = await sdk.protocols!()
            .get<S5Client>(PROTOCOL_S5)
            .getSdk()
            .getTusOptions(
              file.data as File,
              {},
              { onHashProgress: hashProgressCb },
            );
          uppyInstance.current?.setFileState(fileID, {
            tus: options,
            meta: {
              ...options.metadata,
              ...file.meta,
            },
          });
        }
      }
    };

    const uppy = new Uppy({
      logger: debugLogger,
      onBeforeUpload: (files) => {
        for (const file of Object.entries(files)) {
          // @ts-ignore
          file[1].uploader = file[1].size > uploadLimit ? "tus" : "file";
        }

        return true;
      },
    }).use(DropTarget, {
      target: targetRef,
    } as DropTargetOptions);

    uppyInstance.current = uppy;
    setInputProps({
      ref: inputRef,
      type: "file",
      onChange: (event) => {
        const files = toArray(event.target.files);
        if (files.length > 0) {
          uppyInstance.current?.log("[DragDrop] Files selected through input");
          uppyInstance.current?.addFiles(files);
        }

        uppy.iteratePlugins((plugin) => {
          uppy.removePlugin(plugin);
        });

        uppy.use(UppyFileUpload, { sdk: sdk as Sdk });

        let useTus = false;

        uppyInstance.current?.getFiles().forEach((file) => {
          if (file.size > uploadLimit) {
            useTus = true;
          }
        });

        if (useTus) {
          uppy.use(Tus, { limit: 1, parallelUploads: 1, chunkSize: 1024 * 1024, urlStorage: new NoopUrlStorage() });
          uppy.addPreProcessor(tusPreprocessor);
        }

        // We clear the input after a file is selected, because otherwise
        // change event is not fired in Chrome and Safari when a file
        // with the same name is selected.
        // ___Why not use value="" on <input/> instead?
        //    Because if we use that method of clearing the input,
        //    Chrome will not trigger change if we drop the same file twice (Issue #768).
        // @ts-expect-error TS freaks out, but this is fine
        // eslint-disable-next-line no-param-reassign
        event.target.value = null;
      },
    });

    uppy.on("complete", (result) => {
      if (result.failed.length === 0) {
        console.log("Upload successful üòÄ");
        setState("completed");
      } else {
        console.warn("Upload failed üòû");
        setState("error");
      }
      console.log("successful files:", result.successful);
      console.log("failed files:", result.failed);
      setFailedFiles(result.failed);
      invalidate({
        resource: "file",
        invalidates: ["list"]
      })
    });

    const setStateCb = (event: (typeof LISTENING_EVENTS)[number]) => {
      switch (event) {
        case "upload":
        case "upload-progress":
        case "preprocess-progress":
          setState("uploading");
          break;
        case "upload-error":
          setState("error");
          break;
        case "upload-success":
          setState("completed");
          break;
        default:
          break;
      }
      setUppyState(uppy.getState());
    };

    for (const event of LISTENING_EVENTS) {
      uppy.on(event, function cb() {
        setStateCb(event);
      });
    }
    setState("idle");
  }, [targetRef, invalidate, sdk, uploadLimit]);

  useEffect(() => {
    return () => {
      uppyInstance.current?.cancelAll({ reason: "unmount" });
      uppyInstance.current?.logout();
      uppyInstance.current?.close();
      uppyInstance.current = undefined;
    };
  }, []);
  return {
    getFiles: () => uppyInstance.current?.getFiles() ?? [],
    error: uppyInstance.current?.getState,
    failedFiles,
    state,
    upload: () =>
      uppyInstance.current?.upload() ??
      new Error("[useUppy] Uppy has not initialized yet."),
    getInputProps: () => inputProps,
    getRootProps,
    removeFile,
    cancelAll,
  };
}
