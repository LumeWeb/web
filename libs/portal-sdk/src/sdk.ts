import { AccountApi } from "@/account";

export class Sdk {
  private readonly accountApi: AccountApi;

  constructor(apiUrl: string) {
    if (!apiUrl) throw new Error("API URL is required");
    this.accountApi = new AccountApi(apiUrl);
  }

  public account(): AccountApi {
    return this.accountApi;
  }

  public setAuthToken(token: string): void {
    this.accountApi.setToken(token);
  }
}
