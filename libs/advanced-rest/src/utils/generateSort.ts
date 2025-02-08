import type { CrudSort } from "@refinedev/core";

export const generateSort = (sorters?: CrudSort[]) => {
  if (!sorters?.length) return {};

  return {
    _sort: sorters.map(s => encodeURIComponent(s.field)).join(','),
    _order: sorters.map(s => encodeURIComponent(s.order?.toLowerCase() || 'asc')).join(',')
  };
};
