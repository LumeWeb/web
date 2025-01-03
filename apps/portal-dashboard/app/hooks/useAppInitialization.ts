import { useCallback, useEffect, useState } from "react";
import { useCheckAuth } from "portal-shared/hooks/useCheckAuth";
import { useInitializeProviders } from "./useInitializeProviders";
import { useInitializeResources } from "./useInitializeResources";
import { DashboardActions } from "@/stores/app";
import { IPFS } from "@/services/ipfs/index";
import { getAddService, getGetServices } from "@/services/index";
import { Sdk } from "@lumeweb/portal-sdk";
import { AuthProvider, ResourceProps } from "@refinedev/core";
import { useRegisterServiceMenuItem } from "@/hooks/useRegisterServiceMenuItem.js";
import { menuConfig } from "@/menuConfig";
import {
  BaseActions,
  baseStore,
  useBaseStore,
} from "portal-shared/store/baseStore";
import { MenuItem } from "portal-shared/types";

export function useAppInitialization(sdk?: Sdk, authProvider?: AuthProvider) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [providers, setProviders] = useState({});
  const [resources, setResources] = useState<ResourceProps[]>([]);

  const checkAuth = useCheckAuth(authProvider);
  const addService = getAddService();
  const getServices = getGetServices();
  const initializeProviders = useInitializeProviders();
  const initializeResources = useInitializeResources();
  const registerServiceMenuItem = useRegisterServiceMenuItem();
  const baseStore = useBaseStore((state) => state);

  const initializeApp = useCallback(async () => {
    if (!sdk || !authProvider || isInitialized) return;

    const isAuth = await checkAuth();

    if (isAuth) {
      registerServices(addService, getServices);
      if (!getServices()?.length) {
        return;
      }

      const newProviders = await initializeProviders(isAuth);
      const newResources = initializeResources(isAuth);

      setProviders(newProviders);
      setResources(newResources);

      menuConfig.forEach((menu) => {
        registerMenuItem(menu, baseStore);
      });

      getServices().forEach(registerServiceMenuItem);
    }

    setIsInitialized(true);
  }, [
    sdk,
    authProvider,
    isInitialized,
    checkAuth,
    initializeProviders,
    initializeResources,
  ]);

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

function registerServices(
  addFunc: DashboardActions["addService"],
  getFunc: DashboardActions["getServices"],
) {
  [new IPFS()].forEach((svc) => {
    if (!getFunc().find((s) => s.id() === svc.id())) {
      addFunc(svc);
    }
  });
}

function registerMenuItem(menu: MenuItem, baseStore: BaseActions) {
  baseStore.addMenuItem(menu);
  menu.children?.forEach((item) => {
    baseStore.addMenuItem(item, menu.key);
  });
}
