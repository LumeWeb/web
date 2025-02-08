import React, { useEffect, useState } from "react";

import { useFramework } from "../contexts/framework";
import {
  BridgeResult,
  createRemoteComponentLoader,
  defaultRemoteOptions,
} from "../plugins/remoteComponentLoader";

export interface WidgetAreaProps {
  widgetAreaId: string;
}

export function WidgetArea({ widgetAreaId }: WidgetAreaProps) {
  const framework = useFramework();
  const [widgets, setWidgets] = useState<React.ComponentType[]>([]);

  useEffect(() => {
    if (!framework) {
      return;
    }

    const registrations =
      framework.framework?.getWidgetRegistrations(widgetAreaId) ?? [];
    const loadedWidgets = registrations.map((reg) => {
      return createRemoteComponentLoader(
        {
          componentPath: reg.componentName,
          pluginId: reg.pluginId,
        },
        framework.framework!,
        defaultRemoteOptions,
      );
    });

    // Transform loaded widgets into renderable React components
    const renderableWidgets = loadedWidgets.map((widget) => {
      // Check if it's a bridge function (returns Promise)
      if (
        typeof widget === "function" &&
        "then" in widget &&
        typeof (widget as any).then === "function"
      ) {
        // Create a wrapper component for the bridge function
        const BridgeWrapper: React.FC = () => {
          const [isLoading, setIsLoading] = useState(true);

          useEffect(() => {
            // Explicitly type the widget as a bridge loader function
            const bridgeLoader = widget as () => Promise<BridgeResult<any>>;
            bridgeLoader().then(() => {
              setIsLoading(false);
            });
          }, []);

          return isLoading ? null : (
            <div className="bridge-component-wrapper" />
          );
        };
        return BridgeWrapper;
      }

      // Otherwise treat as a React component
      return widget as React.ComponentType;
    });

    // Filter to ensure only valid React components remain
    const filteredWidgets = renderableWidgets.filter(
      (widget): widget is React.ComponentType =>
        typeof widget === "function" &&
        (widget.prototype?.isReactComponent || !("then" in widget)),
    );

    setWidgets(filteredWidgets);
  }, [framework, widgetAreaId]);

  return (
    <div className="widget-area">
      {widgets.map((Widget, index) => {
        return (
          <div className="widget-container" key={index}>
            <Widget />
          </div>
        );
      })}
    </div>
  );
}
