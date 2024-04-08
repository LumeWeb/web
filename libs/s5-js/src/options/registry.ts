import { CustomClientOptions } from "../utils/options.js";

export const DEFAULT_GET_ENTRY_OPTIONS = {};

export const DEFAULT_SET_ENTRY_OPTIONS = {
  endpointSetEntry: "/s5/registry",
};

export const DEFAULT_SUBSCRIBE_ENTRY_OPTIONS = {
  endpointSubscribeEntry: "/s5/registry/subscription",
} satisfies CustomRegistryOptions;

export const DEFAULT_PUBLISH_ENTRY_OPTIONS = {
  endpointPublishEntry: "/s5/registry",
} satisfies CustomRegistryOptions;

export type BaseCustomOptions = CustomClientOptions;

export interface CustomRegistryOptions extends BaseCustomOptions {
  endpointSubscribeEntry?: string;
  endpointPublishEntry?: string;
}
