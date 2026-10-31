export interface RegisterAppRequest {
  appID: string;
  callbackURL?: string;
  description: string;
  logoURL?: string;
  name: string;
  preAuthorizationSignature?: string;
  preAuthorizedKey?: string;
  serviceURL: string;
}

export function createRegisterAppRequest(
  overrides: Partial<RegisterAppRequest> = {},
): RegisterAppRequest {
  return {
    appID: "a".repeat(64),
    description: "fixture app",
    name: "fixture app",
    serviceURL: "https://example.test",
    ...overrides,
  };
}
