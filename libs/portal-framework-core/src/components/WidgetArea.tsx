import React, { useEffect, useState } from "react";
import pack from "bin-pack";
import { useFramework } from "../contexts/framework";
import {
  BridgeResult,
  createRemoteComponentLoader,
  defaultRemoteOptions,
} from "../plugins/remoteComponentLoader";
import { WidgetRegistrationEntity } from "../types/plugin";
import * as ReactIs from "react-is";

export const DEFAULT_WIDGET_WIDTH = 1;
export const DEFAULT_WIDGET_HEIGHT = 1;

export interface WidgetAreaProps {
  widgetAreaId: string;
}

export function WidgetArea({ widgetAreaId }: WidgetAreaProps) {
  const framework = useFramework();
  const [widgets, setWidgets] = useState<
    {
      component: React.ComponentType;
      cols?: number;
      rows?: number;
      x?: number;
      y?: number;
    }[]
  >([]);
  const [layoutSize, setLayoutSize] = useState([1, 1]);

  useEffect(() => {
    if (!framework) {
      return;
    }

    const registrations =
      framework.framework?.getWidgetRegistrations(widgetAreaId) ?? [];
    const loadedWidgets = registrations.map<WidgetRegistrationEntity>(
      (widget) => {
        return {
          ...widget,
          component: createRemoteComponentLoader(
            {
              componentPath: widget.componentName,
              pluginId: widget.pluginId,
            },
            framework.framework!,
            defaultRemoteOptions,
          ),
        };
      },
    );

    // Transform loaded widgets into renderable React components
    const renderableWidgets = loadedWidgets.map<WidgetRegistrationEntity>(
      (widget) => {
        // Check if it's a bridge function using a more reliable method
        const isPromise =
          widget.component &&
          typeof (widget.component as any).then === "function";
        if (isPromise) {
          // Create a wrapper component for the bridge function
          const BridgeWrapper: React.FC = () => {
            const [LoadedComponent, setLoadedComponent] =
              useState<React.ComponentType | null>(null);
            const [error, setError] = useState<Error | null>(null);

            useEffect(() => {
              const bridgeLoader = widget.component as () => Promise<
                BridgeResult<any>
              >;
              bridgeLoader()
                .then((result) => {
                  setLoadedComponent(() => result);
                })
                .catch(setError);
            }, []);

            if (error) return <div>Error loading widget: {error.message}</div>;
            if (!LoadedComponent) return <div>Loading...</div>;
            return <LoadedComponent />;
          };
          return {
            ...widget,
            component: BridgeWrapper,
          };
        }

        // Otherwise treat as a React component
        return widget;
      },
    );

    const filteredWidgets = renderableWidgets.filter(
      (widget): widget is WidgetRegistrationEntity => {
        const comp = widget.component;
        return typeof comp === "function" || ReactIs.isValidElementType(comp);
      },
    );

    // Sort widgets by order property (immutably)
    const sortedWidgets = [...filteredWidgets].sort(
      (a, b) => (a.order || 0) - (b.order || 0),
    );

    // Pack widgets using bin-pack library
    const packedResult = pack(
      sortedWidgets.map((widget) => ({
        width: widget.cols || DEFAULT_WIDGET_WIDTH,
        height: widget.rows || DEFAULT_WIDGET_HEIGHT,
        item: widget,
      })),
    );
    setLayoutSize([packedResult.width, packedResult.height]);

    const widgetsWithLayout = packedResult.items?.map((item) => ({
      ...item.item.item,
      x: item.x,
      y: item.y,
      cols: item.width,
      rows: item.height,
    }));

    setWidgets(widgetsWithLayout);
  }, [framework, widgetAreaId]);

  if (!widgets?.length) {
    return <div className="gap-4"></div>;
  }

  return (
    <div
      className="grid gap-4"
      style={{
        gridTemplateColumns: `repeat(${layoutSize[0]}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${layoutSize[1]}, minmax(0, 1fr))`,
      }}>
      {widgets.map((widget, index) => {
        const Widget = widget.component;
        return (
          <div
            key={index}
            style={{
              gridColumnStart: widget.x + 1,
              gridRowStart: widget.y + 1,
              gridColumnEnd: `span ${widget.cols || 1}`,
              gridRowEnd: `span ${widget.rows || 1}`,
            }}
            className="p-4 border rounded-md">
            <Widget />
          </div>
        );
      })}
    </div>
  );
}
