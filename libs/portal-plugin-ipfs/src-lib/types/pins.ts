// Minimal types needed by the onboarding plugin — mirrors the generated schemas
export interface PinResultsResponse {
  count: number;
  results: PinStatusResponse[];
}

export interface PinStatusResponse {
  created: string;
  delegates: string[];
  info?: Record<string, string>;
  pin: {
    cid: string;
    name?: string;
    origins?: string[];
  };
  requestid: string;
  status: string;
}
