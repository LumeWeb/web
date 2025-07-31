import React, { useEffect, useState } from "react";
import { Bin, Box, Packer } from "binpackingjs";
import { useFramework } from "../contexts/framework";
import {
  BridgeResult,
  createRemoteComponentLoader,
  defaultRemoteOptions,
} from "../plugins/remoteComponentLoader";
import { WidgetRegistrationEntity } from "../types/plugin";

export const DEFAULT_WIDGET_WIDTH = 1;
export const DEFAULT_WIDGET_HEIGHT = 1;

export const DEFAULT_ASPECT_RATIO = 1.618; // Golden Ratio

export const DEFAULT_PADDING_FACTOR = 1.2; // 20% padding by default

export interface WidgetAreaProps {
  widgetAreaId: string;
  aspectRatio?: number;
  paddingFactor?: number;
}

export function WidgetArea({
  widgetAreaId,
  aspectRatio = DEFAULT_ASPECT_RATIO,
  paddingFactor = DEFAULT_PADDING_FACTOR,
}: WidgetAreaProps) {
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
        return (
          typeof comp === "function" &&
          // Valid React component (class or function)
          (React.isValidElement(React.createElement(comp, {})) ||
            comp.prototype?.isReactComponent ||
            // Functional component check
            (comp.length <= 1 && typeof comp === "function"))
        );
      },
    );

    // Sort widgets by order property (immutably)
    const sortedWidgets = [...filteredWidgets].sort(
      (a, b) => (a.order || 0) - (b.order || 0),
    );

    // Collect widget sizes
    const widgetSizes = sortedWidgets.map((widget) => ({
      width: widget.cols || DEFAULT_WIDGET_WIDTH,
      height: widget.rows || DEFAULT_WIDGET_HEIGHT,
      widget,
    }));

    // Calculate total area of widgets
    const totalArea = widgetSizes.reduce(
      (sum, size) => sum + size.width * size.height,
      0,
    );

    // Define aspect ratio (width / height)

    // Calculate bin dimensions with padding for better packing efficiency
    const paddingFactor = paddingFactor;
    let binWidth = Math.ceil(
      Math.sqrt(totalArea * aspectRatio * paddingFactor),
    );
    let binHeight = Math.ceil(
      Math.sqrt((totalArea / aspectRatio) * paddingFactor),
    );

    // Ensure minimum dimensions to accommodate largest widget
    const maxWidgetWidth = Math.max(...widgetSizes.map((s) => s.width));
    const maxWidgetHeight = Math.max(...widgetSizes.map((s) => s.height));
    binWidth = Math.max(binWidth, maxWidgetWidth);
    binHeight = Math.max(binHeight, maxWidgetHeight);

    // Define a bin
    const bin = new Bin(binWidth, binHeight);
    const bins = [bin];

    // Create boxes for each widget
    const boxes = widgetSizes.map(
      (size) => new Box(size.width, size.height, size.widget),
    );

    // Pack the boxes
    const packer = new Packer(bins);
    const packedBoxes = packer.pack(boxes);

    // Check if all boxes were packed successfully
    const unpackedBoxes = boxes.filter(
      (box) => box.x === undefined || box.y === undefined,
    );
    if (unpackedBoxes.length > 0) {
      console.warn(
        `Failed to pack ${unpackedBoxes.length} widgets. Consider increasing bin size.`,
      );
      // Fallback: arrange unpacked widgets in a simple grid
      let fallbackX = 0,
        fallbackY = binHeight;
      unpackedBoxes.forEach((box) => {
        box.x = fallbackX;
        box.y = fallbackY;
        fallbackX += box.width;
        if (fallbackX >= binWidth) {
          fallbackX = 0;
          fallbackY += box.height;
        }
      });
      // Update bin height if needed
      setLayoutSize([
        binWidth,
        Math.max(
          binHeight,
          fallbackY + Math.max(...unpackedBoxes.map((b) => b.height)),
        ),
      ]);
    } else {
      // Set layout size to the bin dimensions when all widgets are packed successfully
      setLayoutSize([binWidth, binHeight]);
    }

    // Update widgets state with layout information
    const widgetsWithLayout = boxes.map((box) => {
      return {
        ...box.data.widget,
        x: box.x ?? 0, // Fallback to 0 if undefined
        y: box.y ?? 0, // Fallback to 0 if undefined
        cols: box.width,
        rows: box.height,
      };
    });

    setWidgets(widgetsWithLayout);
  }, [framework, widgetAreaId, aspectRatio]);

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
