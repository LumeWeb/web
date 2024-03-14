import type { BaseRecord, CreateManyParams, CreateManyResponse, CreateParams, CreateResponse, CustomParams, CustomResponse, DataProvider, DeleteManyParams, DeleteManyResponse, DeleteOneParams, DeleteOneResponse, GetListParams, GetListResponse, GetManyParams, GetManyResponse, GetOneParams, GetOneResponse, UpdateManyParams, UpdateManyResponse, UpdateParams, UpdateResponse } from "@refinedev/core";

export class PortalFilesProvider implements DataProvider {
    getList: <TData extends BaseRecord = BaseRecord>(params: GetListParams) => Promise<GetListResponse<TData>>;
    getMany?: (<TData extends BaseRecord = BaseRecord>(params: GetManyParams) => Promise<GetManyResponse<TData>>) | undefined;
    getOne: <TData extends BaseRecord = BaseRecord>(params: GetOneParams) => Promise<GetOneResponse<TData>>;
    create: <TData extends BaseRecord = BaseRecord, TVariables = {}>(params: CreateParams<TVariables>) => Promise<CreateResponse<TData>>;
    createMany?: (<TData extends BaseRecord = BaseRecord, TVariables = {}>(params: CreateManyParams<TVariables>) => Promise<CreateManyResponse<TData>>) | undefined;
    update: <TData extends BaseRecord = BaseRecord, TVariables = {}>(params: UpdateParams<TVariables>) => Promise<UpdateResponse<TData>>;
    updateMany?: (<TData extends BaseRecord = BaseRecord, TVariables = {}>(params: UpdateManyParams<TVariables>) => Promise<UpdateManyResponse<TData>>) | undefined;
    deleteOne: <TData extends BaseRecord = BaseRecord, TVariables = {}>(params: DeleteOneParams<TVariables>) => Promise<DeleteOneResponse<TData>>;
    deleteMany?: (<TData extends BaseRecord = BaseRecord, TVariables = {}>(params: DeleteManyParams<TVariables>) => Promise<DeleteManyResponse<TData>>) | undefined;
    getApiUrl: () => string;
    custom?: (<TData extends BaseRecord = BaseRecord, TQuery = unknown, TPayload = unknown>(params: CustomParams<TQuery, TPayload>) => Promise<CustomResponse<...>>) | undefined;
}