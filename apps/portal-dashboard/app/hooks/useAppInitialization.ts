import { useCallback, useEffect, useState } from "react";
import { useCheckAuth } from "./useCheckAuth";
import { useInitializeProviders } from "./useInitializeProviders";
import { useInitializeResources } from "./useInitializeResources";
import { AppActions } from "@/stores/app.js";
import { IPFS } from "@/services/ipfs/index";
import { getAddService, getGetServices } from "@/services/index";
import { Sdk } from "@lumeweb/portal-sdk";
import { AuthProvider, ResourceProps } from "@refinedev/core";
import { useRegisterServiceMenuItem } from "@/hooks/useRegisterServiceMenuItem.js";

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
  addFunc: AppActions["addService"],
  getFunc: AppActions["getServices"],
) {
  [new IPFS()].forEach((svc) => {
    if (!getFunc().find((s) => s.id() === svc.id())) {
      addFunc(svc);
    }
  });
}
