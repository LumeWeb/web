import { useCallback, useEffect, useState } from "react";
import { useCheckAuth } from "portal-shared/hooks/useCheckAuth";
import { Sdk } from "@lumeweb/portal-sdk";
import { AuthProvider, ResourceProps } from "@refinedev/core";
import { menuConfig } from "@/menuConfig";
import { BaseActions, useBaseStore } from "portal-shared/store/baseStore";
import { MenuItem } from "portal-shared/types";

export function useAppInitialization(sdk?: Sdk, authProvider?: AuthProvider) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [providers, setProviders] = useState({});
  const [resources, setResources] = useState<ResourceProps[]>([]);

  const checkAuth = useCheckAuth(authProvider);
  const baseStore = useBaseStore((state) => state);

  const initializeApp = useCallback(async () => {
    if (!sdk || !authProvider || isInitialized) return;

    const isAuth = await checkAuth();

    if (isAuth) {
      menuConfig.forEach((menu) => {
        registerMenuItem(menu, baseStore);
      });
    }

    setIsInitialized(true);
  }, [sdk, authProvider, isInitialized, checkAuth]);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      if (sdk && isMounted && !isInitialized) {
        await initializeApp();
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, [sdk, isInitialized, initializeApp]);

  return {
    isInitialized,
    providers,
    resources,
    setIsInitialized,
  };
}

function registerMenuItem(menu: MenuItem, baseStore: BaseActions) {
  baseStore.addMenuItem(menu);
  menu.children?.forEach((item) => {
    baseStore.addMenuItem(item, menu.key);
  });
}
