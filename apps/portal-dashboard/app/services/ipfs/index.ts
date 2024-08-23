import BaseService from "~/services/base";
import getUploadManager from "~/features/uploadManager/store/getUploadManager";
import XHRUpload, { XhrUploadOpts } from "@uppy/xhr-upload";
import TusUpload, { TusOpts } from "@uppy/tus";
import CarPreprocessorPlugin from "~/services/ipfs/carPreprocessor";
import getProtocolDomain from "~/util/getProtocolDomain";
import getSdk from "~/stores/getSdk.js";
import dataProvider from "@refinedev/simple-rest";
import {
  DataProvider,
  GetListParams,
  GetListResponse,
  ResourceProps,
} from "@refinedev/core";
import { createColumnHelper } from "@tanstack/react-table";

const SERVICE_ID = "ipfs";
const SERVICE_NAME = "IPFS";

interface PinResult {
  requestid: string;
  status: "queued" | "pinning" | "pinned" | "failed";
  created: string;
  pin: {
    cid: string;
    name: string;
  };
  delegates: any[];
}

interface PinsResponse {
  count: number;
  results: PinResult[];
}

const mapPinsResponseToGetListResult = (
  response: PinsResponse,
): GetListResponse<PinResult> => ({
  data: response.results,
  total: response.count,
});

export class IPFS extends BaseService {
  public id(): string {
    return SERVICE_ID;
  }

  public name(): string {
    return SERVICE_NAME;
  }

  public register(): void {
    getProtocolDomain(SERVICE_ID).then((domain) => {
      getUploadManager().registerService({
        id: SERVICE_ID,
        name: SERVICE_NAME,
        largeFilePlugin: {
          plugin: TusUpload,
          options: {
            endpoint: `https://${domain}/api/upload/tus`,
            withCredentials: true,
            headers: this.#getAuthHeaders(),
            storeFingerprintForResuming: false,
          } satisfies Partial<TusOpts<any, any>>,
        },
        smallFilePlugin: {
          plugin: XHRUpload,
          options: {
            withCredentials: true,
            endpoint: `https://${domain}/api/upload`,
            method: "POST",
            headers: this.#getAuthHeaders(),
          } satisfies Partial<XhrUploadOpts<any, any>>,
        },
      });
      getUploadManager().usePlugin(CarPreprocessorPlugin);
    });
  }

  public async dataProvider() {
    const apiDomain = await getProtocolDomain(SERVICE_ID);
    const baseUrl = `https://${apiDomain}`;

    const restProvider = dataProvider(baseUrl);

    return {
      ...restProvider,
      getList: async (
        params: GetListParams,
      ): Promise<GetListResponse<PinResult>> => {
        try {
          const response = await restProvider.getList(params);
          // Check if the response matches the expected PinsResponse structure
          if ("count" in response.data && "results" in response.data) {
            return mapPinsResponseToGetListResult(
              response.data as PinsResponse,
            );
          } else {
            // If the response doesn't match PinsResponse, assume it's already in the correct format
            return response as GetListResponse<PinResult>;
          }
        } catch (error) {
          throw error;
        }
      },
    } as DataProvider;
  }

  public resources() {
    return [
      {
        name: "pins",
        meta: {
          headers: this.#getAuthHeaders(),
        },
      },
    ] satisfies ResourceProps[];
  }

  public UIUploadQueueColumns() {
    const columnHelper = createColumnHelper<PinResult>();

    return [
      columnHelper.accessor("pin.name", {
        cell: (info) => {
          const name = info.getValue();
          return name && name.trim() !== "" ? name : info.row.original.pin.cid;
        },
        header: "Name",
      }),
      columnHelper.accessor("pin.cid", {
        cell: (info) => info.getValue(),
        header: "CID",
      }),
      columnHelper.accessor("created", {
        cell: (info) => new Date(info.getValue()).toLocaleString(),
        header: "Created",
      }),
      columnHelper.accessor("status", {
        cell: (info) => getPinLabel(info.getValue()),
        header: "Status",
      }),
    ];
  }

  public UIUploadQueueResource() {
    return "pins";
  }

  #getAuthHeaders() {
    return {
      Authorization: `Bearer ${getSdk()?.account().jwtToken}`,
    };
  }
}

function getPinLabel(status: PinResult["status"]) {
  switch (status) {
    case "queued":
      return "Queued";
    case "pinning":
      return "Pinning";
    case "pinned":
      return "Pinned";
    case "failed":
      return "Failed";
  }

  return "Unknown";
}
