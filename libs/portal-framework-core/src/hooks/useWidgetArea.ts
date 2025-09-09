import { useFramework } from "../contexts/framework";
import { sortWidgets } from "../util/widget";

export interface UseWidgetAreaResult<TArea = unknown, TWidget = unknown> {
  area: TArea;
  isVisible: boolean;
  widgets: TWidget[];
}

export function useWidgetArea<TArea = unknown, TWidget = unknown>(
  id: string,
): UseWidgetAreaResult<TArea, TWidget> {
  const { framework } = useFramework();
  const area = framework.getWidgetArea(id);
  const widgets = framework.getWidgetsForArea(id);

  // Filter widgets based on visibility hook results
  const filteredWidgets = widgets.filter(widget => {
    if (widget.visibilityHook) {
      return widget.visibilityHook();
    }
    return true;
  });

  const sortedWidgets = sortWidgets(filteredWidgets);
  const isVisible = filteredWidgets.length > 0;

  return {
    area,
    isVisible,
    widgets: sortedWidgets,
  };
}
