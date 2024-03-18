import { Sdk } from "src/sdk.js";
import { Protocol } from "src/protocol/impl/protocol.js";

export class Registry {
  private store: Map<string, Protocol<any>>;
  private sdk: Sdk;
  private _apiDomain?: string;

  constructor(sdk: Sdk) {
    this.store = new Map();
    this.sdk = sdk;
  }

  public register<T>(name: string, value: Protocol<T>) {
    this.store.set(name, value);
  }

  public get<T>(name: string): Protocol<T> {
    return this.store.get(name) as Protocol<T>;
  }

  [Symbol.iterator]() {
    return this.store[Symbol.iterator]();
  }

  public getApiDomain(): string {
    if (!this._apiDomain) {
      const urlObject = new URL(this.sdk.apiUrl);
      this._apiDomain = urlObject.hostname;
    }

    return this._apiDomain;
  }
}
