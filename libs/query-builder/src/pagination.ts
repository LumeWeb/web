import type { Pagination } from "./types.js";

/**
 * Calculates pagination from page and pageSize
 */
export function calculatePagination(page: number, pageSize: number): Pagination {
  return {
    start: (page - 1) * pageSize,
    end: page * pageSize,
    page,
    pageSize,
  };
}

/**
 * Calculates page and pageSize from start and end
 */
export function calculatePageFromPagination(start: number, end: number): {
  page: number;
  pageSize: number;
} {
  const pageSize = end - start;
  if (pageSize <= 0) {
    return { page: 1, pageSize: 10 };
  }
  const page = Math.floor(start / pageSize) + 1;
  return { page, pageSize };
}

/**
 * Gets the next page
 */
export function getNextPage(pagination: Pagination): number | null {
  if (!pagination.page || !pagination.pageSize) {
    return null;
  }
  return pagination.page + 1;
}

/**
 * Gets the previous page
 */
export function getPrevPage(pagination: Pagination): number | null {
  if (!pagination.page || pagination.page <= 1) {
    return null;
  }
  return pagination.page - 1;
}

/**
 * Checks if there's a next page
 */
export function hasNextPage(total: number, pagination: Pagination): boolean {
  return pagination.end < total;
}

/**
 * Checks if there's a previous page
 */
export function hasPrevPage(pagination: Pagination): boolean {
  return pagination.start > 0;
}

/**
 * Gets the total number of pages
 */
export function getTotalPages(total: number, pageSize: number): number {
  return Math.ceil(total / pageSize);
}

/**
 * Sets pagination (immutable)
 */
export function setPagination(start: number, end: number, page?: number, pageSize?: number): Pagination {
  return { start, end, page, pageSize };
}

/**
 * Adds page info to pagination (immutable)
 */
export function setPageInfo(pagination: Pagination, page: number, pageSize: number): Pagination {
  const { start, end } = calculatePagination(page, pageSize);
  return { ...pagination, start, end, page, pageSize };
}

/**
 * Moves to next page (immutable)
 */
export function nextPage(pagination: Pagination, total: number): Pagination | null {
  if (!pagination.page || !pagination.pageSize) {
    return null;
  }
  const next = pagination.page + 1;
  const { start, end } = calculatePagination(next, pagination.pageSize);
  return start >= total ? null : { ...pagination, start, end, page: next };
}

/**
 * Moves to previous page (immutable)
 */
export function prevPage(pagination: Pagination): Pagination | null {
  if (!pagination.page || pagination.page <= 1) {
    return null;
  }
  const prev = pagination.page - 1;
  const pageSize = pagination.pageSize || (pagination.end - pagination.start);
  const { start, end } = calculatePagination(prev, pageSize);
  return { ...pagination, start, end, page: prev, pageSize };
}

/**
 * Clears pagination (immutable)
 */
export function clearPagination(): Pagination | undefined {
  return undefined;
}
