export abstract class Protocol<T> {
  private sdk: T;

  constructor(sdk: T) {
    this.sdk = sdk;
  }

  public getSdk(): T {
    return this.sdk;
  }

  public abstract setAuthToken(token: string): Promise<void>;
}

export interface ProtocolConstructor<T> {
  new (apiDomain: string): Protocol<T>;
}

export function createProtocol<T>(
  implementation: ProtocolConstructor<T>,
  apiDomain: string,
): Protocol<T> {
  return new implementation(apiDomain);
}
