// Copied from https://github.com/transloadit/uppy/blob/main/packages/%40uppy/drop-target/src/index.ts
// Is a less invasive implementation that allows for better unstyled integration

import {
  type Uppy,
  type PluginOptions,
  type BasePlugin as TUppyBasePlugin
} from "@uppy/core"
// @ts-expect-error -- Uppy types are all over the place it really is weird
import UppyBasePlugin from "@uppy/core/lib/BasePlugin"
import type { IndexedObject } from "@uppy/utils"
import getDroppedFiles from "@uppy/utils/lib/getDroppedFiles"
import toArray from "@uppy/utils/lib/toArray"

export type DropTargetOptions = PluginOptions & {
  target?: HTMLElement | string | null
  onDrop?: (event: DragEvent) => void
  onDragOver?: (event: DragEvent) => void
  onDragLeave?: (event: DragEvent) => void
}
const BasePlugin = UppyBasePlugin as typeof TUppyBasePlugin<DropTargetOptions>

type Meta = {
  relativePath?: string | null
}
type Body = IndexedObject<unknown>

// Default options
const defaultOpts = {
  target: null,
} satisfies DropTargetOptions

interface DragEventWithFileTransfer extends DragEvent {
  dataTransfer: NonNullable<DragEvent["dataTransfer"]>
}

function isFileTransfer(event: DragEvent): event is DragEventWithFileTransfer {
  return event.dataTransfer?.types?.some((type) => type === "Files") ?? false
}

/**
 * Drop Target plugin
 *
 */
class DropTarget<M extends Meta, B extends Body> extends BasePlugin {
  static VERSION = "lume-internal"

  private removeDragOverDataAttr: ReturnType<typeof setTimeout> | undefined
  private nodes?: Array<HTMLElement>

  public opts: DropTargetOptions

  constructor(uppy: Uppy<M, B>, opts?: DropTargetOptions) {
    super(uppy, { ...defaultOpts, ...opts })
    this.opts = opts || defaultOpts
    this.type = "acquirer"
    this.id = this.opts.id || "DropTarget"
    // @ts-expect-error TODO: remove in major
    this.title = "Drop Target"
  }

  addFiles = (files: Array<File>): void => {
    const descriptors = files.map((file) => ({
      source: this.id,
      name: file.name,
      type: file.type,
      data: file,
      meta: {
        // path of the file relative to the ancestor directory the user selected.
        // e.g. 'docs/Old Prague/airbnb.pdf'
        relativePath: (file as { relativePath?: string }).relativePath || null
      } as Meta
    }))

    try {
      this.uppy.addFiles(descriptors)
    } catch (err) {
      this.uppy.log(err as string)
    }
  }

  handleDrop = async (event: DragEvent): Promise<void> => {
    if (!isFileTransfer(event)) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    clearTimeout(this.removeDragOverDataAttr)

    // Remove dragover class
    if (event.currentTarget) {
      (event.currentTarget as HTMLElement).dataset.uppyIsDragOver = "false"
      this.setPluginState({ isDraggingOver: false })
    }

    // Let any acquirer plugin (Url/Webcam/etc.) handle drops to the root
    this.uppy.iteratePlugins((plugin) => {
      if (plugin.type === "acquirer") {
        // @ts-expect-error Every Plugin with .type acquirer can define handleRootDrop(event)
        plugin.handleRootDrop?.(event)
      }
    })

    // Add all dropped files, handle errors
    let executedDropErrorOnce = false
    const logDropError = (error: Error): void => {
      this.uppy.log(error.message, "error")

      // In practice all drop errors are most likely the same,
      // so let's just show one to avoid overwhelming the user
      if (!executedDropErrorOnce) {
        this.uppy.info(error.message, "error")
        executedDropErrorOnce = true
      }
    }

    const files = await getDroppedFiles(event.dataTransfer, { logDropError })
    if (files.length > 0) {
      this.uppy.log("[DropTarget] Files were dropped")
      this.addFiles(files)
    }

    this.opts.onDrop?.(event)
  }

  handleDragOver = (event: DragEvent): void => {
    if (!isFileTransfer(event)) {
      return
    }

    event.preventDefault()
    event.stopPropagation()

    // Add a small (+) icon on drop
    // (and prevent browsers from interpreting this as files being _moved_ into the browser,
    // https://github.com/transloadit/uppy/issues/1978)
    event.dataTransfer.dropEffect = "copy" // eslint-disable-line no-param-reassign

    clearTimeout(this.removeDragOverDataAttr)
    ;(event.currentTarget as HTMLElement).dataset.uppyIsDragOver = "true"
    this.setPluginState({ isDraggingOver: true })
    this.opts.onDragOver?.(event)
  }

  handleDragLeave = (event: DragEvent): void => {
    if (!isFileTransfer(event)) {
      return
    }

    event.preventDefault()
    event.stopPropagation()

    const { currentTarget } = event

    clearTimeout(this.removeDragOverDataAttr)
    // Timeout against flickering, this solution is taken from drag-drop library.
    // Solution with 'pointer-events: none' didn't work across browsers.
    this.removeDragOverDataAttr = setTimeout(() => {
      (currentTarget as HTMLElement).dataset.uppyIsDragOver = "false"
      this.setPluginState({ isDraggingOver: false })
    }, 50)
    this.opts.onDragLeave?.(event)
  }

  addListeners = (): void => {
    const { target } = this.opts

    if (target instanceof Element) {
      this.nodes = [target]
    } else if (typeof target === "string") {
      this.nodes = toArray(document.querySelectorAll(target))
    }

    if (!this.nodes || this.nodes.length === 0) {
      throw new Error(`"${target}" does not match any HTML elements`)
    }

    for (const node of this.nodes) {
      node.addEventListener("dragover", this.handleDragOver, false)
      node.addEventListener("dragleave", this.handleDragLeave, false)
      node.addEventListener("drop", this.handleDrop, false)
    }
  }

  removeListeners = (): void => {
    if (this.nodes) {
      for (const node of this.nodes) {
        node.removeEventListener("dragover", this.handleDragOver, false)
        node.removeEventListener("dragleave", this.handleDragLeave, false)
        node.removeEventListener("drop", this.handleDrop, false)
      }
    }
  }

  install(): void {
    this.setPluginState({ isDraggingOver: false })
    this.addListeners()
  }

  uninstall(): void {
    this.removeListeners()
  }
}

export default DropTarget
