import type { Pinner } from "@/pinner";
import {
  createBase64UploadBuilder,
  createCidUploadBuilder,
  createFileArrayUploadBuilder,
  createJsonUploadBuilder,
  createUploadBuilder,
  createUrlUploadBuilder,
} from "./builder";
import { createListBuilder } from "./list-builder";
import type {
  PinataFile,
  PinataListBuilder,
  PinataPin,
  PinataUploadBuilder,
  PinataUploadResult,
  PinByHashOptions,
} from "@/types/pinata";
import { CID } from "multiformats/cid";

/**
 * Creates a Pinata-compatible adapter for the Pinner client.
 * This allows users to migrate from Pinata SDK with minimal code changes.
 */
export interface PinataAdapter {
  upload: {
    file(file: File): PinataUploadBuilder<PinataUploadResult>;
    fileArray(files: File[]): PinataUploadBuilder<PinataUploadResult>;
    json(data: object): PinataUploadBuilder<PinataUploadResult>;
    base64(base64String: string): PinataUploadBuilder<PinataUploadResult>;
    url(urlString: string): PinataUploadBuilder<PinataUploadResult>;
    cid(cidString: string): PinataUploadBuilder<void>;
  };

  pinByHash(cid: string, options?: PinByHashOptions): Promise<void>;
  unpin(cid: string): Promise<void>;
  getPinStatus(cid: string): Promise<PinataPin>;
  isPinned(cid: string): Promise<boolean>;
  setPinMetadata(cid: string, metadata: Record<string, string>): Promise<void>;

  files: {
    list(): PinataListBuilder<PinataFile[]>;
    get(id: string): Promise<PinataFile>;
  };
}

/**
 * Creates a Pinata-compatible adapter for the Pinner client.
 */
export function pinataAdapter(pinner: Pinner): PinataAdapter {
  return {
    upload: {
      file(file: File): PinataUploadBuilder<PinataUploadResult> {
        return createUploadBuilder(pinner, file);
      },
      fileArray(files: File[]): PinataUploadBuilder<PinataUploadResult> {
        return createFileArrayUploadBuilder(pinner, files);
      },
      json(data: object): PinataUploadBuilder<PinataUploadResult> {
        return createJsonUploadBuilder(pinner, data);
      },
      base64(base64String: string): PinataUploadBuilder<PinataUploadResult> {
        return createBase64UploadBuilder(pinner, base64String);
      },
      url(urlString: string): PinataUploadBuilder<PinataUploadResult> {
        return createUrlUploadBuilder(pinner, urlString);
      },
      cid(cidString: string): PinataUploadBuilder<void> {
        return createCidUploadBuilder(pinner, cidString);
      },
    },

    async pinByHash(cid: string, options?: PinByHashOptions): Promise<void> {
      const cidObj = CID.parse(cid);
      const generatorPromise = pinner.pinByHash(cidObj, {
        name: options?.name,
        metadata: options?.keyvalues,
      });

      const generator = await generatorPromise;
      for await (const _ of generator) {
        // Pin operation in progress
      }
    },

    async unpin(cid: string): Promise<void> {
      await pinner.unpin(cid);
    },

    async getPinStatus(cid: string): Promise<PinataPin> {
      const cidObj = CID.parse(cid);
      const remotePin = await pinner.getPinStatus(cidObj);

      return {
        id: cidObj.toString(),
        ipfsPinHash: cidObj.toString(),
        size: remotePin.size || 0,
        userId: "",
        datePinned: remotePin.created.toISOString(),
        metadata: {
          name: remotePin.name,
          keyvalues: remotePin.metadata,
        },
      };
    },

    async isPinned(cid: string): Promise<boolean> {
      const cidObj = CID.parse(cid);
      return pinner.isPinned(cidObj);
    },

    async setPinMetadata(
      cid: string,
      metadata: Record<string, string>,
    ): Promise<void> {
      const cidObj = CID.parse(cid);
      await pinner.setPinMetadata(cidObj, metadata);
    },

    files: {
      list(): PinataListBuilder<PinataFile[]> {
        return createListBuilder(pinner);
      },
      async get(id: string): Promise<PinataFile> {
        const pins = await pinner.listPins();
        const pin = pins.find((p) => p.cid.toString() === id);

        if (!pin) {
          throw new Error(`Pin not found: ${id}`);
        }

        return {
          id: pin.cid.toString(),
          ipfsPinHash: pin.cid.toString(),
          size: pin.size || 0,
          name: pin.name || "",
          cid: pin.cid.toString(),
          createdAt: pin.created.toISOString(),
        };
      },
    },
  };
}
