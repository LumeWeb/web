// @ts-nocheck

import type {
  CustomParams,
  CustomResponse,
  DataProvider,
  DeleteOneParams,
  HttpError,
  UpdateParams,
  UpdateResponse,
} from "@refinedev/core";
import { Sdk } from "@lumeweb/portal-sdk";

type AccountParams = {
  email?: string;
  password?: string;
};

type AccountData = AccountParams;

export enum SubscriptionPlanPeriod {
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
}

export enum SubscriptionPlanStatus {
  ACTIVE = "ACTIVE",
  PENDING = "PENDING",
  INACTIVE = "INACTIVE",
  CANCELLED = "CANCELLED",
  PENDING_PAYMENT = "PENDING_PAYMENT",
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface Billing {
  name: string;
  organization?: string;
  address: Address;
}

export interface Resources {
  storage: number; // In bytes
  upload: number; // In bytes
  download: number; // In bytes
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  period: SubscriptionPlanPeriod;
  price: number;
  is_free: boolean;
  resources: Resources;
}

export type SubscriptionResponse = Subscription;

export interface Subscription {
  id: string;
  plan: SubscriptionPlan;
  status: SubscriptionPlanStatus;
  billing?: Billing;
  payment?: {
    client_secret?: string;
    publishable_key?: string;
    expires_at?: string;
  };
}

export interface OPTGenerateResponse {
  otp: string;
}

export const createAccountProvider = (
  sdk: Sdk,
  restProvider: DataProvider,
): DataProvider => {
  return {
    ...restProvider,
    async update<TVariables extends AccountParams = AccountParams>(
      params: UpdateParams<TVariables>,
    ): Promise<UpdateResponse<AccountData>> {
      if (params.resource === "account") {
        if (params.variables.email && params.variables.password) {
          const ret = await sdk
            ?.account()
            .updateEmail(params.variables.email, params.variables.password);

          if (ret instanceof Error) {
            return Promise.reject(ret as HttpError);
          }

          return {
            data: {
              email: params.variables.email,
            },
          };
        }

        return {
          data: {} as AccountData,
        };
      }

      return restProvider.update(params);
    },

    async deleteOne(
      params: DeleteOneParams<TVariables>,
    ): Promise<DeleteOneResponse<any>> {
      if (params.resource === "account") {
        const ret = await sdk?.account().requestAccountDeletion();

        if (ret instanceof Error) {
          return Promise.reject(ret as HttpError);
        }

        return {
          data: {},
        };
      }

      return restProvider.deleteOne(params);
    },
    getApiUrl: () => sdk.account().apiUrl,

    custom: async <TData extends Record<string, any> = Record<string, any>>(
      params: CustomParams,
    ): Promise<CustomResponse<TData>> => {
      const { url, method, payload, headers } = params;

      if (
        url.includes("/subscription") ||
        url.includes("/otp") ||
        url.includes("/usage") ||
        url.includes("/key")
      ) {
        // Handle subscription operations using restProvider
        return restProvider.custom({
          url,
          method,
          payload,
          headers: {
            Authorization: `Bearer ${sdk.account().jwtToken}`,
            ...headers,
          },
        });
      }

      // Handle other custom operations or throw an error for unsupported operations
      throw new Error("Unsupported custom operation");
    },
  };
};
