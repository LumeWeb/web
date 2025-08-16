import type { CrudSort } from "@refinedev/core";

export const generateSort = (sorters?: CrudSort[]) => {
  if (!sorters?.length) return {};

  const validSorters = sorters.filter(s => 
    s.field && 
    (s.order === undefined || ['asc', 'desc'].includes(s.order.toLowerCase()))
  );

  if (!validSorters.length) return {};

  return {
    _sort: validSorters.map(s => encodeURIComponent(s.field)).join(','),
    _order: validSorters.map(s => 
      encodeURIComponent(s.order?.toLowerCase() || 'asc')
    ).join(',')
  };
};
