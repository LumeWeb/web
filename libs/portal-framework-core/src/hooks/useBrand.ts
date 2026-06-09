import { DEFAULT_BRAND, env, type BrandConfig } from "../env";

export function useBrand(): BrandConfig {
  const brand = env.VITE_PORTAL_BRAND;
  if (!brand) return DEFAULT_BRAND;
  return {
    ...DEFAULT_BRAND,
    ...brand,
  };
}
