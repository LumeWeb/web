import { jsxRuntimeExports, core_dashboard__loadShare__react__loadShare__, core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__ } from './core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__-D-EDec9Y.js';
import { core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__ } from './core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__-BRPNVk8X.js';
import { core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__ } from './core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__-CQeXjHLK.js';
import { core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__ } from './core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__-ImaNZ9yu.js';
import { createColumnHelper } from './index-BGqH-Bku.js';
import { format } from './format-CT9KiSuR.js';

function useOperationFilters() {
  const { data, isLoading, error } = core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useList({
    resource: "operations.filters"
  });
  const filterData = data?.data?.data;
  return {
    data: filterData,
    isLoading,
    error: error ? new Error(error.message) : void 0
  };
}

const columnHelper = createColumnHelper();
const OperationsFilterContext = core_dashboard__loadShare__react__loadShare__.createContext(null);
const useOperationsFilterContext = () => {
  const context = core_dashboard__loadShare__react__loadShare__.useContext(OperationsFilterContext);
  if (!context) {
    throw new Error(
      "useOperationsFilterContext must be used within OperationsFilterProvider"
    );
  }
  return context;
};
const OperationsContent = () => {
  const { filterData, isFiltersLoading, protocolCapabilitiesMap } = useOperationsFilterContext();
  const columns = [
    columnHelper.accessor("operation", {
      cell: (info) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-white", children: info.row.original.operation_display_name || info.getValue() }),
      header: "Operation"
    }),
    columnHelper.accessor("protocol", {
      cell: (info) => {
        const protocolId = info.getValue();
        const protocolDisplayName = info.row.original.protocol_display_name;
        const protocolCapability = protocolCapabilitiesMap.get(protocolId);
        if (!protocolCapability) {
          return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: protocolDisplayName || protocolId || "-" });
        }
        const IconComponent = protocolCapability.getIcon();
        const name = protocolCapability.getName();
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          IconComponent && /* @__PURE__ */ jsxRuntimeExports.jsx(IconComponent, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: protocolDisplayName || name })
        ] });
      },
      header: "Service"
    }),
    columnHelper.accessor("cid", {
      cell: (info) => {
        const cidValue = info.getValue();
        const cid = typeof cidValue === "string" ? cidValue : cidValue && typeof cidValue === "object" && cidValue["/"] ? cidValue["/"] : void 0;
        if (!cid) {
          return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500", children: "-" });
        }
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.Copyable,
          {
            text: cid,
            displayText: cid,
            maxLength: 32,
            className: "font-mono text-sm text-gray-400"
          }
        );
      },
      header: "CID"
    }),
    columnHelper.accessor("status", {
      cell: (info) => {
        const status = info.getValue();
        const statusDisplayName = info.row.original.status_display_name;
        const progress = info.row.original.progress_percent;
        const getStatusColor = (status2) => {
          switch (status2.toLowerCase()) {
            case "completed":
              return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
            case "processing":
              return "bg-blue-500/20 text-blue-400 border-blue-500/30";
            case "failed":
              return "bg-red-500/20 text-red-400 border-red-500/30";
            case "pending":
              return "bg-amber-500/20 text-amber-400 border-amber-500/30";
            default:
              return "bg-gray-500/20 text-gray-400 border-gray-500/30";
          }
        };
        const statusColor = getStatusColor(status);
        if (status?.toLowerCase() === "processing" && progress !== void 0) {
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Badge, { className: `${statusColor} border-0 text-white`, children: statusDisplayName || status }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-gray-400", children: [
              progress,
              "%"
            ] })
          ] });
        }
        if (status?.toLowerCase() === "failed") {
          const error = info.row.original.error;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Badge, { className: `${statusColor} border-0 text-white`, children: statusDisplayName || status }),
            error && /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: "max-w-xs truncate text-sm text-red-400",
                title: error,
                children: error
              }
            )
          ] });
        }
        return /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Badge, { className: `${statusColor} border-0 text-white`, children: statusDisplayName || status });
      },
      header: "Status"
    }),
    columnHelper.accessor("started_at", {
      cell: (info) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: format(new Date(info.getValue()), "MMM d, yyyy, hh:mm a") }),
      header: "Started"
    }),
    columnHelper.accessor("status_message", {
      cell: (info) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-400", children: info.getValue() || "-" }),
      header: "Status Message"
    })
  ];
  const statusOptions = (filterData?.statuses || []).map((option) => ({
    label: option.name,
    value: option.value,
    description: option.description
  }));
  const operationOptions = (filterData?.operations || []).map(
    (option) => ({
      label: option.name,
      value: option.value,
      description: option.description
    })
  );
  const protocolOptions = (filterData?.protocols || []).map((option) => {
    const protocolCapability = protocolCapabilitiesMap.get(option.value);
    const description = protocolCapability?.getDescription() || option.description || "";
    return {
      label: option.name,
      value: option.value,
      description
    };
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.Authenticated, { v3LegacyAuthProviderCompatible: false, children: /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.GeneralLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.PageHeader,
      {
        description: "Monitor uploads and pins across all services",
        title: "Operations"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.DataTable,
      {
        columns,
        emptyStateMessage: "No operations found.",
        pagination: true,
        refetchInterval: 5e3,
        resource: "operations",
        responsive: true,
        toolbar: {
          items: isFiltersLoading ? [] : [
            {
              type: core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.ToolbarItemType.FILTER_GROUP,
              id: "operations-filters",
              label: "Filters",
              dropdownStyle: true,
              items: [
                {
                  type: core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.ToolbarItemType.FILTER,
                  id: "status",
                  field: "status",
                  label: "Statuses",
                  config: {
                    id: "status",
                    label: "Statuses",
                    field: "status",
                    type: core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FilterType.SELECT,
                    operator: core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FilterOperator.EQ,
                    options: statusOptions,
                    includeAllOption: true
                  }
                },
                {
                  type: core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.ToolbarItemType.FILTER,
                  id: "protocol",
                  field: "protocol",
                  label: "Services",
                  config: {
                    id: "protocol",
                    label: "Services",
                    field: "protocol",
                    type: core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FilterType.SELECT,
                    operator: core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FilterOperator.EQ,
                    options: protocolOptions,
                    includeAllOption: true
                  }
                },
                {
                  type: core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.ToolbarItemType.FILTER,
                  id: "operation",
                  field: "operation",
                  label: "Operations",
                  config: {
                    id: "operation",
                    label: "Operations",
                    field: "operation",
                    type: core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FilterType.SELECT,
                    operator: core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FilterOperator.EQ,
                    options: operationOptions,
                    includeAllOption: true
                  }
                }
              ]
            }
          ]
        }
      }
    )
  ] }) }) }, "operations");
};
const OperationsFilterProvider = ({
  children
}) => {
  const { data: protocolCapabilities } = core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.useCapabilitiesByType("core:protocol");
  const { data: filterData, isLoading: isFiltersLoading } = useOperationFilters();
  const protocolCapabilitiesMap = core_dashboard__loadShare__react__loadShare__.useMemo(() => {
    if (!protocolCapabilities) return /* @__PURE__ */ new Map();
    return new Map(
      protocolCapabilities.map((cap) => {
        const key = cap.id.includes(":") ? cap.id.split(":")[0] : cap.id;
        return [key, cap];
      })
    );
  }, [protocolCapabilities]);
  const value = core_dashboard__loadShare__react__loadShare__.useMemo(
    () => ({
      filterData,
      isFiltersLoading,
      protocolCapabilitiesMap
    }),
    [filterData, isFiltersLoading, protocolCapabilitiesMap]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(OperationsFilterContext.Provider, { value, children });
};
function Operations() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(OperationsFilterProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(OperationsContent, {}) });
}

export { Operations as default };
