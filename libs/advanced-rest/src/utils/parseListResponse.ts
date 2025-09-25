/**
 * Parse list response data and extract array and total count
 * Handles various response patterns:
 * 1. Direct array responses: { data: [...] }
 * 2. Nested array responses: { data: { data: [...] } }
 * 3. Object responses with array properties: { items: [...], total: 100 }
 * 4. Direct array as root: [...]
 * 5. Object with array at different property names
 * 6. Object responses without known array properties: return the object itself
 */
export const parseListResponse = (data: any, totalCount: number) => {
  let total = totalCount;
  let dataArray: any[] = [];

  // Handle total count
  if (Number.isNaN(total) || total === 0) {
    if (data && typeof data.total === "number") {
      total = data.total;
    } else {
      total = 0;
      console.warn("Total count not found in headers or data.");
    }
  }

  // Handle different response patterns
  if (Array.isArray(data)) {
    // Pattern 4: Direct array as root: [...]
    dataArray = data;
  } else if (data && typeof data === "object") {
    // Pattern 1: Direct array responses: { data: [...] }
    if (Array.isArray(data.data)) {
      dataArray = data.data;
    }
    // Pattern 2: Nested array responses: { data: { data: [...] } }
    else if (
      data.data &&
      typeof data.data === "object" &&
      Array.isArray(data.data.data)
    ) {
      dataArray = data.data.data;
    }
    // Pattern 3: Object responses with array properties
    else if (Array.isArray(data.items)) {
      dataArray = data.items;
    } else if (Array.isArray(data.results)) {
      dataArray = data.results;
    } else if (Array.isArray(data.records)) {
      dataArray = data.records;
    }
    // Pattern 6: Object responses without known array properties: return the innermost object
    else {
      // Traverse nested objects to find the innermost data
      let currentData = data;
      while (
        currentData &&
        typeof currentData === "object" &&
        !Array.isArray(currentData) &&
        currentData.data
      ) {
        currentData = currentData.data;
      }
      // If we found a non-object/non-array data, use it directly as dataArray
      // Otherwise, use the original data object as dataArray
      dataArray =
        currentData && typeof currentData !== "object" ? currentData : data;
    }
  } else {
    // Handle non-object, non-array responses
    dataArray = [];
  }

  return { data: dataArray, total };
};
