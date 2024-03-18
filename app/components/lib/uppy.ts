import Uppy, {debugLogger, type State, UppyFile} from "@uppy/core"

import Tus from "@uppy/tus"
import toArray from "@uppy/utils/lib/toArray"

import {type ChangeEvent, useCallback, useEffect, useMemo, useRef, useState} from "react"
import DropTarget, {type DropTargetOptions} from "./uppy-dropzone"
import {useSdk} from "~/components/lib/sdk-context.js";
import UppyFileUpload from "~/components/lib/uppy-file-upload.js";
import {Sdk} from "@lumeweb/portal-sdk";

const LISTENING_EVENTS = [
  "upload",
  "upload-success",
  "upload-error",
  "file-added",
  "file-removed",
  "files-added"
] as const

export function useUppy({
  endpoint
}: {
  endpoint: string
}) {
    const sdk = useSdk()

    const [uploadLimit, setUploadLimit] = useState<number>(0)

    useEffect(() => {
        async function getUploadLimit() {
            try {
                const limit = await sdk.account!().uploadLimit();
                setUploadLimit(limit);
            } catch (err) {
                console.log('Error occured while fetching upload limit', err);
            }
        }
        getUploadLimit();
    }, []);

  const inputRef = useRef<HTMLInputElement>(null)
  const [targetRef, _setTargetRef] = useState<HTMLElement | null>(null)
  const uppyInstance = useRef<Uppy>()
  const setRef = useCallback(
    (element: HTMLElement | null) => _setTargetRef(element),
    []
  )
  const [, setUppyState] = useState<State>()
  const [state, setState] = useState<
    "completed" | "idle" | "initializing" | "error" | "uploading"
  >("initializing")

  const [inputProps, setInputProps] = useState<
    | {
        ref: typeof inputRef
        type: "file"
        onChange: (event: ChangeEvent<HTMLInputElement>) => void
      }
    | object
  >({})
  const getRootProps = useMemo(
    () => () => {
      return {
        ref: setRef,
        onClick: () => {
          if (inputRef.current) {
            //@ts-expect-error -- dumb html
            inputRef.current.value = null
            inputRef.current.click()
            console.log("clicked", { input: inputRef.current })
          }
        },
        role: "presentation"
      }
    },
    [setRef]
  )
  const removeFile = useCallback(
    (id: string) => {
      uppyInstance.current?.removeFile(id)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [targetRef, uppyInstance]
  )
  const cancelAll = useCallback(
    () => uppyInstance.current?.cancelAll({ reason: "user" }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [targetRef, uppyInstance]
  )

  useEffect(() => {
    if (!targetRef) return

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
      target: targetRef
    } as DropTargetOptions)

    uppyInstance.current = uppy
    setInputProps({
      ref: inputRef,
      type: "file",
      onChange: (event) => {
        const files = toArray(event.target.files)
        if (files.length > 0) {
          uppyInstance.current?.log("[DragDrop] Files selected through input")
          uppyInstance.current?.addFiles(files)
        }

        // We clear the input after a file is selected, because otherwise
        // change event is not fired in Chrome and Safari when a file
        // with the same name is selected.
        // ___Why not use value="" on <input/> instead?
        //    Because if we use that method of clearing the input,
        //    Chrome will not trigger change if we drop the same file twice (Issue #768).
        // @ts-expect-error TS freaks out, but this is fine
        // eslint-disable-next-line no-param-reassign
        event.target.value = null
      }
    })


      uppy.use(UppyFileUpload, { sdk: sdk as Sdk })

      let useTus = false;

      uppyInstance.current?.getFiles().forEach((file) => {
        if (file.size > uploadLimit) {
          useTus = true;
        }
      })

        if (useTus) {
            uppy.use(Tus, { endpoint: endpoint, limit: 6 })
        }

    uppy.on("complete", (result) => {
      if (result.failed.length === 0) {
        console.log("Upload successful üòÄ")
        setState("completed")
      } else {
        console.warn("Upload failed üòû")
        setState("error")
      }
      console.log("successful files:", result.successful)
      console.log("failed files:", result.failed)
    })

    const setStateCb = (event: (typeof LISTENING_EVENTS)[number]) => {
      switch (event) {
        case "upload":
          setState("uploading")
          break
        case "upload-error":
          setState("error")
          break
        default:
          break
      }
      setUppyState(uppy.getState())
    }

    for (const event of LISTENING_EVENTS) {
      uppy.on(event, function cb() {
        setStateCb(event)
      })
    }
    setState("idle")
  }, [targetRef, endpoint, uploadLimit])

  useEffect(() => {
    return () => {
      uppyInstance.current?.cancelAll({ reason: "unmount" })
      uppyInstance.current?.logout()
      uppyInstance.current?.close()
      uppyInstance.current = undefined
    }
  }, [])
  return {
    getFiles: () => uppyInstance.current?.getFiles() ?? [],
    error: uppyInstance.current?.getState,
    state,
    upload: () =>
      uppyInstance.current?.upload() ??
      new Error("[useUppy] Uppy has not initialized yet."),
    getInputProps: () => inputProps,
    getRootProps,
    removeFile,
    cancelAll
  }
}
