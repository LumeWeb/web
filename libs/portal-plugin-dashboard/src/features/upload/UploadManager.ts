import { Sdk } from "@lumeweb/portal-sdk";
import Uppy, {
  BasePlugin,
  Body,
  Meta,
  UnknownPlugin,
  UppyEventMap,
  UppyFile,
} from "@uppy/core";
import DropTarget from "@uppy/drop-target";

import type { PluginConfig, ServiceConfig } from "@/types/upload";

export const PLUGIN_SUFFIX_REGEX = /-(?:small|large)$/;
export const PLUGIN_SMALL_SUFFIX_REGEX = /-small$/;
export const PLUGIN_LARGE_SUFFIX_REGEX = /-large$/;

export type UppyFileDefault = UppyFile<Meta, Body>;

type Plugin = (new (
  uppy: Uppy<Meta, Body>,
  ...args: any[]
) => InstanceType<typeof BasePlugin>) &
  typeof BasePlugin<any, Meta, Body>;

export class UploadManager {
  #sdk?: Sdk;
  #services: ServiceConfig[] = [];
  #uppy: Uppy<Meta, Body> = new Uppy<Meta, Body>();

  constructor(sdk?: Sdk) {
    this.#sdk = sdk;
    this.addEvent("file-added", (file: UppyFileDefault) => {
      const serviceId = this.getAssociatedServiceForFile(file);
      if (!file?.plugins?.length && serviceId) {
        this.patchFilesState({
          [file.id]: {
            plugins: [serviceId],
          },
        });
      }
    });
    this.addEvent("modify-upload-error", function (file, error) {
      if (error.request) {
        const xhr = error.request as XMLHttpRequest;
        if (xhr.status === 507) {
          error.details = "Upload quota exceeded";
        } else if (xhr.responseText.toLowerCase().includes("is not verified")) {
          error.details = "Please verify your email to upload files";
        }
      }
    });
  }

  public addEvent<K extends keyof UppyEventMap<Meta, Body>>(
    event: K,
    callback: UppyEventMap<Meta, Body>[K],
  ) {
    return this.#uppy.on(event, callback);
  }

  async addFile(file: File, serviceId: string) {
    const pluginId = await this.getFilePluginId(file, serviceId);

    this.#uppy.addFile({
      data: file,
      name: file.name,
      plugins: [pluginId],
      type: file.type,
    });
  }

  public cancelAll() {
    this.#uppy.cancelAll();
  }

  public clearUIDropTarget() {
    this.#uppy.iteratePlugins(
      (plugin) => plugin.id === "DropTarget" && this.#uppy.removePlugin(plugin),
    );
  }

  public getAssociatedServiceForFile(file: UppyFileDefault) {
    const plugins: UnknownPlugin<Meta, Body, Record<string, unknown>>[] = [];
    this.#uppy.iteratePlugins((plugin) => {
      plugins.push(plugin);
    });

    for (const plugin of plugins) {
      if (file.plugins?.includes(plugin.id)) {
        return plugin.id.replace(PLUGIN_SUFFIX_REGEX, "");
      }
    }
  }

  public async getFilePluginId(file: File, serviceId: string) {
    const service =
      this.#services.filter((item) => item.id === serviceId).length > 0;

    if (!service) {
      throw new Error(`Service ${serviceId} not registered`);
    }

    if (!this.#sdk) {
      throw new Error("SDK not initialized");
    }

    const uploadLimit = await this.#sdk.account().uploadLimit();

    return file.size >= uploadLimit
      ? `${serviceId}-large`
      : `${serviceId}-small`;
  }

  public getFiles() {
    return this.#uppy.getFiles();
  }

  public getServices() {
    return this.#services;
  }

  public iteratePlugins(method: (plugin: UnknownPlugin<Meta, Body>) => void) {
    this.#uppy.iteratePlugins(method);
  }

  public patchFilesState(
    filesWithNewState: Record<string, Partial<UppyFileDefault>>,
  ) {
    this.#uppy.patchFilesState(filesWithNewState);
  }

  registerService(config: ServiceConfig) {
    this.#services.push(config);

    this.#registerPlugin(config.id, config.smallFilePlugin, "small");
    this.#registerPlugin(config.id, config.largeFilePlugin, "large");
  }

  public removeCompletedUploads() {
    this.#uppy.getFiles().forEach((file) => {
      if (file.progress.uploadComplete) {
        this.#uppy.removeFile(file.id);
      }
    });
  }

  public removeEvent<K extends keyof UppyEventMap<Meta, Body>>(
    event: K,
    callback: UppyEventMap<Meta, Body>[K],
  ) {
    return this.#uppy.off(event, callback);
  }

  public removeFile(id: string) {
    this.#uppy.removeFile(id);
  }

  public removePlugin(plugin: InstanceType<Plugin>) {
    this.#uppy.removePlugin(plugin);
  }

  public reset() {
    this.#uppy.cancelAll();
    this.#services = [];
    this.#uppy.iteratePlugins((plugin) => {
      this.#uppy.removePlugin(plugin);
    });
  }

  public retryFile(file: UppyFileDefault) {
    this.#uppy.retryUpload(file.id);
  }

  public setUIDropTarget(target: HTMLElement | null | string) {
    this.clearUIDropTarget();
    this.#uppy.use(DropTarget, { target });
  }

  public start() {
    this.#uppy.upload();
  }

  public usePlugin(plugin: Plugin, ...args: any[]) {
    this.#uppy.use(plugin, ...args);
  }

  #registerPlugin(
    serviceId: string,
    pluginConfig: PluginConfig,
    size: "large" | "small",
  ) {
    this.#uppy.use<Plugin>(pluginConfig.plugin, {
      ...pluginConfig.options,
      id: `${serviceId}-${size}`,
    });
  }
}
