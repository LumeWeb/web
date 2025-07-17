import { jsxRuntimeExports } from './jsx-runtime-dlxeb5L7.js';
import { core_abuse__loadShare__react__loadShare__ } from './core_abuse__loadShare__react__loadShare__-BrHXNZXB.js';
import { RefineResource } from './index-Bms_1MiW.js';
import { core_abuse__loadShare___mf_0_refinedev_mf_1_core__loadShare__ } from './core_abuse__loadShare___mf_0_refinedev_mf_1_core__loadShare__-QzxGLbUR.js';
import { core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__ } from './core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__-qcw4tOvU.js';
import { PRIORITY_BADGE_CONFIG } from './badge-configs-B5Ptjltb.js';
import { CaseStatusBadge } from './CaseStatusBadge-D-MPH6uO.js';
import { TriangleAlert } from './triangle-alert-CI9wSOJ5.js';
import { User } from './user-S2yq91K-.js';
import { FileText } from './file-text-lxKDeUfn.js';
import { Search } from './search-V2RKDEqx.js';
import { X } from './x-Cbh8VDn9.js';
import { core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__ } from './core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__-CZ-6RiII.js';
import { core_abuse__loadShare__react_mf_2_router__loadShare__ } from './core_abuse__loadShare__react_mf_2_router__loadShare__-FO0Yg0OQ.js';

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = core_abuse__loadShare__react__loadShare__.useState(value);
  core_abuse__loadShare__react__loadShare__.useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);
  return debouncedValue;
}

function useGlobalSearch(initialQuery = "", enabled = true) {
  const [query, setQuery] = core_abuse__loadShare__react__loadShare__.useState(initialQuery);
  const debouncedQuery = useDebounce(query, 300);
  const [results, setResults] = core_abuse__loadShare__react__loadShare__.useState([]);
  const { data: casesData, isLoading: isLoadingCases } = core_abuse__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useList({
    filters: debouncedQuery ? [
      {
        field: "search",
        operator: "contains",
        value: debouncedQuery
      }
    ] : [],
    pagination: {
      current: 1,
      pageSize: 5
    },
    queryOptions: {
      enabled: !!debouncedQuery && enabled
      // Only run when there's a query and enabled
    },
    resource: RefineResource.Case
  });
  const { data: reportersData, isLoading: isLoadingReporters } = core_abuse__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useList({
    filters: debouncedQuery ? [
      {
        field: "q",
        operator: "contains",
        value: debouncedQuery
      }
    ] : [],
    pagination: {
      current: 1,
      pageSize: 5
    },
    //@ts-ignore
    queryOptions: {
      enabled: !!debouncedQuery && enabled
      // Only run when there's a query and enabled
    },
    resource: RefineResource.Reporter
  });
  const { data: subjectsData, isLoading: isLoadingSubjects } = core_abuse__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useList({
    filters: debouncedQuery ? [
      {
        field: "q",
        operator: "contains",
        value: debouncedQuery
      }
    ] : [],
    pagination: {
      current: 1,
      pageSize: 5
    },
    //@ts-ignore
    queryOptions: {
      enabled: !!debouncedQuery && enabled
      // Only run when there's a query and enabled
    },
    resource: RefineResource.Subject
  });
  const isSearching = isLoadingCases || isLoadingReporters || isLoadingSubjects;
  core_abuse__loadShare__react__loadShare__.useEffect(() => {
    if (!isSearching && debouncedQuery && enabled) {
      const caseResults = (casesData?.data || []).map(
        (caseItem) => ({
          id: caseItem.id,
          priority: caseItem.priority,
          referenceNumber: caseItem.referenceNumber,
          status: caseItem.status,
          subtitle: caseItem.description.substring(0, 60) + (caseItem.description.length > 60 ? "..." : ""),
          title: `Case ${caseItem.referenceNumber}`,
          type: "case"
        })
      );
      const reporterResults = (reportersData?.data || []).map((reporter) => ({
        email: reporter.email,
        id: reporter.id,
        subtitle: `${reporter.totalReportedCases} reported cases`,
        title: reporter.name,
        type: "reporter"
      }));
      const subjectResults = (subjectsData?.data || []).map((subject) => ({
        id: subject.id,
        identifier: subject.identifier,
        subtitle: `${subject.totalAssociatedCases || 0} associated cases`,
        title: subject.identifier,
        type: "subject"
      }));
      setResults([...caseResults, ...reporterResults, ...subjectResults]);
    } else if (!debouncedQuery) {
      setResults([]);
    }
  }, [
    casesData,
    reportersData,
    subjectsData,
    isSearching,
    debouncedQuery,
    enabled
  ]);
  return {
    debouncedQuery,
    isSearching,
    query,
    results,
    setQuery
  };
}

function CasePriorityBadge({
  priority,
  className
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.ThemedBadge,
    {
      className,
      config: PRIORITY_BADGE_CONFIG,
      value: priority
    }
  );
}

function SearchResults({
  className = "",
  emptyMessage = "Start typing to search...",
  groupClassName = "mb-2",
  isSearching,
  itemClassName = "flex flex-col w-full cursor-pointer rounded-md px-2 py-2 hover:bg-accent",
  loadingMessage = "Searching...",
  noResultsMessage = "No results found.",
  onSelect,
  query,
  results
}) {
  const getIcon = (type) => {
    switch (type) {
      case "case":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "mr-2 h-4 w-4 text-muted-foreground" });
      case "reporter":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "mr-2 h-4 w-4 text-muted-foreground" });
      case "subject":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "mr-2 h-4 w-4 text-muted-foreground" });
    }
  };
  if (isSearching) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-6 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-6 w-6 animate-spin mx-auto text-muted-foreground", children: "⟳" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-2", children: loadingMessage })
    ] });
  }
  if (!query) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-6 px-2 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: emptyMessage }) });
  }
  if (query && results.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-6 px-2 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: noResultsMessage }) });
  }
  const caseResults = results.filter((r) => r.type === "case");
  const reporterResults = results.filter((r) => r.type === "reporter");
  const subjectResults = results.filter((r) => r.type === "subject");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className, children: [
    caseResults.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: groupClassName, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-2 py-1.5 text-xs font-medium text-muted-foreground", children: "Cases" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: caseResults.map((result) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: itemClassName,
          onClick: () => onSelect(result),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
              getIcon(result.type),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: result.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-auto flex gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CaseStatusBadge, { status: result.status }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(CasePriorityBadge, { priority: result.priority })
              ] })
            ] }),
            result.subtitle && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground ml-6 mt-1 line-clamp-1", children: result.subtitle })
          ]
        },
        `case-${result.id}`
      )) })
    ] }),
    reporterResults.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: groupClassName, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-2 py-1.5 text-xs font-medium text-muted-foreground", children: "Reporters" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: reporterResults.map((result) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: itemClassName,
          onClick: () => onSelect(result),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
              getIcon(result.type),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: result.title })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground ml-6 mt-1", children: [
              result.email,
              " • ",
              result.subtitle
            ] })
          ]
        },
        `reporter-${result.id}`
      )) })
    ] }),
    subjectResults.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: groupClassName, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-2 py-1.5 text-xs font-medium text-muted-foreground", children: "Subjects" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: subjectResults.map((result) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: itemClassName,
          onClick: () => onSelect(result),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
              getIcon(result.type),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: result.title })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground ml-6 mt-1", children: result.subtitle })
          ]
        },
        `subject-${result.id}`
      )) })
    ] })
  ] });
}

function GlobalSearch() {
  const go = core_abuse__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useGo();
  const [isFocused, setIsFocused] = core_abuse__loadShare__react__loadShare__.useState(false);
  const searchRef = core_abuse__loadShare__react__loadShare__.useRef(null);
  const { isSearching, query, results, setQuery } = useGlobalSearch();
  core_abuse__loadShare__react__loadShare__.useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const handleSelect = (result) => {
    setIsFocused(false);
    setQuery("");
    go({
      to: {
        action: "show",
        id: result.id,
        resource: result.type
      }
    });
  };
  const clearSearch = () => {
    setQuery("");
  };
  const showResults = isFocused && (!!query || results.length > 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-1/4 min-w-[250px]", ref: searchRef, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "mr-2 h-4 w-4 shrink-0 opacity-50" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          className: "flex-1 bg-transparent outline-none placeholder:text-muted-foreground",
          onChange: (e) => setQuery(e.target.value),
          onFocus: () => setIsFocused(true),
          placeholder: "Global search",
          type: "text",
          value: query
        }
      ),
      query && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          "aria-label": "Clear search",
          className: "ml-1 rounded-full p-1 hover:bg-muted",
          onClick: clearSearch,
          type: "button",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4 opacity-50" })
        }
      )
    ] }) }),
    showResults && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-[calc(100%+4px)] left-0 z-50 w-full overflow-hidden rounded-md border bg-popover shadow-md animate-in fade-in-0 zoom-in-95", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-[300px] overflow-auto p-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      SearchResults,
      {
        isSearching,
        onSelect: handleSelect,
        query,
        results
      }
    ) }) })
  ] });
}

function SearchCommand() {
  const go = core_abuse__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useGo();
  const [open, setOpen] = core_abuse__loadShare__react__loadShare__.useState(false);
  const { isSearching, query, results, setQuery } = useGlobalSearch("", open);
  core_abuse__loadShare__react__loadShare__.useEffect(() => {
    const down = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open2) => !open2);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);
  const handleSelect = (result) => {
    setOpen(false);
    setQuery("");
    go({
      to: {
        action: "show",
        id: result.id,
        resource: result.type
      }
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "fixed bottom-0 left-0 right-0 hidden border-t bg-background p-1 text-center text-xs text-muted-foreground md:block", children: [
      "Press",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsxs("kbd", { className: "pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: "⌘" }),
        "K"
      ] }),
      " ",
      "to search"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.CommandDialog,
      {
        className: "overflow-hidden",
        onOpenChange: setOpen,
        open,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center border-b px-3 py-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "mr-2 h-4 w-4 shrink-0 opacity-50" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                className: "flex h-8 w-full rounded-md bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
                onChange: (e) => setQuery(e.target.value),
                placeholder: "Global search",
                value: query
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.CommandList, { className: "max-h-[400px] overflow-auto p-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            SearchResults,
            {
              emptyMessage: "Start typing to search cases, reporters, and subjects...",
              isSearching,
              loadingMessage: "Searching...",
              noResultsMessage: "No results found.",
              onSelect: handleSelect,
              query,
              results
            }
          ) })
        ]
      }
    )
  ] });
}

function Layout$1({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "sticky top-0 z-10 flex h-16 items-center border-b bg-background px-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(GlobalSearch, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "h-full", children }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SearchCommand, {})
  ] }) });
}

function Layout() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(core_abuse__loadShare___mf_0_refinedev_mf_1_core__loadShare__.Authenticated, { v3LegacyAuthProviderCompatible: false, children: /* @__PURE__ */ jsxRuntimeExports.jsx(core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.GeneralLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Layout$1, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(core_abuse__loadShare__react_mf_2_router__loadShare__.Outlet, {}) }) }) }, "dashboard");
}

export { Layout as default };
