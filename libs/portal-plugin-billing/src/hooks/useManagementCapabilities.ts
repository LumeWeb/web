import { useCustom } from "@refinedev/core";
import type {
  HttpError,
  UseCustomProps,
} from "@refinedev/core";
import type {
  ManagementCapabilitiesResponse,
  ManagementCapabilitiesResponseOperations,
  ManagementCapabilitiesResponseAdminOperations,
} from "../types/subscription";
import { DATA_PROVIDER_NAME } from "@lumeweb/portal-framework-auth";


interface UseManagementCapabilitiesConfig {
  queryOptions?: UseCustomProps<
    ManagementCapabilitiesResponse,
    HttpError,
    unknown,
    unknown,
    ManagementCapabilitiesResponse
  >["queryOptions"];
}

interface UseManagementCapabilitiesResult {
  data: ManagementCapabilitiesResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  canCancel: boolean;
  canChangePlan: boolean;
  canPause: boolean;
  canResume: boolean;
  canAccessCustomerPortal: boolean;
  operations: ManagementCapabilitiesResponseOperations | undefined;
  adminOperations: ManagementCapabilitiesResponseAdminOperations | undefined;
}

function hasOperation(
  ops: ManagementCapabilitiesResponseOperations | undefined,
  operation: string,
): boolean {
  if (!ops) return false;
  return operation in ops && ops[operation as keyof ManagementCapabilitiesResponseOperations] === true;
}

export interface UseManagementCapabilitiesSubscription {
  isSubscribed?: boolean;
}

export function useManagementCapabilities(
  config: UseManagementCapabilitiesConfig = {},
  subscription?: UseManagementCapabilitiesSubscription,
): UseManagementCapabilitiesResult {
  const { queryOptions } = config;

  const result = useCustom<ManagementCapabilitiesResponse>({
    url: "/account/billing/management/capabilities",
    method: "get",
    dataProviderName: DATA_PROVIDER_NAME,
    queryOptions: {
      ...queryOptions,
      enabled: subscription?.isSubscribed === true && queryOptions?.enabled !== false,
    },
  });

  const responseData = result.result.data;
  const ops = responseData?.operations;
  const computed = {
    canCancel: hasOperation(ops, "cancel"),
    canChangePlan: hasOperation(ops, "change_plan"),
    canPause: hasOperation(ops, "pause"),
    canResume: hasOperation(ops, "resume"),
    canAccessCustomerPortal: hasOperation(ops, "customer_portal"),
  };

  return {
    data: responseData,
    isLoading: result.query.isLoading,
    isError: result.query.isError,
    ...computed,
    operations: responseData?.operations,
    adminOperations: responseData?.admin_operations,
  };
}
