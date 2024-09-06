import { useCallback } from "use-memo-one";
import { ResourceProps } from "@refinedev/core";
import { getGetServices } from "@/services/index";

export function useInitializeResources() {
  const getServices = getGetServices();
  return useCallback(
    (isAuth: boolean) => {
      return getServices()
        .filter(() => isAuth)
        .flatMap((svc) =>
          svc.resources().map((resource: ResourceProps) => ({
            ...resource,
            meta: {
              ...resource.meta,
              dataProviderName: svc.id(),
            },
          })),
        );
    },
    [getServices],
  );
}
