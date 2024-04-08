import { AccountApi } from "./account.js";
import { registerDefaults, Registry } from "./protocol/index.js";

export class Sdk {
  private accountApi?: AccountApi;
  private registry?: Registry;

  constructor(apiUrl: string) {
    this._apiUrl = apiUrl;
  }

  private _apiUrl: string;

  get apiUrl(): string {
    return this._apiUrl;
  }

  set apiUrl(value: string) {
    this._apiUrl = value;
  }

  public static create(apiUrl: string): Sdk {
    return new Sdk(apiUrl);
  }

  public account(): AccountApi {
    if (!this.accountApi) {
      this.accountApi = AccountApi.create(this._apiUrl);
    }
    return this.accountApi!;
  }

  public protocols(): Registry {
    if (!this.registry) {
      this.registry = new Registry(this);
      registerDefaults(this.registry!);
    }

    return this.registry!;
  }

  public setAuthToken(token: string) {
    this.account().jwtToken = token;

    for (const [, protocol] of this.protocols()) {
      protocol.setAuthToken(token);
    }
  }
}
