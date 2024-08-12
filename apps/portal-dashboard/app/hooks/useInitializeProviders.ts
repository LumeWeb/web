import { useCallback } from "use-memo-one";
import BaseService from "~/services/base";
import { DataProviders } from "@refinedev/core";
import { getGetServices } from "~/services/index.js";

export function useInitializeProviders() {
  const getServices = getGetServices();
  return useCallback(
    async (isAuth: boolean) => {
      const newProviders: DataProviders = { default: undefined as any };
      for (const svc of getServices()) {
        newProviders[svc.id()] = await svc.dataProvider();
      }
      return newProviders;
    },
    [getServices],
  );
}
