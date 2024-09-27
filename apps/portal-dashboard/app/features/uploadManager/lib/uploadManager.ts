import Uppy, {
  BasePlugin,
  Body,
  Meta,
  UnknownPlugin,
  UppyEventMap,
  UppyFile,
} from "@uppy/core";
import {
  PluginConfig,
  ServiceConfig,
} from "@/features/uploadManager/api/service";
import getSdk from "@/stores/getSdk";
import DropTarget from "@uppy/drop-target";

export const PLUGIN_SUFFIX_REGEX = /-(?:small|large)$/;
export const PLUGIN_SMALL_SUFFIX_REGEX = /-small$/;
export const PLUGIN_LARGE_SUFFIX_REGEX = /-large$/;

type Plugin = typeof BasePlugin<any, Meta, Body> & {
  new (uppy: Uppy<Meta, Body>, ...args: any[]): InstanceType<typeof BasePlugin>;
};

export type UppyFileDefault = UppyFile<Meta, Body>;

export default class UploadManager {
  #uppy: Uppy<Meta, Body> = new Uppy<Meta, Body>();
  #services: ServiceConfig[] = [];
  constructor() {
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

  registerService(config: ServiceConfig) {
    this.#services.push(config);

    this.#registerPlugin(config.id, config.smallFilePlugin, "small");
    this.#registerPlugin(config.id, config.largeFilePlugin, "large");
  }

  async addFile(file: File, serviceId: string) {
    const pluginId = await this.getFilePluginId(file, serviceId);

    this.#uppy.addFile({
      name: file.name,
      type: file.type,
      data: file,
      plugins: [pluginId],
    });
  }

  public getServices() {
    return this.#services;
  }

  public start() {
    this.#uppy.upload();
  }

  public getFiles() {
    return this.#uppy.getFiles();
  }

  public removeFile(id: string) {
    this.#uppy.removeFile(id);
  }

  public getAssociatedServiceForFile(file: UppyFileDefault) {
    let plugins: UnknownPlugin<Meta, Body, Record<string, unknown>>[] = [];
    this.#uppy.iteratePlugins((plugin) => {
      plugins.push(plugin);
    });

    for (const plugin of plugins) {
      if (file.plugins?.includes(plugin.id)) {
        return plugin.id.replace(PLUGIN_SUFFIX_REGEX, "");
      }
    }
  }

  public cancelAll() {
    this.#uppy.cancelAll();
  }

  public usePlugin(plugin: Plugin, ...args: any[]) {
    this.#uppy.use(plugin, ...args);
  }

  public removePlugin(plugin: InstanceType<Plugin>) {
    this.#uppy.removePlugin(plugin);
  }

  public patchFilesState(filesWithNewState: {
    [id: string]: Partial<UppyFileDefault>;
  }) {
    this.#uppy.patchFilesState(filesWithNewState);
  }

  public iteratePlugins(method: (plugin: UnknownPlugin<Meta, Body>) => void) {
    this.#uppy.iteratePlugins(method);
  }

  public removeCompletedUploads() {
    this.#uppy.getFiles().forEach((file) => {
      if (file.progress.uploadComplete) {
        this.#uppy.removeFile(file.id);
      }
    });
  }

  #registerPlugin(
    serviceId: string,
    pluginConfig: PluginConfig,
    size: "small" | "large",
  ) {
    this.#uppy.use<Plugin>(pluginConfig.plugin, {
      ...pluginConfig.options,
      id: `${serviceId}-${size}`,
    });
  }

  public addEvent<K extends keyof UppyEventMap<Meta, Body>>(
    event: K,
    callback: UppyEventMap<Meta, Body>[K],
  ) {
    return this.#uppy.on(event, callback);
  }

  public removeEvent<K extends keyof UppyEventMap<Meta, Body>>(
    event: K,
    callback: UppyEventMap<Meta, Body>[K],
  ) {
    return this.#uppy.off(event, callback);
  }

  public retryFile(file: UppyFileDefault) {
    this.#uppy.retryUpload(file.id);
  }

  public async getFilePluginId(file: File, serviceId: string) {
    const service =
      this.#services.filter((item) => item.id === serviceId).length > 0;

    if (!service) {
      throw new Error(`Service ${serviceId} not registered`);
    }

    const sdk = getSdk();

    if (!sdk) {
      throw new Error("SDK not initialized");
    }

    const uploadLimit = await sdk.account().uploadLimit();

    return file.size >= uploadLimit
      ? `${serviceId}-large`
      : `${serviceId}-small`;
  }

  public reset() {
    this.#uppy.cancelAll();
    this.#services = [];
    this.#uppy.iteratePlugins((plugin) => {
      this.#uppy.removePlugin(plugin);
    });
  }

  public setUIDropTarget(target: HTMLElement | string | null) {
    this.clearUIDropTarget();
    this.#uppy.use(DropTarget, { target });
  }

  public clearUIDropTarget() {
    this.#uppy.iteratePlugins(
      (plugin) => plugin.id === "DropTarget" && this.#uppy.removePlugin(plugin),
    );
  }
}
