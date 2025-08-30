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

export enum SubscriptionPlanPeriod {
  MONTH = "MONTH",
  YEAR = "YEAR",
}

export enum SubscriptionPlanStatus {
  ACTIVE = "ACTIVE",
  PENDING = "PENDING",
}

export interface OTPGenerateResponse {
  otp: string;
}

export interface SubscriptionBillingInfo {
  address: string;
  city: string;
  country: string;
  name: string;
  organization: string;
  state: string;
  zip: string;
}

export interface SubscriptionPlan {
  download: number;
  identifier: string;
  is_free?: boolean;
  name: string;
  period: SubscriptionPlanPeriod;
  price: number;
  status: SubscriptionPlanStatus;
  storage: number;
  upload: number;
}

export interface SubscriptionPlansResponse {
  plans: SubscriptionPlan[];
}

export interface SubscriptionResponse {
  billing_info: SubscriptionBillingInfo;
  payment_info: {
    client_secret: string;
    payment_expires: string;
    payment_id: string;
    publishable_key: string;
  };
  plan: SubscriptionPlan;
}

type AccountData = AccountParams;

interface AccountParams {
  email?: string;
  password?: string;
}

export const createAccountProvider = (
  sdk: Sdk,
  restProvider: DataProvider,
): DataProvider => {
  return {
    ...restProvider,
    custom: async <TData extends Record<string, any> = Record<string, any>>(
      params: CustomParams,
    ): Promise<CustomResponse<TData>> => {
      const { headers, method, payload, url } = params;

      if (
        url.includes("/subscription") ||
        url.includes("/otp") ||
        url.includes("/usage") ||
        url.includes("/key")
      ) {
        // Handle subscription operations using restProvider
        return restProvider.custom({
          headers: {
            Authorization: `Bearer ${sdk.account().jwtToken}`,
            ...headers,
          },
          method,
          payload,
          url,
        });
      }

      // Handle other custom operations or throw an error for unsupported operations
      throw new Error("Unsupported custom operation");
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
  };
};
