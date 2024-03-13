import {AccountApi} from "./account.js";

export class Sdk {
  private apiUrl: string;
  private accountApi?: AccountApi;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  public static create(apiUrl: string): Sdk {
    return new Sdk(apiUrl);
  }

  public account(): AccountApi {
    if (!this.accountApi) {
      this.accountApi = AccountApi.create(this.apiUrl);
    }
    return this.accountApi!;
  }
}
