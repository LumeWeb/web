import {
  getGetApiAccountQuotaMockHandler,
  getGetApiAccountQuotaHistoryMockHandler,
} from "@lumeweb/portal-sdk/mocks";

export const quotaHandlers = [
  getGetApiAccountQuotaMockHandler(),
  getGetApiAccountQuotaHistoryMockHandler(),
];
