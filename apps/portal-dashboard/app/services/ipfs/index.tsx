import BaseService, {
  BreadCrumbPath,
  BreadCrumbPathHook,
  FileBlob,
  NavigateToCIDHook,
} from "@/services/base";
import getUploadManager from "@/features/uploadManager/store/getUploadManager";
import XHRUpload, { XhrUploadOpts } from "@uppy/xhr-upload";
import TusUpload, { TusOpts } from "@uppy/tus";
import CarPreprocessorPlugin from "@/services/ipfs/carPreprocessor";
import getProtocolDomain from "@/util/getProtocolDomain";
import getSdk from "@/stores/getSdk.js";
import dataProvider from "@refinedev/simple-rest";
import {
  CreateParams,
  CreateResponse,
  CrudFilter,
  CrudFilters,
  DataProvider,
  DeleteOneParams,
  DeleteOneResponse,
  GetListParams,
  GetListResponse,
  LogicalFilter,
  ResourceProps,
  useList,
  useNavigation,
  useParsed,
} from "@refinedev/core";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { CID } from "multiformats/cid";
import { Helia } from "helia";
import fetchPortalMeta from "@/util/fetchPortalMeta.js";
import getPortalUrl from "@/stores/getPortalUrl.js";
import { IDBBlockstore } from "blockstore-idb";
import { IDBDatastore } from "datastore-idb";
import { createHeliaHTTP } from "@helia/http";
import { createRemotePinner, HeliaRemotePinner } from "@helia/remote-pinning";
import {
  Configuration,
  PinResults,
  PinsGetRequest,
  RemotePinningServiceClient,
  Status,
} from "@ipfs-shipyard/pinning-service-client";
import { Folder } from "lucide-react";
import { Button } from "apps/web3.news/app/components/ui/button";
import { IPFS_SUBFOLDER_ROUTE } from "@/routeConfig";
import { IPFS_SERVICE_ID } from "@/config";
import { FileIcon } from "@/components/icons";
import { DataType, FileTree, FileTreeNode, PinStatus } from "./fileTree";
import CIDTooltip from "@/routes/service/components/CIDToolTip";
import ItemActions from "@/routes/service/components/ItemActions";
import { unixfs } from "@helia/unixfs";
import { httpGatewayRouting } from "@helia/routers";
import defer from "p-defer";
import Mutex from "p-mutex";
import { trustlessGateway } from "@helia/block-brokers";
import React from "react";
import { CopyButton } from "@/routes/service/components/CopyButton";
import { Tag } from "@/components/ui/tag-input.js";

export const SERVICE_ID = IPFS_SERVICE_ID;
const SERVICE_NAME = "IPFS";

const defaultPinMeta: PinStatus["info"] = {
  folder: false,
  contentType: "",
} satisfies PinStatus["info"];

const mapPinsResponseToGetListResult = (
  response: PinResults,
): GetListResponse<PinStatus> => ({
  data: Array.from(response.results.values()).map(
    (pin): PinStatus => ({
      ...pin,
      info: {
        ...defaultPinMeta,
        ...(pin.info || {}),
      },
    }),
  ),
  total: response.count,
});

export class IPFS extends BaseService {
  #helia?: Helia;
  #pinner?: HeliaRemotePinner;
  #remoteClient?: RemotePinningServiceClient;
  #restProvider?: DataProvider;
  #fileTree?: FileTree;
  #lastPinSet?: PinStatus[];
  #lastPinSetDefer = defer<PinStatus[]>();
  #lastPinSetMutex = new Mutex();

  public id(): string {
    return SERVICE_ID;
  }

  public name(): string {
    return SERVICE_NAME;
  }

  public register(): void {
    (async () => {
      const protocolDomain = await getProtocolDomain(SERVICE_ID);
      const apiDomain = `https://${protocolDomain}`;
      getUploadManager().registerService({
        id: SERVICE_ID,
        name: SERVICE_NAME,
        largeFilePlugin: {
          plugin: TusUpload,
          options: {
            endpoint: `${apiDomain}/api/upload/tus`,
            withCredentials: true,
            headers: this.#getAuthHeaders(),
            storeFingerprintForResuming: false,
          } satisfies Partial<TusOpts<any, any>>,
        },
        smallFilePlugin: {
          plugin: XHRUpload,
          options: {
            withCredentials: true,
            endpoint: `${apiDomain}/api/upload`,
            method: "POST",
            headers: this.#getAuthHeaders(),
          } satisfies Partial<XhrUploadOpts<any, any>>,
        },
      });
      getUploadManager().usePlugin(CarPreprocessorPlugin);
    })();
  }

  public async getRestProvider() {
    if (!this.#restProvider) {
      const apiDomain = await getProtocolDomain(SERVICE_ID);
      const baseUrl = `https://${apiDomain}`;

      this.#restProvider = dataProvider(baseUrl);
    }

    return this.#restProvider;
  }

  public async getFileTree() {
    if (!this.#fileTree) {
      this.#fileTree = new FileTree(
        await this.getRestProvider(),
        this.#getAuthHeaders(),
      );
      await this.#fileTree.initialize();
    }

    return this.#fileTree;
  }

  public async dataProvider() {
    const that = this;

    const restProvider = await this.getRestProvider();

    return {
      ...restProvider,
      async getList(
        params: GetListParams,
      ): Promise<GetListResponse<PinStatus>> {
        const { pagination = {}, filters, meta } = params;
        const { current = 1, pageSize = 50 } = pagination;
        const offset = (current - 1) * pageSize;

        const client = await that.getRemoteClient();
        let status: Set<Status> | undefined;

        if (filters?.length) {
          status = extractStatusFilters(filters);
        }

        const pinsGetOptions: PinsGetRequest = {
          status: status,
          limit: meta?.tree ? undefined : pageSize, // Fetch all pins if tree logic is needed
          ...(meta?.before && { before: new Date(meta.before) }),
        };

        const { count, results: resultsSet }: PinResults =
          await client.pinsGet(pinsGetOptions);

        let pinStatuses = Array.from(resultsSet).map((result) => ({
          ...result,
          info: {
            ...defaultPinMeta,
            ...result.info,
          },
        }));

        if (meta?.tree) {
          const parentCid = meta.parentCid || null;
          const fileTree = await that.getFileTree();

          // Use FileTreeBackend to get nodes
          let nodes = await fileTree.getNodesForPins(
            pinStatuses,
            parentCid,
            offset,
            pageSize,
          );

          // Extract PinStatus objects from nodes
          pinStatuses = nodesToPins(nodes);
        }

        if (filters?.length) {
          pinStatuses = applyFilters(pinStatuses, filters);
        }

        // Apply pagination if not already done by tree logic
        if (!meta?.tree) {
          pinStatuses = pinStatuses.slice(offset, offset + pageSize);
        }

        return {
          data: pinStatuses,
          total: meta?.tree && meta.parentCid ? pinStatuses.length : count,
        };
      },
      async create(
        params: CreateParams<{ cid: Tag[] }>,
      ): Promise<CreateResponse<any>> {
        if (params.resource !== SERVICE_ID) {
          return restProvider.create(params);
        }

        const cids = params.variables.cid.map((tag) => tag.text);
        const remoteClient = await that.getRemoteClient();
        for (const cid of cids) {
          // @ts-ignore
          await remoteClient?.pinsPost({ pin: { cid } });
        }

        return {} as CreateResponse;
      },
      async deleteOne(
        params: DeleteOneParams,
      ): Promise<DeleteOneResponse<any>> {
        const pinSet = await that.getCachedPinSet();
        const cid = CID.parse(params.id as string);

        const pin = pinSet.find((pin) =>
          CID.parse(pin.pin.cid).toV1().equals(cid),
        );

        if (!pin) {
          throw new Error("Pin not found");
        }

        const remote = await that.getRemoteClient();
        await remote?.pinsRequestidDelete({ requestid: pin.requestid });

        return {} as DeleteOneResponse;
      },
    } as DataProvider;
  }

  public resources() {
    return [
      {
        name: "ipfs",
        meta: {
          headers: this.#getAuthHeaders(),
        },
      },
    ] satisfies ResourceProps[];
  }

  public UIUploadQueueColumns() {
    const columnHelper = createColumnHelper<PinStatus>();

    return [
      columnHelper.accessor("pin.name", {
        cell: (info) => {
          return (
            info.getValue() ||
            CID.parse(info.row.original.pin.cid).toV1().toString()
          );
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
    return SERVICE_NAME;
  }

  public async getHelia() {
    if (!this.#helia) {
      const meta = await fetchPortalMeta(getPortalUrl());
      const protocolDomain = await getProtocolDomain(SERVICE_ID);

      const blockstore = new IDBBlockstore(meta.domain);
      const datastore = new IDBDatastore(meta.domain);

      await blockstore.open();
      await datastore.open();

      this.#helia = await createHeliaHTTP({
        blockBrokers: [
          trustlessGateway({
            headers: this.#getAuthHeaders(),
          }),
        ],
        routers: [
          httpGatewayRouting({
            gateways: [`https://${protocolDomain}`],
          }),
        ],
        blockstore,
        datastore,
      });
    }

    return this.#helia;
  }

  public async getPinner() {
    if (!this.#pinner) {
      const helia = await this.getHelia();
      const remotePinningClient = await this.getRemoteClient();

      this.#pinner = createRemotePinner(helia, remotePinningClient);
    }

    return this.#pinner;
  }

  public async getRemoteClient() {
    if (!this.#remoteClient) {
      const domain = await getProtocolDomain(SERVICE_ID);
      const pinServiceConfig = new Configuration({
        endpointUrl: `https://${domain}`,
        accessToken: `${getSdk()!.account().jwtToken}`,
      });
      this.#remoteClient = new RemotePinningServiceClient(pinServiceConfig);
    }

    return this.#remoteClient;
  }

  #getAuthHeaders() {
    return {
      Authorization: `Bearer ${getSdk()?.account().jwtToken}`,
    };
  }

  UIFileManagerColumns(): ColumnDef<any, any>[] {
    const columnHelper = createColumnHelper<PinStatus>();

    const nav = useNavigation();

    const navigateToFolder = (file: PinStatus) => {
      nav.show(IPFS_SUBFOLDER_ROUTE, file.pin.cid);
    };

    return [
      columnHelper.accessor("pin.name", {
        cell: (info) => {
          const name = info.getValue() || info.row.original.pin.cid;
          const isFolder = info.row.original.info.folder;

          return (
            <div className="flex items-center">
              <>
                {isFolder ? (
                  <Button
                    variant="ghost"
                    className="p-0 hover:bg-transparent"
                    onClick={() => navigateToFolder(info.row.original)}>
                    <Folder className="inline mr-2" />
                    {name}
                  </Button>
                ) : (
                  <>
                    <FileIcon className="inline mr-2" />
                    {name}
                  </>
                )}
                <CopyButton text={name} showText={false} />
              </>
            </div>
          );
        },
        header: "Name",
      }),
      columnHelper.accessor("pin.cid", {
        cell: (info) => <CIDTooltip cid={CID.parse(info.getValue())} />,
        header: "CID",
      }),
      columnHelper.accessor("created", {
        cell: (info) => new Date(info.getValue()).toLocaleString(),
        header: "Created",
      }),
      columnHelper.display({
        header: "Actions",
        id: "actions",
        cell: (info) => (
          <ItemActions
            cid={CID.parse(info.row.original.pin.cid)}
            isFolder={info.row.original.info.folder}
            suggestedDownloadName={info.row.original.pin.name}
          />
        ),
        meta: {
          className: "text-right",
        },
        size: 50,
      }),
    ];
  }

  validateCid(cid: string): boolean {
    try {
      CID.parse(cid);
      return true;
    } catch (e) {
      return false;
    }
  }

  async downloadFile(cid: CID): Promise<FileBlob> {
    const fs = unixfs(await this.getHelia());

    const chunks = [];
    let totalLength = 0;
    for await (const chunk of fs.cat(cid)) {
      chunks.push(chunk);
      totalLength += chunk.length;
    }

    // Allocate a single Uint8Array of the total size
    const content = new Uint8Array(totalLength);

    // Copy each chunk into the content array
    let offset = 0;
    for (const chunk of chunks) {
      content.set(chunk, offset);
      offset += chunk.length;
    }

    const tree = await this.getFileTree();
    const meta = await tree.getBlockMeta(cid.toString());

    return {
      name: meta.name || cid.toV1().toString(),
      mimeType: "application/octet-stream",
      blob: new Blob([content], { type: "application/octet-stream" }),
    };
  }

  UIFileManagerCurrentBreadcrumbPathHook(): BreadCrumbPathHook {
    const parsed = useParsed();

    return async () => {
      const getName = async (pin: PinStatus) => {
        const fileTree = await this.getFileTree();
        const meta = await fileTree.getBlockMeta(pin.pin.cid);
        return pin.pin.name || meta.name || pin.pin.cid;
      };

      if (this.#lastPinSet?.length === 0 || !parsed.id) {
        return [];
      }

      const parts: BreadCrumbPath = [];
      const fileTree = await this.getFileTree();
      let lastCid;

      try {
        lastCid = CID.parse(parsed.id as string).toV1();
      } catch (e) {
        return [];
      }

      const pinSet = await this.getCachedPinSet();

      const lastFiltered = this.#lastPinSet?.filter((pin) => {
        return CID.parse(pin.pin.cid).toV1().equals(lastCid);
      });

      if (!lastFiltered?.length) {
        return [];
      }

      let lastPin: PinStatus | null = lastFiltered[0];
      let isFirstIteration = true;

      while (lastPin) {
        let found = false;
        for (const pin of pinSet!) {
          const meta = await fileTree.getBlockMeta(pin.pin.cid.toString());
          if (meta.child_cid.includes(lastPin.pin.cid)) {
            if (!isFirstIteration || parts.length === 0) {
              parts.unshift({
                name: await getName(lastPin),
                cid: CID.parse(lastPin.pin.cid).toV1(),
              });
            }
            lastPin = pin;
            found = true;
            break;
          }
        }

        if (!found) {
          if (
            parts.length === 0 ||
            !CID.parse(lastPin.pin.cid).toV1().equals(parts[0].cid)
          ) {
            parts.unshift({
              name: await getName(lastPin),
              cid: CID.parse(lastPin.pin.cid).toV1(),
            });
          }
          break;
        }

        isFirstIteration = false;
      }

      return parts;
    };
  }

  UIGetSearchFilters(searchQuery: string): CrudFilters {
    if (!searchQuery) return [];

    return [
      {
        operator: "or",
        value: [
          {
            field: "pin.name",
            operator: "contains",
            value: searchQuery,
          },
          {
            field: "pin.cid",
            operator: "contains",
            value: searchQuery,
          },
        ],
      },
    ];
  }

  UINavigateToCIDHook(): NavigateToCIDHook {
    const nav = useNavigation();

    return (cid: CID) => {
      nav.show(IPFS_SUBFOLDER_ROUTE, cid.toString());
    };
  }

  private async getCachedPinSet() {
    if (!this.#lastPinSet) {
      await this.#lastPinSetDefer.promise;
    }

    this.#lastPinSetMutex.lock();
    const pinSet = this.#lastPinSet?.slice();
    this.#lastPinSetMutex.unlock();

    return pinSet!;
  }

  UIGetHasActiveUploads(): boolean {
    const list = useList({
      resource: SERVICE_ID,
      filters: [
        {
          operator: "or",
          value: [
            {
              field: "status",
              operator: "eq",
              value: "queued",
            },
            {
              field: "status",
              operator: "eq",
              value: "pinning",
            },
          ],
        },
      ],
      queryOptions: {
        refetchInterval: 5000,
      },
    });

    if (list?.isFetching) {
      return false;
    }

    return (list?.data?.total ?? 0) > 0;
  }
}

function getPinLabel(status: PinStatus["status"]) {
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

async function getListViaRestProvider(
  params: GetListParams,
  svc: IPFS,
): Promise<GetListResponse<PinStatus>> {
  params.resource = "pins";
  try {
    const restProvider = await svc.getRestProvider();
    const response = await restProvider.getList(params);
    // Check if the response matches the expected PinsResponse structure
    if ("count" in response.data && "results" in response.data) {
      return mapPinsResponseToGetListResult(response.data as PinResults);
    } else {
      // If the response doesn't match PinsResponse, assume it's already in the correct format
      return response as GetListResponse<PinStatus>;
    }
  } catch (error) {
    throw error;
  }
}

async function getListViaPinner(
  params: GetListParams,
  svc: IPFS,
): Promise<GetListResponse<PinStatus>> {
  const { pagination = {} } = params;
  const { current = 1, pageSize = 50 } = pagination;

  const client = await svc.getRemoteClient();

  let allResults: PinStatus[] = [];
  let hasMoreResults = true;
  let oldestTimestamp: Date | undefined;
  let totalCount = 0;

  // Calculate how many items we need to skip
  const itemsToSkip = (current - 1) * pageSize;

  while (hasMoreResults /* && allResults.length < itemsToSkip + pageSize*/) {
    const pinsGetOptions: PinsGetRequest = {
      status: new Set([Status.Pinned]),
      ...(oldestTimestamp && { before: oldestTimestamp }),
      limit: totalCount ?? pageSize,
    };

    const { count, results: resultsSet }: PinResults =
      await client.pinsGet(pinsGetOptions);

    totalCount = count; // Update the total count from the API

    const results = Array.from(resultsSet).map((result) => ({
      ...result,
      info: {
        ...defaultPinMeta,
        ...result.info,
      },
    }));
    allResults = [...allResults, ...results];

    if (results.length > 0) {
      const oldestInBatch = results.reduce((oldest, current) =>
        current.created < oldest.created ? current : oldest,
      );
      oldestTimestamp = oldestInBatch.created;
    }

    hasMoreResults = totalCount > allResults.length && results.length > 0;
  }

  /*  // Apply pagination to the results
  const paginatedResults = allResults.slice(
    itemsToSkip,
    itemsToSkip + pageSize,
  );*/
  return {
    data: allResults,
    total: totalCount,
  };
}

function applyFilters(
  pinStatuses: PinStatus[],
  filters: CrudFilters,
): PinStatus[] {
  return pinStatuses.filter((pinStatus) => {
    return filters.every((filter) => applyFilter(pinStatus, filter));
  });
}

function applyFilter(pinStatus: PinStatus, filter: CrudFilter): boolean {
  if ("field" in filter) {
    return applyLogicalFilter(pinStatus, filter);
  } else if ("operator" in filter) {
    if (filter.operator === "or") {
      return filter.value.some((subFilter) =>
        applyFilter(pinStatus, subFilter),
      );
    } else if (filter.operator === "and") {
      return filter.value.every((subFilter) =>
        applyFilter(pinStatus, subFilter),
      );
    }
  }
  return true;
}

function applyLogicalFilter(
  pinStatus: PinStatus,
  filter: LogicalFilter,
): boolean {
  const value = getNestedValue(pinStatus, filter.field);

  switch (filter.operator) {
    case "eq":
      return value === filter.value;
    case "ne":
      return value !== filter.value;
    case "lt":
      return value < filter.value;
    case "gt":
      return value > filter.value;
    case "lte":
      return value <= filter.value;
    case "gte":
      return value >= filter.value;
    case "in":
      return Array.isArray(filter.value) && filter.value.includes(value);
    case "nin":
      return Array.isArray(filter.value) && !filter.value.includes(value);
    case "contains":
      return (
        typeof value === "string" &&
        value.toLowerCase().includes(String(filter.value).toLowerCase())
      );
    case "ncontains":
      return (
        typeof value === "string" &&
        !value.toLowerCase().includes(String(filter.value).toLowerCase())
      );
    // Add more operators as needed
    default:
      return true;
  }
}

function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((acc, part) => acc && acc[part], obj);
}

function nodesToPins(nodes: FileTreeNode[]): PinStatus[] {
  return nodes.map((node) => {
    const pinStatus: PinStatus = {
      ...node.pinStatus,
      info: {
        ...defaultPinMeta,
        ...node.pinStatus.info,
        folder:
          node.type === DataType.Directory || node.type === DataType.HAMTShard,
      },
      pin: {
        ...node.pinStatus.pin,
        name: node.name || node.pinStatus.pin.name || node.pinStatus.pin.cid,
      },
    };
    return pinStatus;
  });
}

function extractStatusFilters(filters: CrudFilters): Set<Status> {
  const statusSet = new Set<Status>();

  function processFilter(filter: CrudFilter) {
    if (
      "field" in filter &&
      filter.field === "status" &&
      filter.operator === "eq"
    ) {
      statusSet.add(filter.value as Status);
    } else if (
      "operator" in filter &&
      (filter.operator === "or" || filter.operator === "and")
    ) {
      filter.value.forEach(processFilter);
    }
  }

  filters.forEach(processFilter);
  return statusSet;
}
