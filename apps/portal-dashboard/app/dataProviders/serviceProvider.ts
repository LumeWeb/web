import type {
  CreateParams,
  CreateResponse,
  DataProvider,
  DeleteOneParams,
  DeleteOneResponse,
  GetListParams,
  GetListResponse,
  GetOneParams,
  GetOneResponse,
  UpdateParams,
  UpdateResponse,
} from "@refinedev/core";
import { appStore } from "~/stores/app.js";

export type ServiceItem = {
  id: string;
  name: string;
};

export const createServiceProvider = (): DataProvider => {
  return {
    create<TData, TVariables>(
      params: CreateParams<TVariables>,
    ): Promise<CreateResponse<TData>> {
      return Promise.resolve(undefined);
    },

    deleteOne<TData, TVariables>(
      params: DeleteOneParams<TVariables>,
    ): Promise<DeleteOneResponse<TData>> {
      return Promise.resolve(undefined);
    },

    getApiUrl(): string {
      return "";
    },

    async getList(
      params: GetListParams,
    ): Promise<GetListResponse<ServiceItem>> {
      const services: ServiceItem[] = [];
      appStore
        .getState()
        .getServices()
        .forEach((service) => {
          services.push({
            id: service.id(),
            name: service.name(),
          });
        });

      return {
        data: services,
        total: services.length,
      } satisfies GetListResponse<ServiceItem>;
    },
    getOne<TData>(params: GetOneParams): Promise<GetOneResponse<TData>> {
      return Promise.resolve(undefined);
    },

    update<TData, TVariables>(
      params: UpdateParams<TVariables>,
    ): Promise<UpdateResponse<TData>> {
      return Promise.resolve(undefined);
    },
  };
};

class t implements DataProvider {}
