import type { BaseRecord } from "@refinedev/core";

export { RefineResource } from "@lumeweb/portal-plugin-abuse-common";

export interface AuthError {
  name: string;
  status_code?: number;
}
export interface Identity extends BaseRecord {
  [key: string]: unknown;
  id: string;
  name: string;
}

export type Permission = string;

export type Role = string[];
