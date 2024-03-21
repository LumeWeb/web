import {SdkProvider} from "~/data/sdk-provider.js";
import {S5Client} from "@lumeweb/s5-js";
import {PROTOCOL_S5} from "@lumeweb/portal-sdk";
import {Multihash} from "@lumeweb/libs5/lib/multihash.js";
import {AxiosProgressEvent} from "axios";
import {CancelablePromise} from "@lumeweb/s5-js/lib/axios.js";
import {MetadataResult} from "@lumeweb/s5-js/lib/options/download.js";
import {metadataMagicByte, Unpacker, CID, METADATA_TYPES, CID_TYPES} from "@lumeweb/libs5";

async function getIsManifest(s5: S5Client, hash: string): Promise<boolean | number> {

    let type: number | null;
    try {
        const abort = new AbortController();
        const resp = s5.downloadData(hash, {
            onDownloadProgress: (progressEvent: AxiosProgressEvent) => {
                if (progressEvent.loaded >= 10) {
                    abort.abort();
                }
            },
            httpConfig: {
                signal: abort.signal,
            },
        });

        const data = await resp;
        const unpacker = Unpacker.fromPacked(Buffer.from(data));
        try {
            const magic = unpacker.unpackInt();

            if (magic !== metadataMagicByte) {
                return false;
            }

            type = unpacker.unpackInt();

            if (!type || !Object.values(METADATA_TYPES).includes(type)) {
                return false;
            }
        } catch (e) {
            return false;
        }

    } catch (e) {
        return false;
    }

    switch (type) {
        case METADATA_TYPES.DIRECTORY:
            return CID_TYPES.DIRECTORY;
        case METADATA_TYPES.WEBAPP:
            return CID_TYPES.METADATA_WEBAPP;
        case METADATA_TYPES.MEDIA:
            return CID_TYPES.METADATA_MEDIA;
        case METADATA_TYPES.USER_IDENTITY:
            return CID_TYPES.USER_IDENTITY;
    }

    return 0;
}

export interface FileItem {
    cid: string;
    type: string;
    mimeType: string;
}

export const fileProvider: SdkProvider = {
    sdk: undefined,
    async getList() {
        const items: FileItem[] = [];
        try {
            const s5 = fileProvider.sdk?.protocols().get<S5Client>(PROTOCOL_S5)!.getSdk()!;
            const pinList = await s5.accountPins();
            for (const pin of pinList!.pins) {
                const manifest = await getIsManifest(s5, pin.hash) as number;

                if (manifest) {
                    const mHash = Multihash.fromBase64Url(pin.hash);
                    items.push({
                        cid: new CID(manifest, mHash, pin.size).toString(),
                        type: "manifest",
                        mimeType: "application/octet-stream",
                    });
                } else {
                    items.push({
                        cid: new CID(CID_TYPES.RAW, Multihash.fromBase64Url(pin.hash), pin.size).toString(),
                        type: "raw",
                        mimeType: pin.mime_type,
                    });
                }
            }
        } catch (e) {
            return Promise.reject(e);
        }

        return {
            data: items,
            total: items.length,
        };
    },
    getOne() {
        console.log("Not implemented");
        return Promise.resolve({
            data: {
                id: 1
            },
        });
    },
    update() {
        console.log("Not implemented");
        return Promise.resolve({
            data: {},
        });
    },
    create() {
        console.log("Not implemented");
        return Promise.resolve({
            data: {},
        });
    },
    deleteOne() {
        console.log("Not implemented");
        return Promise.resolve({
            data: {},
        });
    },
    getApiUrl() {
        return "";
    },
} satisfies SdkProvider;
