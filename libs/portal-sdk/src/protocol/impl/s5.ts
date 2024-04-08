import { Protocol } from "./protocol";
import { S5Client } from "@lumeweb/s5-js";

export const PROTOCOL_S5 = "s5";

export class S5 extends Protocol<S5Client> {
  constructor(apiDomain: string) {
    const sdk = new S5Client(`s5.${apiDomain}`);

    super(sdk);
  }

  async setAuthToken(token: string): Promise<void> {
    const options = this.getSdk().clientOptions;
    options.apiKey = token;
    this.getSdk().clientOptions = options;
  }
}
