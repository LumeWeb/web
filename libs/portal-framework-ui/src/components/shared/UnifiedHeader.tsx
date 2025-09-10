import type { BaseRecord } from "@refinedev/core";

import React, { useMemo } from "react";

import {
  DialogConfig,
  isFormDialog,
  isWizardDialogConfig,
} from "../dialog/Dialog.types";
import { isStepFormConfig } from "../form/types";
import {
  HeaderContextProvider,
  useHeaderContext,
} from "./context/HeaderContext";
import { headerRegistry } from "./registry/HeaderRegistry";
import { BaseHeaderProps } from "./types/header";
import { useEnvironmentSync } from "./hooks/useEnvironmentSync";

interface UnifiedHeaderProps<T extends BaseRecord = any> {
  className?: string;
  config: any | DialogConfig<T>;
  environment: any;
}

export function UnifiedHeader<T extends BaseRecord = any>({
  className,
  config,
  environment,
}: UnifiedHeaderProps<T>) {
  // Implement environment sync mechanism
  useEnvironmentSync(environment, config.environmentSync);
  
  return (
    <HeaderContextProvider value={environment}>
      <UnifiedHeaderInner className={className} config={config} />
    </HeaderContextProvider>
  );
}

function UnifiedHeaderInner<T extends BaseRecord = any>({
  className,
  config,
}: Omit<UnifiedHeaderProps<T>, "environment">) {
  const environment = useHeaderContext<T>();
  
  const headerType = headerRegistry.resolveType(config, environment);
  const HeaderComponent = headerRegistry.get(headerType);

  // Extract title and description from config or environment
  const title = useMemo(() => {
    // For form dialogs, prioritize formConfig title
    if (isFormDialog(config) || isWizardDialogConfig(config)) {
      const formTitle = isStepFormConfig(config.formConfig)
        ? config.formConfig.title
        : config.title;
      return formTitle || environment.content.title;
    }
    return config.title || environment.content.title;
  }, [config, environment]);

  const description = useMemo(() => {
    // For form dialogs, prioritize formConfig description
    if (isFormDialog(config) || isWizardDialogConfig(config)) {
      const formDescription = isStepFormConfig(config.formConfig)
        ? config.formConfig.description
        : config.description;
      return formDescription || environment.content.description;
    }
    return config.description || environment.content.description;
  }, [config, environment]);

  // Extract actions from config or environment
  const actions = useMemo(() => {
    return config.actions || environment.content.actions;
  }, [config, environment]);

  const props: BaseHeaderProps<T> = {
    actionButtons: actions,
    className,
    description,
    environment,
    title,
  };

  return <HeaderComponent {...props} />;
}
