import type { BaseCapability } from "@lumeweb/portal-framework-core";

import {
  Framework,
  FrameworkFeature,
  NamespacedId,
  SdkCapability,
} from "@lumeweb/portal-framework-core";
import { Meta, UppyEventMap } from "@uppy/core";

import type { ProtocolCapability } from "@/capabilities/protocol";
import type { UploadCapability } from "@/capabilities/upload";
import type { ServiceConfig } from "@/types/upload";

import { UploadManager } from "./UploadManager";

// Capability type constants
export const PROTOCOL_CAPABILITY_TYPE = "core:protocol";
export const UPLOAD_CAPABILITY_TYPE = "core:upload";

export class UploadFeature implements FrameworkFeature {
  readonly id: NamespacedId = "dashboard:upload";
  status = "enabled" as const;
  version = "0.1.0";
  #uploadManager: UploadManager;

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

  async destroy(framework: Framework): Promise<void> {
    // Cleanup logic
    this.#uploadManager.reset();
  }

  getFiles() {
    return this.#uploadManager.getFiles();
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
      const associatedIds = await framework.getAssociatedCapabilities(protocol.id);
      const associatedCaps = await Promise.all(
        associatedIds.map(id => framework.getCapability(id))
      );
      if (associatedCaps.some((cap) => cap && cap.type === UPLOAD_CAPABILITY_TYPE)) {
        protocols.push(protocol);
      }
    }

    return protocols;
  }

  async getSdk(framework: Framework) {
    // Get SDK from framework capabilities
    const sdkCaps =
      await framework.getCapabilitiesByType<SdkCapability>("core:sdk");

    if (!sdkCaps?.length) {
      throw new Error("SDK not found");
    }

    return sdkCaps[0].getSdk();
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
      associatedIds.map(id => framework.getCapability(id))
    );
    return associatedCaps.filter((cap) => cap && cap.type === UPLOAD_CAPABILITY_TYPE) as BaseCapability[];
  }

  async initialize(framework: Framework): Promise<void> {
    // Get SDK from framework capabilities
    const sdk = await this.getSdk(framework);

    // Initialize UploadManager with SDK
    this.#uploadManager = new UploadManager(sdk);

    // Get all protocol capabilities that have upload capabilities
    const protocolCapabilities = await this.getProtocolsWithUpload(framework);

    // For each protocol capability, get associated upload capabilities and register them as services
    for (const protocol of protocolCapabilities) {
      const uploadCapabilities = await this.getUploadCapabilitiesForProtocol(
        framework,
        protocol.id
      );

      if (uploadCapabilities.length > 0) {
        // Use the first upload capability found
        const uploadCapability = uploadCapabilities[0] as UploadCapability;
        const uploadConfig = uploadCapability.getUploadConfig();

        const serviceConfig: ServiceConfig = {
          id: protocol.id,
          largeFilePlugin: {
            options:
              uploadCapability.createSmallFilePlugin(uploadConfig).options ||
              {},
            plugin: uploadCapability.createSmallFilePlugin(uploadConfig).module,
          },
          name: protocol.getName(),
          smallFilePlugin: {
            options:
              uploadCapability.createLargeFilePlugin(uploadConfig).options ||
              {},
            plugin: uploadCapability.createLargeFilePlugin(uploadConfig).module,
          },
        };

        this.#uploadManager.registerService(serviceConfig);
      }
    }
  }

  removeFile(id: string) {
    return this.#uploadManager.removeFile(id);
  }

  start() {
    return this.#uploadManager.start();
  }
}
