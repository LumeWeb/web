import type { BaseTableProps } from "./BaseTable";

import { BaseTableContent } from "./BaseTableContent";
import { useTableInstance } from "./contexts";
import { normalizeTableOptions } from "./tableOptions";

function BaseTableInner<TData extends object>(
  props: BaseTableProps<TData>,
): React.JSX.Element {
  const {
    className,
    emptyState,
    emptyStateMessage,
    footer,
    getCellProps,
    getRowProps,
    header,
    isLoading,
    loadingState,
    loadingStateMessage,
    onRowClick,
    pagination,
  } = props;

  const { table } = useTableInstance<TData>();

  const normalizedOptions = normalizeTableOptions(
    pagination,
    emptyState,
    emptyStateMessage,
    loadingState,
    loadingStateMessage,
    table,
  );

  return (
    <BaseTableContent
      className={className}
      emptyState={normalizedOptions.emptyState}
      footer={footer}
      getCellProps={getCellProps}
      getRowProps={getRowProps}
      header={header}
      isLoading={isLoading}
      loadingState={normalizedOptions.loadingState}
      onRowClick={onRowClick}
      pagination={
        normalizedOptions.pagination.enabled
          ? normalizedOptions.pagination.component
          : undefined
      }
      table={table}
    />
  );
}

export { BaseTableInner };
