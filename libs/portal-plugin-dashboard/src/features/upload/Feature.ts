import type { BaseCapability } from "@lumeweb/portal-framework-core";

import { createLargeFilePlugin, createSmallFilePlugin } from "@lib/util/uppy";
import {
  createNamespacedId,
  Framework,
  FrameworkFeature,
  getSdk,
  NamespacedId,
} from "@lumeweb/portal-framework-core";
import { Meta, UppyEventMap } from "@uppy/core";

import type { UploadCapability } from "@lib/types/capabilities/upload";

import { Manager, UppyFileDefault } from "@/features/upload/Manager";
import {
  IUploadManager,
  ServiceConfig,
  UPLOAD_TYPE_MAIN,
  UploadStatusType,
} from "@/types/upload";

// Capability type constants
export const PROTOCOL_CAPABILITY_TYPE = "core:protocol";
export const UPLOAD_CAPABILITY_TYPE = "core:upload";

export class Feature implements FrameworkFeature, IUploadManager {
  readonly id: NamespacedId = createNamespacedId("dashboard", "upload");
  status;
  version = "0.1.0";
  #uploadManager: Manager;

  addEvent<K extends keyof UppyEventMap<Meta, Body>>(
    event: K,
    callback: UppyEventMap<Meta, Body>[K],
  ) {
    return this.#uploadManager.addEvent(event, callback);
  }

  // Expose upload manager methods
  addFile(file: File, serviceId: string) {
    return this.#uploadManager.addFile(file, serviceId);
  }

  cancelAll() {
    return this.#uploadManager.cancelAll();
  }

  clearErrors() {
    return this.#uploadManager.clearErrors();
  }

  async destroy(framework: Framework): Promise<void> {
    // Cleanup logic
    this.#uploadManager.reset();
  }

  getFiles() {
    return this.#uploadManager.getFiles();
  }

  getManager() {
    return this.#uploadManager;
  }

  /**
   * Get all protocol capabilities that have associated upload capabilities
   */
  async getProtocolsWithUpload(
    framework: Framework,
  ): Promise<BaseCapability[]> {
    const protocols: BaseCapability[] = [];

    // Get all capabilities of type "core:protocol"
    const protocolCapabilities =
      await framework.getCapabilitiesByType<BaseCapability>(
        PROTOCOL_CAPABILITY_TYPE,
      );

    // For each protocol capability, check if it has upload capability associations
    for (const protocol of protocolCapabilities) {
      const associatedIds = await framework.getAssociatedCapabilities(
        protocol.id,
      );
      const associatedCaps = await Promise.all(
        associatedIds.map((id) => framework.getCapability(id)),
      );
      if (
        associatedCaps.some((cap) => cap && cap.type === UPLOAD_CAPABILITY_TYPE)
      ) {
        protocols.push(protocol);
      }
    }

    return protocols;
  }

  getServices(): ServiceConfig[] {
    return this.#uploadManager.getServices();
  }

  /**
   * Get upload capabilities associated with a specific protocol
   */
  async getUploadCapabilitiesForProtocol(
    framework: Framework,
    protocolId: string,
  ): Promise<BaseCapability[]> {
    const associatedIds = await framework.getAssociatedCapabilities(protocolId);
    const associatedCaps = await Promise.all(
      associatedIds.map((id) => framework.getCapability(id)),
    );
    return associatedCaps.filter(
      (cap) => cap && cap.type === UPLOAD_CAPABILITY_TYPE,
    ) as BaseCapability[];
  }

  getUploadedFiles(): UppyFileDefault[] {
    return this.#uploadManager.getUploadedFiles();
  }

  getUploadErrors(): Error[] {
    return this.#uploadManager.getUploadErrors();
  }

  getUploadProgress(): number {
    return this.#uploadManager.getUploadProgress();
  }

  getUploadStatus(): UploadStatusType {
    return this.#uploadManager.getUploadStatus();
  }

  async initialize(framework: Framework): Promise<void> {
    // Get SDK from framework capabilities
    const sdk = await getSdk(framework);

    // Initialize UploadManager with SDK
    this.#uploadManager = new Manager({ sdk, type: UPLOAD_TYPE_MAIN });
    await this.#uploadManager.init();

    // Get all protocol capabilities that have upload capabilities
    const protocolCapabilities = await this.getProtocolsWithUpload(framework);

    // For each protocol capability, get associated upload capabilities and register them as services
    for (const protocol of protocolCapabilities) {
      const uploadCapabilities = await this.getUploadCapabilitiesForProtocol(
        framework,
        protocol.id,
      );

      if (uploadCapabilities.length > 0) {
        // Use the first upload capability found
        const uploadCapability = uploadCapabilities[0] as UploadCapability;

        const serviceConfig: ServiceConfig = {
          id: protocol.id,
          largeFilePlugin: createLargeFilePlugin(
            uploadCapability.getLargeFileUploadConfig(),
            protocol.id,
            uploadCapability.getLargeFilePlugin?.(),
          ),
          name: protocol.getName(),
          smallFilePlugin: createSmallFilePlugin(
            uploadCapability.getSmallFileUploadConfig(),
            protocol.id,
            uploadCapability.getSmallFilePlugin?.(),
          ),
        };

        this.#uploadManager.registerService(serviceConfig);

        // Register additional plugins from the upload capability
        const additionalPlugins = uploadCapability.getAdditionalPlugins();
        for (const plugin of additionalPlugins) {
          this.#uploadManager.registerAdditionalPlugin(plugin);
        }
      }
    }
  }

  off(event: string, callback: (...args: any[]) => void): void {
    return this.#uploadManager.off(event, callback);
  }

  // Expose Uppy's event system directly
  on(event: string, callback: (...args: any[]) => void): () => void {
    return this.#uploadManager.on(event, callback);
  }

  removeFile(id: string) {
    return this.#uploadManager.removeFile(id);
  }

  setUIDropTarget(target: HTMLElement | null | string, serviceId?: string) {
    return this.#uploadManager.setUIDropTarget(target, serviceId);
  }

  start() {
    return this.#uploadManager.start();
  }
}
