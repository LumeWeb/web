import type {
  CreateParams,
  DeleteOneParams,
  DeleteOneResponse,
  GetListParams,
  GetListResponse,
  GetOneParams,
  UpdateParams,
} from "@refinedev/core";
import { dashboardStore } from "@/stores/app";

export type ServiceItem = {
  id: string;
  name: string;
};

export const createServiceProvider = (): {
  getApiUrl(): string;
  deleteOne<TData, TVariables>(
    params: DeleteOneParams<TVariables>,
  ): Promise<DeleteOneResponse<TData>>;
  getList(params: GetListParams): Promise<GetListResponse<ServiceItem>>;
  getOne<TData>(params: GetOneParams): Promise<Awaited<undefined>>;
  create<TData, TVariables>(
    params: CreateParams<TVariables>,
  ): Promise<Awaited<undefined>>;
  update<TData, TVariables>(
    params: UpdateParams<TVariables>,
  ): Promise<Awaited<undefined>>;
} => {
  return {
    create<TData, TVariables>(
      params: CreateParams<TVariables>,
    ): Promise<Awaited<undefined>> {
      return Promise.resolve(undefined);
    },

    deleteOne<TData, TVariables>(
      params: DeleteOneParams<TVariables>,
    ): Promise<Awaited<undefined>> {
      return Promise.resolve(undefined);
    },

    getApiUrl(): string {
      return "";
    },

    async getList(
      params: GetListParams,
    ): Promise<GetListResponse<ServiceItem>> {
      const services: ServiceItem[] = [];
      dashboardStore
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
    getOne<TData>(params: GetOneParams): Promise<Awaited<undefined>> {
      return Promise.resolve(undefined);
    },

    update<TData, TVariables>(
      params: UpdateParams<TVariables>,
    ): Promise<Awaited<undefined>> {
      return Promise.resolve(undefined);
    },
  };
};
