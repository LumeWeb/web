import React from "react";

import { useFramework } from "../contexts/framework";
import { getGridStyles, getWidgetStyles } from "../utils/grid";
import { sortWidgets } from "../utils/widget";
import { WidgetDefinition } from "../types/widget";

export interface WidgetAreaProps {
  id: string;
}

export function WidgetArea({ id }: WidgetAreaProps) {
  const { framework } = useFramework();
  const area = framework.getWidgetArea(id);
  const widgets = framework.getWidgetsForArea(id);
  const sortedWidgets = React.useMemo(() => sortWidgets(widgets), [widgets]);

  return (
    <div className="grid" style={getGridStyles(area)}>
      {sortedWidgets.length === 0 ? null : (
        sortedWidgets.map((widget) => {
          const Widget = widget.component;
          return (
            <div
              className="p-4 border rounded-md bg-background"
              key={widget.id}
              style={getWidgetStyles(widget)}
            >
              <Widget />
            </div>
          );
        })
      )}
    </div>
  );
}
