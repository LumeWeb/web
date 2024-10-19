import { r as reactExports, j as jsxRuntimeExports } from "./jsx-runtime-IZdvEyt_.js";
import { e as lC } from "./index-DU1IfKY5.js";
import { a as createTable, g as getCoreRowModel, b as getSortedRowModel, d as getFilteredRowModel } from "./index-Dv9Lz1jY.js";
import { c as cn, B as Button } from "./button-CzfLTIHt.js";
import { f as DoubleArrowLeftIcon, g as ChevronLeftIcon, b as ChevronRightIcon, h as DoubleArrowRightIcon } from "./index-DiXcXsr5.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-DonCKqC4.js";
import { S as Skeleton } from "./skeleton-DwNK_yGs.js";
/**
   * react-table
   *
   * Copyright (c) TanStack
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.md file in the root directory of this source tree.
   *
   * @license MIT
   */
function flexRender(Comp, props) {
  return !Comp ? null : isReactComponent(Comp) ? /* @__PURE__ */ reactExports.createElement(Comp, props) : Comp;
}
function isReactComponent(component) {
  return isClassComponent(component) || typeof component === "function" || isExoticComponent(component);
}
function isClassComponent(component) {
  return typeof component === "function" && (() => {
    const proto = Object.getPrototypeOf(component);
    return proto.prototype && proto.prototype.isReactComponent;
  })();
}
function isExoticComponent(component) {
  return typeof component === "object" && typeof component.$$typeof === "symbol" && ["react.memo", "react.forward_ref"].includes(component.$$typeof.description);
}
function useReactTable(options) {
  const resolvedOptions = {
    state: {},
    // Dummy state
    onStateChange: () => {
    },
    // noop
    renderFallbackValue: null,
    ...options
  };
  const [tableRef] = reactExports.useState(() => ({
    current: createTable(resolvedOptions)
  }));
  const [state, setState] = reactExports.useState(() => tableRef.current.initialState);
  tableRef.current.setOptions((prev) => ({
    ...prev,
    ...options,
    state: {
      ...state,
      ...options.state
    },
    // Similarly, we'll maintain both our internal state and any user-provided
    // state.
    onStateChange: (updater) => {
      setState(updater);
      options.onStateChange == null || options.onStateChange(updater);
    }
  }));
  return tableRef.current;
}
var I = Object.defineProperty;
var i = (t, o) => I(t, "name", { value: o, configurable: true });
var x = i(() => {
  let t = reactExports.useRef(true);
  return reactExports.useEffect(() => {
    t.current = false;
  }, []), t.current;
}, "useIsFirstRender");
var P = i(({ columns: t, columnFilters: o }) => (o == null ? void 0 : o.map((e) => {
  var a, d, p, u;
  let r = e.operator ?? ((d = (a = t.find((c) => c.id === e.id)) == null ? void 0 : a.meta) == null ? void 0 : d.filterOperator);
  if ((r === "and" || r === "or") && Array.isArray(e.value)) return { key: ((u = (p = t.find((T) => T.id === e.id)) == null ? void 0 : p.meta) == null ? void 0 : u.filterKey) ?? e.id, operator: r, value: e.value };
  let l = Array.isArray(e.value) ? "in" : "eq";
  return { field: e.id, operator: r ?? l, value: e.value };
})) ?? [], "columnFiltersToCrudFilters");
var k = i(({ nextFilters: t, coreFilters: o }) => o.filter((r) => !t.some((s) => {
  let l = r.operator === "and" || r.operator === "or", a = s.operator === "and" || s.operator === "or", d = r.operator === s.operator, p = l && a && r.key === s.key, u = !l && !a && r.field === s.field;
  return d && (p || u);
})).map((r) => r.operator === "and" || r.operator === "or" ? { key: r.key, operator: r.operator, value: [] } : { field: r.field, operator: r.operator, value: void 0 }), "getRemovedFilters");
var O = i(({ columns: t, crudFilters: o }) => o.map((e) => {
  var r;
  return e.operator === "and" || e.operator === "or" ? e.key ? { id: ((r = t.find((l) => {
    var a;
    return ((a = l.meta) == null ? void 0 : a.filterKey) === e.key;
  })) == null ? void 0 : r.id) ?? e.key, operator: e.operator, value: e.value } : void 0 : { id: e.field, operator: e.operator, value: e.value };
}).filter(Boolean), "crudFiltersToColumnFilters");
function N({ refineCoreProps: { hasPagination: t = true, ...o } = {}, initialState: e = {}, ...r }) {
  var D, S, E;
  let s = x(), l = lC({ ...o, hasPagination: t }), a = (((D = o.filters) == null ? void 0 : D.mode) || "server") === "server", d = (((S = o.sorters) == null ? void 0 : S.mode) || "server") === "server", p = t === false ? "off" : "server", u = (((E = o.pagination) == null ? void 0 : E.mode) ?? p) !== "off", { tableQuery: { data: c }, current: T, setCurrent: y, pageSize: B, setPageSize: L, sorters: Q, setSorters: H, filters: g, setFilters: K, pageCount: h } = l, b = useReactTable({ data: (c == null ? void 0 : c.data) ?? [], getCoreRowModel: getCoreRowModel(), getSortedRowModel: d ? void 0 : getSortedRowModel(), getFilteredRowModel: a ? void 0 : getFilteredRowModel(), initialState: { pagination: { pageIndex: T - 1, pageSize: B }, sorting: Q.map((n) => ({ id: n.field, desc: n.order === "desc" })), columnFilters: O({ columns: r.columns, crudFilters: g }), ...e }, pageCount: h, manualPagination: true, manualSorting: d, manualFiltering: a, ...r }), { state: w, columns: R } = b.options, { pagination: z, sorting: m, columnFilters: v } = w, { pageIndex: f, pageSize: C } = z ?? {};
  return reactExports.useEffect(() => {
    f !== void 0 && y(f + 1);
  }, [f]), reactExports.useEffect(() => {
    C !== void 0 && L(C);
  }, [C]), reactExports.useEffect(() => {
    m !== void 0 && (H(m == null ? void 0 : m.map((n) => ({ field: n.id, order: n.desc ? "desc" : "asc" }))), m.length > 0 && u && !s && y(1));
  }, [m]), reactExports.useEffect(() => {
    let n = P({ columns: R, columnFilters: v });
    n.push(...k({ nextFilters: n, coreFilters: g })), K(n), n.length > 0 && u && !s && y(1);
  }, [v, R]), { ...b, refineCore: l };
}
i(N, "useTable");
const Table = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative w-full overflow-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
  "table",
  {
    ref,
    className: cn(
      "w-full caption-bottom text-sm rounded-lg border-x-0",
      className
    ),
    ...props
  }
) }));
Table.displayName = "Table";
const TableHeader = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { ref, className: cn("border-b-2", className), ...props }));
TableHeader.displayName = "TableHeader";
const TableBody = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "tbody",
  {
    ref,
    className: cn(
      "[&_tr:last-child]:border-0  rounded-lg border-x-0",
      className
    ),
    ...props
  }
));
TableBody.displayName = "TableBody";
const TableFooter = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "tfoot",
  {
    ref,
    className: cn(
      "h-14 border border-t-2 border-x-0 bg-secondary-2 font-medium",
      className
    ),
    ...props
  }
));
TableFooter.displayName = "TableFooter";
const TableRow = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "tr",
  {
    ref,
    className: cn(
      "border-y-1 border-x-0 transition-colors text-foreground data-[state=selected]:text-ring ",
      className
    ),
    ...props
  }
));
TableRow.displayName = "TableRow";
const TableHead = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "th",
  {
    ref,
    className: cn(
      "h-14 px-6 border-x-1 first:border-l-0 last:border-r-0 text-left align-middle font-bold text-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    ),
    ...props
  }
));
TableHead.displayName = "TableHead";
const TableCell = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "td",
  {
    ref,
    className: cn(
      "h-14 px-6 align-middle border-x-1 text-foreground first:border-l-0 last:border-r-0 [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    ),
    ...props
  }
));
TableCell.displayName = "TableCell";
const TableCaption = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "caption",
  {
    ref,
    className: cn("mt-4 text-sm text-foreground", className),
    ...props
  }
));
TableCaption.displayName = "TableCaption";
function DataTablePagination({ table }) {
  var _a, _b;
  const rowCount = ((_b = (_a = table.refineCore.tableQueryResult) == null ? void 0 : _a.data) == null ? void 0 : _b.total) || 0;
  const pageCount = table.getPageCount();
  const { pageIndex, pageSize } = table.getState().pagination;
  const displayIndexStart = rowCount === 0 ? 0 : pageIndex * pageSize + 1;
  const displayIndexEnd = Math.min((pageIndex + 1) * pageSize, rowCount);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-2 border border-t-2 border-x-0 h-14", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground", children: "Rows per page" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Select,
        {
          value: `${pageSize}`,
          onValueChange: (value) => {
            table.setPageSize(Number(value));
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-[70px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: pageSize }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { side: "top", children: [10, 20, 30, 40, 50].map((size) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: `${size}`, children: size }, size)) })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-6 lg:space-x-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center text-sm text-foreground", children: rowCount > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        "Showing",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium mx-1", children: displayIndexStart }),
        "to",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium mx-1", children: displayIndexEnd }),
        "of",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium mx-1", children: rowCount })
      ] }) : "No results" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            className: "hidden h-8 w-8 p-0 lg:flex",
            onClick: () => table.setPageIndex(0),
            disabled: !table.getCanPreviousPage(),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: "Go to first page" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(DoubleArrowLeftIcon, { className: "h-4 w-4" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            className: "h-8 w-8 p-0",
            onClick: () => table.previousPage(),
            disabled: !table.getCanPreviousPage(),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: "Go to previous page" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeftIcon, { className: "h-4 w-4" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            className: "h-8 w-8 p-0",
            onClick: () => table.nextPage(),
            disabled: !table.getCanNextPage() || pageIndex === pageCount - 1,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: "Go to next page" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRightIcon, { className: "h-4 w-4" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            className: "hidden h-8 w-8 p-0 lg:flex",
            onClick: () => table.setPageIndex(pageCount - 1),
            disabled: !table.getCanNextPage() || pageIndex === pageCount - 1,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: "Go to last page" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(DoubleArrowRightIcon, { className: "h-4 w-4" })
            ]
          }
        )
      ] })
    ] })
  ] });
}
function SkeletonLoader({
  layout = "default",
  rows = 3,
  cols = 3,
  showHeader = true,
  className,
  table
}) {
  const renderTableSkeleton = () => {
    if (!table) {
      console.warn("Table object is required for table layout");
      return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {});
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { className: cn("w-full border-collapse", className), children: [
      showHeader && /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: table.getHeaderGroups().map((headerGroup) => /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { className: "border-none", children: headerGroup.headers.map((header) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        TableHead,
        {
          style: { width: header.getSize() },
          className: "border-none",
          children: header.isPlaceholder ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-full" }) : flexRender(
            header.column.columnDef.header,
            header.getContext()
          )
        },
        header.id
      )) }, headerGroup.id)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: Array.from({ length: rows }).map((_, rowIndex) => /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { className: "border-none", children: table.getAllColumns().map((column) => /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "border-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-full" }) }, column.id)) }, rowIndex)) })
    ] });
  };
  const renderCardSkeleton = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("space-y-2", className), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-40 w-full" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-3/4" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-1/2" })
  ] });
  const renderListSkeleton = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("flex items-center space-x-4", className), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-12 w-12 rounded-full" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-[200px]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-[150px]" })
    ] })
  ] });
  const renderProfileSkeleton = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("space-y-4", className), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-20 w-20 rounded-full" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-[150px]" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-[200px]" })
  ] });
  const renderCustomSkeleton = () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn(`grid grid-cols-${cols} gap-4`, className), children: Array.from({ length: cols * rows }).map((_, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-full" }, index)) });
  const renderDefaultSkeleton = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("space-y-2", className), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-full" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-5/6" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-4/6" })
  ] });
  switch (layout) {
    case "table":
      return renderTableSkeleton();
    case "card":
      return renderCardSkeleton();
    case "list":
      return renderListSkeleton();
    case "profile":
      return renderProfileSkeleton();
    case "custom":
      return renderCustomSkeleton();
    default:
      return renderDefaultSkeleton();
  }
}
function DataTable({
  columns,
  resource,
  dataProviderName,
  className,
  autoRefresh,
  autoRefreshInterval,
  filters,
  permanentFilters,
  meta,
  pagination
}) {
  const table = N({
    columns,
    refineCoreProps: {
      resource,
      filters: {
        permanent: permanentFilters
      },
      meta,
      dataProviderName,
      // @ts-ignore
      queryOptions: {
        refetchInterval: autoRefresh ? autoRefreshInterval : void 0,
        refetchIntervalInBackground: true,
        keepPreviousData: true
      },
      pagination
    }
  });
  reactExports.useEffect(() => {
    table.refineCore.setFilters(filters || []);
  }, [filters]);
  const initialLoading = table.refineCore.tableQueryResult.isInitialLoading;
  const rows = initialLoading ? [] : table.getRowModel().rows;
  if (initialLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      SkeletonLoader,
      {
        layout: "table",
        table,
        showHeader: true,
        className
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { className, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: table.getHeaderGroups().map((headerGroup) => /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: headerGroup.headers.map((header, index) => {
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          TableHead,
          {
            style: { width: header.getSize() },
            children: header.isPlaceholder ? null : flexRender(
              header.column.columnDef.header,
              header.getContext()
            )
          },
          `DataTableHeader_${index}`
        );
      }) }, headerGroup.id)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: rows.length ? rows.map((row, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        TableRow,
        {
          "data-state": row.getIsSelected() && "selected",
          className: cn("group"),
          children: row.getVisibleCells().map((cell, index2) => {
            var _a, _b, _c, _d;
            return /* @__PURE__ */ jsxRuntimeExports.jsx(
              TableCell,
              {
                style: { width: (_b = (_a = cell == null ? void 0 : cell.column) == null ? void 0 : _a.getSize) == null ? void 0 : _b.call(_a) },
                className: cn((_d = (_c = cell.column.columnDef) == null ? void 0 : _c.meta) == null ? void 0 : _d.className),
                children: flexRender(
                  cell.column.columnDef.cell,
                  cell.getContext()
                )
              },
              `DataTableCell_${index2}`
            );
          })
        },
        `DataTableRow_${index}`
      )) : /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        TableCell,
        {
          colSpan: columns.length,
          className: "h-24 text-center text-foreground",
          children: "No results."
        }
      ) }) })
    ] }),
    !(table == null ? void 0 : table.refineCore.tableQueryResult.isLoading) && /* @__PURE__ */ jsxRuntimeExports.jsx(DataTablePagination, { table })
  ] });
}
export {
  DataTable as D
};
