import type { LogicalFilter } from "@refinedev/core";
import type { ReactNode } from "react";

import React, { createContext, useContext, useReducer } from "react";

import type { FieldType } from "../types/filter-types";
import type { FilterChip } from "../types/table/toolbar";

export interface FilterState {
  columnFilters: { id: string; value: { operator: string; value: any } }[];
  filterChips: FilterChip[];
  logicalFilters: LogicalFilter[];
}

type FilterAction =
  | { field: string; type: 'REMOVE_FILTER'; }
  | { filter: LogicalFilter; type: 'ADD_FILTER'; }
  | { type: 'CLEAR_FILTERS' };

interface FilterContextType {
  dispatch: React.Dispatch<FilterAction>;
  formatFilterValue: (filter: LogicalFilter, type?: FieldType) => string;
  state: FilterState;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

const filterReducer = (state: FilterState, action: FilterAction): FilterState => {
  switch (action.type) {
    case 'ADD_FILTER':
      return {
        ...state,
        columnFilters: [
          ...state.columnFilters,
          {
            id: action.filter.field,
            value: { operator: action.filter.operator, value: action.filter.value }
          }
        ],
        logicalFilters: [...state.logicalFilters, action.filter]
      };
    case 'CLEAR_FILTERS':
      return { columnFilters: [], filterChips: [], logicalFilters: [] };
    case 'REMOVE_FILTER':
      return {
        ...state,
        columnFilters: state.columnFilters.filter(f => f.id !== action.field),
        logicalFilters: state.logicalFilters.filter(f => f.field !== action.field)
      };
    default:
      return state;
  }
};

const formatFilterValue = (filter: LogicalFilter, type?: FieldType): string => {
  // Handle null/undefined specifically for date and boolean types before type-specific formatting
  if (filter.value === null) {
      return 'null';
  }
  if (filter.value === undefined) {
      return 'undefined';
  }

  if (type === 'date') {
    // Value is not null/undefined here, so it should be a valid date string/object
    try {
        return new Date(filter.value).toLocaleDateString();
    } catch (e) {
        console.error("Error formatting date filter value:", filter.value, e);
        return String(filter.value); // Fallback to string conversion on error
    }
  }
  if (type === 'boolean') {
    // Value is not null/undefined here, check if it's a boolean
    if (typeof filter.value === 'boolean') {
        return filter.value ? 'Yes' : 'No';
    }
    // If type is boolean but value is not boolean, fallback to string conversion
    console.warn(`Expected boolean value for filter field "${filter.field}", but received type "${typeof filter.value}"`);
  }

  // Default to string conversion for all other types or non-boolean values with boolean type hint
  return String(filter.value);
};

export const FilterProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(filterReducer, {
    columnFilters: [],
    filterChips: [],
    logicalFilters: []
  });

  return (
    <FilterContext.Provider value={{ dispatch, formatFilterValue, state }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilterState = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilterState must be used within a FilterProvider');
  }
  return context;
};
