import {
  DataTable,
  FilterOperator,
  FilterType,
  GeneralLayout,
  PageHeader,
  ToolbarItemType,
  ComponentSize,
  Copyable,
} from "@lumeweb/portal-framework-ui";
import { createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@lumeweb/portal-framework-ui-core";
import type { ProtocolCapability } from "@lumeweb/portal-plugin-dashboard";
import { useCapabilitiesByType } from "@lumeweb/portal-framework-core";
import { useOperationFilters } from "@/ui/hooks/useOperationFilters";
import { Authenticated } from "@refinedev/core";
import { useMemo, createContext, useContext } from "react";

interface OperationListItem {
  cid?: any;
  current_step?: number;
  error?: string;
  estimated_completion_at?: string;
  id: number;
  operation: string;
  operation_display_name?: string;
  progress_percent: number;
  protocol: string;
  protocol_display_name?: string;
  started_at: string;
  status: string;
  status_display_name?: string;
  status_message: string;
  total_steps?: number;
  updated_at: string;
}

const columnHelper = createColumnHelper<OperationListItem>();

// Create context for filter data
const OperationsFilterContext = createContext<{
  filterData: any;
  isFiltersLoading: boolean;
  protocolCapabilitiesMap: Map<string, ProtocolCapability>;
} | null>(null);

// Custom hook to use the filter context
const useOperationsFilterContext = () => {
  const context = useContext(OperationsFilterContext);
  if (!context) {
    throw new Error(
      "useOperationsFilterContext must be used within OperationsFilterProvider",
    );
  }
  return context;
};

// Inner component that uses the context
const OperationsContent = () => {
  const { filterData, isFiltersLoading, protocolCapabilitiesMap } =
    useOperationsFilterContext();

  const columns = [
    columnHelper.accessor("operation", {
      cell: (info) => (
        <span className="font-medium text-white">
          {info.row.original.operation_display_name || info.getValue()}
        </span>
      ),
      header: "Operation",
    }),
    columnHelper.accessor("protocol", {
      cell: (info) => {
        const protocolId = info.getValue();
        const protocolDisplayName = info.row.original.protocol_display_name;

        const protocolCapability = protocolCapabilitiesMap.get(protocolId);

        if (!protocolCapability) {
          return (
            <span className="text-gray-400">
              {protocolDisplayName || protocolId}
            </span>
          );
        }

        const IconComponent = protocolCapability.getIcon();
        const name = protocolCapability.getName();
        const description = protocolCapability.getDescription();

        return (
          <div className="flex items-center gap-2">
            {IconComponent && <IconComponent className="h-4 w-4" />}
            <span className="text-gray-400" title={description}>
              {protocolDisplayName || name}
            </span>
          </div>
        );
      },
      header: "Service",
    }),
    columnHelper.accessor("cid", {
      cell: (info) => {
        const cidValue = info.getValue();
        
        // Handle CID object format { "/": "bafy..." } or string
        const getSafeCidString = (cid: any): string | undefined => {
          if (typeof cid === 'string') return cid;
          if (cid && typeof cid === 'object' && cid['/']) return cid['/'];
          return undefined;
        };

        const cid = getSafeCidString(cidValue);
        
        if (!cid) {
          return <span className="text-gray-500">-</span>;
        }

        return (
          <Copyable
            text={cid}
            displayText={cid}
            maxLength={32}
            className="font-mono text-sm text-gray-400"
          />
        );
      },
      header: "CID",
    }),
    columnHelper.accessor("status", {
      cell: (info) => {
        const status = info.getValue();
        const statusDisplayName = info.row.original.status_display_name;
        const getStatusColor = (status: string) => {
          switch (status.toLowerCase()) {
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

        return (
          <Badge className={`${getStatusColor(status)} border-0 text-white`}>
            {statusDisplayName || status}
          </Badge>
        );
      },
      header: "Status",
    }),
    columnHelper.accessor("progress_percent", {
      cell: (info) => {
        const progress = info.getValue();
        const status = info.row.original.status;

        if (status?.toLowerCase() === "failed") {
          return <span className="text-sm text-gray-500">-</span>;
        }

        return (
          <div className="flex items-center gap-2">
            <div className="h-2 w-16 rounded-full bg-gray-700">
              <div
                className="h-2 animate-pulse rounded-full bg-blue-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm text-gray-400">{progress}%</span>
          </div>
        );
      },
      header: "Progress",
    }),
    columnHelper.accessor("started_at", {
      cell: (info) => (
        <span className="text-gray-400">
          {format(new Date(info.getValue()), "MMM d, yyyy, hh:mm a")}
        </span>
      ),
      header: "Started",
    }),
    columnHelper.accessor("status_message", {
      cell: (info) => (
        <span className="text-sm text-gray-400">{info.getValue()}</span>
      ),
      header: "Status Message",
    }),
    columnHelper.accessor("error", {
      cell: (info) => {
        const error = info.getValue();
        return error ? (
          <span className="text-sm text-red-400">{error}</span>
        ) : (
          <span className="text-sm text-gray-500">-</span>
        );
      },
      header: "Error",
    }),
  ];

  // Generate dynamic filter options from API data
  const statusOptions = (filterData?.statuses || []).map((option: any) => ({
    label: option.name,
    value: option.value,
    description: option.description,
  }));

  const operationOptions = (filterData?.operations || []).map(
    (option: any) => ({
      label: option.name,
      value: option.value,
      description: option.description,
    }),
  );

  const protocolOptions = (filterData?.protocols || []).map((option: any) => {
    // Try to get description from protocol capability, fallback to filter data
    const protocolCapability = protocolCapabilitiesMap.get(option.value);
    const description =
      protocolCapability?.getDescription() || option.description;

    return {
      label: option.name,
      value: option.value,
      description: description,
    };
  });

  return (
    <Authenticated key="operations" v3LegacyAuthProviderCompatible={false}>
      <GeneralLayout>
        <div className="space-y-6">
          <PageHeader
            description="Monitor uploads and pins across all services"
            title="Operations"
          />
          <DataTable
            columns={columns}
            emptyStateMessage="No operations found."
            pagination={true}
            refetchInterval={5000}
            resource={"operations"}
            toolbar={{
              items: isFiltersLoading
                ? []
                : [
                    {
                      type: ToolbarItemType.FILTER_GROUP,
                      id: "operations-filters",
                      label: "Filters",
                      size: ComponentSize.AUTO,
                      dropdownStyle: true,
                      items: [
                        {
                          id: "status",
                          label: "Statuses",
                          config: {
                            type: FilterType.SELECT,
                            operator: FilterOperator.EQ,
                            options: statusOptions,
                            includeAllOption: true,
                          },
                        },
                        {
                          id: "protocol",
                          label: "Services",
                          config: {
                            type: FilterType.SELECT,
                            operator: FilterOperator.EQ,
                            options: protocolOptions,
                            includeAllOption: true,
                          },
                        },
                        {
                          id: "operation",
                          label: "Operations",
                          config: {
                            type: FilterType.SELECT,
                            operator: FilterOperator.EQ,
                            options: operationOptions,
                            includeAllOption: true,
                          },
                        },
                      ],
                    },
                  ],
            }}
          />
        </div>
      </GeneralLayout>
    </Authenticated>
  );
};

// Provider component to stabilize filter data
const OperationsFilterProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { data: protocolCapabilities } =
    useCapabilitiesByType<ProtocolCapability>("core:protocol");

  const { data: filterData, isLoading: isFiltersLoading } =
    useOperationFilters();

  // Create a map for efficient lookup of protocol capabilities
  const protocolCapabilitiesMap = useMemo(() => {
    if (!protocolCapabilities) return new Map();
    return new Map(
      protocolCapabilities.map((cap) => {
        const key = cap.id.includes(":") ? cap.id.split(":")[0] : cap.id;
        return [key, cap];
      }),
    );
  }, [protocolCapabilities]);

  const value = useMemo(
    () => ({
      filterData,
      isFiltersLoading,
      protocolCapabilitiesMap,
    }),
    [filterData, isFiltersLoading, protocolCapabilitiesMap],
  );

  return (
    <OperationsFilterContext.Provider value={value}>
      {children}
    </OperationsFilterContext.Provider>
  );
};

export default function Operations() {
  return (
    <OperationsFilterProvider>
      <OperationsContent />
    </OperationsFilterProvider>
  );
}
