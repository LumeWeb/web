export const parseSingleResponse = (data: any) => {
  // Handle nested data structure
  if (data && typeof data === 'object' && data.data !== undefined) {
    return { data: data.data };
  }
  
  return { data };
};
