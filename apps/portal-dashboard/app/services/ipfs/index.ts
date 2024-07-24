import BaseService from "~/services/base";
import getUploadManager from "~/features/uploadManager/store/getUploadManager";
import XHRUpload, { XhrUploadOpts } from "@uppy/xhr-upload";
import TusUpload, { TusOpts } from "@uppy/tus";
import CarPreprocessorPlugin from "~/services/ipfs/carPreprocessor";
import getProtocolDomain from "~/util/getProtocolDomain";
import getSdk from "~/stores/getSdk.js";

const SERVICE_ID = "ipfs";
const SERVICE_NAME = "IPFS";

export class IPFS extends BaseService {
  public id(): string {
    return SERVICE_ID;
  }

  public name(): string {
    return SERVICE_NAME;
  }

  public register(): void {
    getProtocolDomain(SERVICE_ID).then((domain) => {
      getUploadManager().registerService({
        id: SERVICE_ID,
        name: SERVICE_NAME,
        largeFilePlugin: {
          plugin: TusUpload,
          options: {
            endpoint: `https://${domain}/api/upload/tus`,
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${getSdk()?.account().jwtToken}`,
            },
            storeFingerprintForResuming: false,
          } satisfies Partial<TusOpts<any, any>>,
        },
        smallFilePlugin: {
          plugin: XHRUpload,
          options: {
            withCredentials: true,
            endpoint: `https://${domain}/api/upload`,
            method: "POST",
            headers: {
              Authorization: `Bearer ${getSdk()?.account().jwtToken}`,
            },
          } satisfies Partial<XhrUploadOpts<any, any>>,
        },
      });
      getUploadManager().usePlugin(CarPreprocessorPlugin);
    });
  }
}
