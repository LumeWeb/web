import {
    CustomDownloadOptions,
    CustomGetMetadataOptions,
    DEFAULT_DOWNLOAD_OPTIONS,
    DEFAULT_GET_METADATA_OPTIONS,
    MetadataResult,
} from "./options/download.js";

import {addUrlQuery, ensureUrl} from "./utils/url.js";

import {
    CustomRegistryOptions,
    DEFAULT_GET_ENTRY_OPTIONS,
    DEFAULT_PUBLISH_ENTRY_OPTIONS,
    DEFAULT_SUBSCRIBE_ENTRY_OPTIONS,
} from "./options/registry.js";
import {CustomClientOptions, optionsToConfig} from "./utils/options.js";
import {throwValidationError} from "./utils/validation.js";
import {
    AccountPinsResponse,
    BasicUploadResponse, deleteS5DeleteCid,
    getS5AccountPins,
    getS5BlobCid,
    getS5DownloadCid,
    getS5MetadataCid, getS5PinCidStatus,
    getS5Registry, postS5PinCid,
    postS5Registry,
    postS5Upload,
    postS5UploadDirectory,
    PostS5UploadDirectoryParams,
    PostS5UploadResult,
} from "./generated/index.js";
import path from "path";
import {customInstance} from "./axios.js";
import {ensureBytes, equalBytes} from "@noble/curves/abstract/utils";
import {concatBytes} from "@noble/hashes/utils";
import {CID_HASH_TYPES} from "@lumeweb/libs5";
import {buildRequestUrl} from "./request.js";
import WS from "isomorphic-ws";
import {
    CID,
    CID_TYPES,
    createKeyPair,
    KeyPairEd25519,
    Packer,
    SignedRegistryEntry,
} from "@lumeweb/libs5";
import {
    deserializeRegistryEntry,
    signRegistryEntry,
    verifyRegistryEntry,
} from "@lumeweb/libs5/lib/service/registry.js";
import {Buffer} from "buffer";
import {AxiosError} from "axios";
import {
    CustomUploadOptions,
    DEFAULT_UPLOAD_OPTIONS,
    TUS_ENDPOINT,
    UploadResult,
} from "./options/upload.js";
import {
    DetailedError,
    HttpRequest,
    Upload,
    UploadOptions,
} from "tus-js-client";
import {ensureFileObjectConsistency} from "./utils/file.js";
import defer from "p-defer";
import {Multihash} from "@lumeweb/libs5/lib/multihash.js";
import {blake3} from "@noble/hashes/blake3";
import {base64urlDecode, base64urlEncode} from "./utils/encoding.js";
import {CustomPinOptions, DEFAULT_PIN_OPTIONS} from "./options/pin.js";

export class S5Error extends Error {
    public statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.name = "S5Error";
        this.statusCode = statusCode;
    }
}

/**
 * The S5 Client which can be used to access S5-net.
 */
export class S5Client {
    /**
     * The S5 Client which can be used to access S5-net.
     *
     * @class
     * @param [portalUrl] The initial portal URL to use to access S5, if specified. A request will be made to this URL to get the actual portal URL. To use the default portal while passing custom options, pass "".
     * @param [customOptions] Configuration for the client.
     */
    constructor(portalUrl: string, customOptions: CustomClientOptions = {}) {
        if (!portalUrl) {
            throwValidationError("portalUrl", portalUrl, "parameter", "string");
        }
        this._portalUrl = ensureUrl(portalUrl);
        this._clientOptions = customOptions;
    }

    private _clientOptions: CustomClientOptions;

    get clientOptions(): CustomClientOptions {
        return this._clientOptions;
    }

    set clientOptions(value: CustomClientOptions) {
        this._clientOptions = value;
    }

    private _portalUrl: string;

    get portalUrl(): string {
        return this._portalUrl;
    }

    public static create(
        portalUrl: string,
        customOptions: CustomClientOptions = {},
    ) {
        return new S5Client(portalUrl, customOptions);
    }

    public async accountPins(
        customOptions: CustomClientOptions = {},
    ): Promise<AccountPinsResponse> {
        const opts = {
            ...this.clientOptions,
            ...customOptions,
            ...{
                endpointPath: "/s5/account/pins",
                baseUrl: await this.portalUrl,
            },
        };

        const config = optionsToConfig(this, opts);

        return await getS5AccountPins(config);
    }

    /**
     * Initiates a download of the content of the cid within the browser.
     *
     * @param cid - 46-character cid, or a valid cid URL. Can be followed by a path. Note that the cid will not be encoded, so if your path might contain special characters, consider using `clientOptions.path`.
     * @param [customOptions] - Additional settings that can optionally be set.
     * @param [customOptions.endpointDownload="/"] - The relative URL path of the portal endpoint to contact.
     * @returns - The full URL that was used.
     * @throws - Will throw if the cid does not contain a cid or if the path option is not a string.
     */
    public async downloadFile(
        cid: string,
        customOptions?: CustomDownloadOptions,
    ): Promise<string> {
        const url = await this.getCidUrl(cid, customOptions);

        // Download the url.
        window.location.assign(url);

        return url;
    }

    /**
     * Constructs the full URL for the given cid.
     *
     * @param cid - Base64 cid, or a valid URL that contains a cid. See `downloadFile`.
     * @param [customOptions] - Additional settings that can optionally be set.
     * @param [customOptions.endpointDownload="/"] - The relative URL path of the portal endpoint to contact.
     * @returns - The full URL for the cid.
     * @throws - Will throw if the cid does not contain a cid or if the path option is not a string.
     */
    public async getCidUrl(
        cid: string,
        customOptions: CustomDownloadOptions = {},
    ): Promise<string> {
        const opt = {...this.clientOptions, customOptions};
        return addUrlQuery(path.join(this.portalUrl, cid), {
            auth_token: opt.apiKey,
        });
    }

    /**
     * Gets only the metadata for the given cid without the contents.
     *
     * @param cid - Base64 cid.
     * @param [customOptions] - Additional settings that can optionally be set. See `downloadFile` for the full list.
     * @param [customOptions.endpointGetMetadata="/"] - The relative URL path of the portal endpoint to contact.
     * @returns - The metadata in JSON format. Empty if no metadata was found.
     * @throws - Will throw if the cid does not contain a cid .
     */
    public async getMetadata(
        cid: string,
        customOptions: CustomGetMetadataOptions = {},
    ): Promise<MetadataResult> {
        const config = optionsToConfig(
            this,
            DEFAULT_GET_METADATA_OPTIONS,
            customOptions,
        );

        const response = await getS5MetadataCid(cid, config);

        return {metadata: response};
    }

    /**
     * Downloads in-memory data from a S5 cid.
     * @param cid - 46-character cid, or a valid cid URL.
     * @param [customOptions] - Additional settings that can optionally be set.
     * @returns - The data
     */
    public async downloadData(
        cid: string,
        customOptions: CustomDownloadOptions = {},
    ): Promise<ArrayBuffer> {
        const config = optionsToConfig(
            this,
            DEFAULT_DOWNLOAD_OPTIONS,
            customOptions,
        );

        return await (await getS5DownloadCid(cid, config)).arrayBuffer();
    }

    /**
     * Downloads a proof for the given cid.
     * @param cid - 46-character cid, or a valid cid URL.
     * @param [customOptions] - Additional settings that can optionally be set.
     * @returns - The data
     */
    public async downloadProof(
        cid: string,
        customOptions: CustomDownloadOptions = {},
    ): Promise<ArrayBuffer> {
        return this.downloadData(`${cid}.obao`, customOptions);
    }

    /**
     * Downloads a blob from the given cid. This will capture a 301 redirect to the actual blob location, then download the blob.
     * @param cid - 46-character cid, or a valid cid URL.
     * @param [customOptions] - Additional settings that can optionally be set.
     * @returns - The data
     */

    async downloadBlob(
        cid: string,
        customOptions: CustomDownloadOptions = {},
    ): Promise<ArrayBuffer> {
        const config = optionsToConfig(
            this,
            DEFAULT_DOWNLOAD_OPTIONS,
            customOptions,
        );

        let location: string | null = null;

        await getS5BlobCid(cid, {
            ...config,
            responseType: "arraybuffer",
            beforeRedirect: (config, responseDetails) => {
                location = responseDetails.headers["location"];
            },
        });

        if (!location) {
            throw new Error("Failed to download blob");
        }

        return await customInstance<ArrayBuffer>(
            {
                url: `/s5/blob/${cid}`,
                method: "GET",
                responseType: "arraybuffer",
            },
            config,
        );
    }

    public async subscribeToEntry(
        publicKey: Uint8Array,
        customOptions: CustomRegistryOptions = {},
    ) {
        const opts = {
            ...DEFAULT_SUBSCRIBE_ENTRY_OPTIONS,
            ...this.clientOptions,
            ...customOptions,
        } satisfies CustomRegistryOptions;

        publicKey = ensureBytes("public key", publicKey, 32);
        publicKey = concatBytes(
            Uint8Array.from([CID_HASH_TYPES.ED25519]),
            publicKey,
        );

        const url = await buildRequestUrl(this, {
            baseUrl: await this.portalUrl,
            endpointPath: opts.endpointSubscribeEntry,
        });

        const wsUrl = url.replace(/^http/, "ws");

        const socket = new WS(wsUrl);
        socket.binaryType = "arraybuffer";

        socket.addEventListener("open", () => {
            const packer = new Packer();
            packer.pack(2);
            packer.pack(publicKey);

            socket.send(packer.takeBytes());
        });

        return {
            listen(cb: (entry: SignedRegistryEntry) => void) {
                socket.addEventListener("message", (data) => {
                    cb(deserializeRegistryEntry(new Uint8Array(data.data as Buffer)));
                });
            },
            end() {
                if (
                    [socket.CLOSING, socket.CLOSED].includes(socket.readyState as any)
                ) {
                    return;
                }
                socket.close();
            },
        };
    }

    public async publishEntry(
        signedEntry: SignedRegistryEntry,
        customOptions: CustomRegistryOptions = {},
    ) {
        const config = optionsToConfig(
            this,
            DEFAULT_PUBLISH_ENTRY_OPTIONS,
            customOptions,
        );

        if (!verifyRegistryEntry(signedEntry)) {
            throwValidationError(
                "signedEntry", // name of the variable
                signedEntry, // actual value
                "parameter", // valueKind (assuming it's a function parameter)
                "a valid signed registry entry", // expected description
            );
        }

        return postS5Registry(
            {
                pk: base64urlEncode(signedEntry.pk),
                revision: signedEntry.revision,
                data: base64urlEncode(signedEntry.data),
                signature: base64urlEncode(signedEntry.signature),
            },
            config,
        );
    }

    public async createEntry(
        sk: Uint8Array | KeyPairEd25519,
        cid: CID,
        revision = 0,
    ) {
        if (sk instanceof Uint8Array) {
            sk = createKeyPair(sk);
        }

        let existing = true;
        let entry = await this.getEntry(sk.publicKey);

        if (!entry) {
            existing = false;
            entry = {
                pk: sk.publicKey,
                data: cid.toRegistryEntry(),
                revision,
            } as unknown as SignedRegistryEntry;
        }

        if (!equalBytes(sk.publicKey, entry.pk)) {
            throwValidationError(
                "entry.pk", // name of the variable
                Buffer.from(entry.pk).toString("hex"), // actual value
                "result", // valueKind (assuming it's a function parameter)
                Buffer.from(sk.publicKey).toString("hex"), // expected description
            );
        }

        if (existing) {
            const newEntry = cid.toRegistryEntry();
            if (equalBytes(entry.data, newEntry)) {
                return entry;
            }

            entry.revision++;
            entry.data = newEntry;
        }
        const signedEntry = signRegistryEntry({
            kp: sk,
            data: entry.data,
            revision: entry.revision,
        });

        await this.publishEntry(signedEntry);

        return signedEntry;
    }

    public async getEntry(
        publicKey: Uint8Array,
        customOptions: CustomRegistryOptions = {},
    ) {
        const config = optionsToConfig(
            this,
            DEFAULT_GET_ENTRY_OPTIONS,
            customOptions,
        );

        try {
            const ret = await getS5Registry(
                {
                    pk: base64urlEncode(publicKey),
                },
                config,
            );

            const signedEntry = {
                pk: base64urlDecode(<string>ret.pk),
                revision: ret.revision,
                data: base64urlDecode(<string>ret.data),
                signature: base64urlDecode(<string>ret.signature),
            } as SignedRegistryEntry;

            if (!verifyRegistryEntry(signedEntry)) {
                throwValidationError(
                    "signedEntry", // name of the variable
                    signedEntry, // actual value
                    "result", // valueKind (assuming it's a function parameter)
                    "a valid signed registry entry", // expected description
                );
            }

            return signedEntry;
        } catch (e) {
            if ((e as AxiosError).response?.status === 404) {
                return undefined;
            }

            throw e;
        }
    }

    /**
     * Uploads a file to S5-net.
     *
     * @param file - The file to upload.
     * @param [customOptions] - Additional settings that can optionally be set.
     * @returns - The returned cid.
     * @throws - Will throw if the request is successful but the upload response does not contain a complete response.
     */
    public async uploadFile(
        file: File,
        customOptions: CustomUploadOptions = {},
    ): Promise<any> {
        const opts = {
            ...DEFAULT_UPLOAD_OPTIONS,
            ...this.clientOptions,
            ...customOptions,
        } as CustomUploadOptions;

        if (file.size < <number>opts?.largeFileSize) {
            return this.uploadSmallFile(file, opts);
        } else {
            return this.uploadLargeFile(file, opts);
        }
    }

    /**
     * Uploads a small file to S5-net.
     *
     * @param file - The file to upload.
     * @param [customOptions] - Additional settings that can optionally be set.

     * @returns UploadResult - The returned cid.
     * @throws - Will throw if the request is successful but the upload response does not contain a complete response.
     */
    public async uploadSmallFile(
        file: File,
        customOptions: CustomUploadOptions,
    ): Promise<UploadResult> {
        const response = await this.uploadSmallFileRequest(file, customOptions);

        return {cid: CID.decode(<string>response.cid)};
    }

    /* istanbul ignore next */
    /**
     * Uploads a large file to S5-net using tus.
     *
     * @param file - The file to upload.
     * @param [customOptions] - Additional settings that can optionally be set.
     * @param [customOptions.endpointLargeUpload="/s5/upload/tus"] - The relative URL path of the portal endpoint to contact.
     * @returns - The returned cid.
     * @throws - Will throw if the request is successful but the upload response does not contain a complete response.
     */
    public async uploadLargeFile(
        file: File,
        customOptions: CustomUploadOptions = {},
    ): Promise<UploadResult> {
        return await this.uploadLargeFileRequest(file, customOptions);
    }

    public async getTusOptions(
        file: File,
        tusOptions: Partial<UploadOptions> = {},
        customOptions: CustomUploadOptions = {},
    ): Promise<UploadOptions> {
        const config = optionsToConfig(this, DEFAULT_UPLOAD_OPTIONS, customOptions);

        // Validation.
        const url = await buildRequestUrl(this, {
            endpointPath: TUS_ENDPOINT,
        });

        file = ensureFileObjectConsistency(file);

        const hasher = blake3.create({});

        const chunkSize = 1024 * 1024;

        let position = 0;

        while (position <= file.size) {
            const chunk = file.slice(position, position + chunkSize);
            ``;
            hasher.update(new Uint8Array(await chunk.arrayBuffer()));
            position += chunkSize;
            customOptions.onHashProgress?.({
                bytes: position,
                total: file.size,
            });
        }

        const b3hash = hasher.digest();

        const filename = new Multihash(
            Buffer.concat([
                Buffer.alloc(1, CID_HASH_TYPES.BLAKE3),
                Buffer.from(b3hash),
            ]),
        ).toBase64Url();

        return {
            endpoint: url,
            metadata: {
                hash: filename,
                filename: filename,
                filetype: file.type,
            },
            headers: config.headers as any,
            onBeforeRequest: function (req: HttpRequest) {
                const xhr = req.getUnderlyingObject();
                xhr.withCredentials = true;
            },
            ...tusOptions,
        };
    }

    /**
     * Uploads a directory to S5-net.
     *
     * @param directory - File objects to upload, indexed by their path strings.
     * @param filename - The name of the directory.
     * @param [customOptions] - Additional settings that can optionally be set.
     * @param [customOptions.endpointPath="/s5/upload/directory"] - The relative URL path of the portal endpoint to contact.
     * @returns - The returned cid.
     * @throws - Will throw if the request is successful but the upload response does not contain a complete response.
     */
    public async uploadDirectory(
        directory: Record<string, File>,
        filename: string,
        customOptions: CustomUploadOptions = {},
    ): Promise<UploadResult> {
        const response = await this.uploadDirectoryRequest(
            directory,
            filename,
            customOptions,
        );

        return {cid: CID.decode(<string>response.cid)};
    }

    /**
     * Makes a request to upload a directory to S5-net.
     *
     * @param directory - File objects to upload, indexed by their path strings.
     * @param filename - The name of the directory.
     * @param [customOptions] - Additional settings that can optionally be set.
     * @returns - The upload response.
     * @throws - Will throw if the input filename is not a string.
     */
    public async uploadDirectoryRequest(
        directory: Record<string, File>,
        filename: string,
        customOptions: CustomUploadOptions = {},
    ): Promise<BasicUploadResponse> {
        const config = optionsToConfig(this, DEFAULT_UPLOAD_OPTIONS, customOptions);

        const formData = new FormData();

        for (const entry in directory) {
            const file = ensureFileObjectConsistency(directory[entry]);
            formData.append(entry, file, entry);
        }

        const params = {} as PostS5UploadDirectoryParams;

        if (customOptions.tryFiles) {
            params.tryFiles = customOptions.tryFiles;
        }
        if (customOptions.errorPages) {
            params.errorPages = customOptions.errorPages;
        }

        params.name = filename;

        /*
            Hack to pass the data right since OpenAPI doesn't support variable file inputs without knowing the names ahead of time.
             */
        config.data = formData;

        return postS5UploadDirectory({}, params, config);
    }

    public async uploadWebapp(
        directory: Record<string, File>,
        customOptions: CustomUploadOptions = {},
    ): Promise<UploadResult> {
        const response = await this.uploadWebappRequest(directory, customOptions);

        return {cid: CID.decode(<string>response.cid)};
    }

    /**
     * Makes a request to upload a directory to S5-net.
     * @param directory - File objects to upload, indexed by their path strings.
     * @param [customOptions] - Additional settings that can optionally be set.
     * @param [customOptions.endpointPath] - The relative URL path of the portal endpoint to contact.
     * @returns - The upload response.
     * @throws - Will throw if the input filename is not a string.
     */
    public async uploadWebappRequest(
        directory: Record<string, File>,
        customOptions: CustomUploadOptions = {},
    ): Promise<BasicUploadResponse> {
        return this.uploadDirectoryRequest(directory, "webapp", customOptions);
    }

    /**
     * Makes a request to upload a small file to S5-net.
     *
     * @param file - The file to upload.
     * @param [customOptions] - Additional settings that can optionally be set.

     * @returns PostS5UploadResult  - The upload response.
     */
    private async uploadSmallFileRequest(
        file: File,
        customOptions: CustomUploadOptions = {},
    ): Promise<PostS5UploadResult> {
        const config = optionsToConfig(this, DEFAULT_UPLOAD_OPTIONS, customOptions);

        file = ensureFileObjectConsistency(file);

        return postS5Upload(
            file,
            config,
        );
    }

    /* istanbul ignore next */
    /**
     * Makes a request to upload a file to S5-net.
     *
     * @param file - The file to upload.
     * @param [customOptions] - Additional settings that can optionally be set.
     * @returns - The upload response.
     */
    private async uploadLargeFileRequest(
        file: File,
        customOptions: CustomUploadOptions = {},
    ): Promise<UploadResult> {
        const p = defer<UploadResult>();

        const options = await this.getTusOptions(
            file,
            {
                onSuccess: async () => {
                    if (!upload.url) {
                        p.reject(new Error("'upload.url' was not set"));
                        return;
                    }

                    p.resolve({cid});
                },
                onError: (error: Error | DetailedError) => {
                    // Return error body rather than entire error.
                    const res = (error as DetailedError).originalResponse;
                    const newError = res
                        ? new Error(res.getBody().trim()) || error
                        : error;
                    p.reject(newError);
                },
            },
            customOptions,
        );
        const cid = CID.fromHash(
            Multihash.fromBase64Url(<string>options.metadata?.hash).fullBytes,
            file.size,
            CID_TYPES.RAW,
        );

        const upload = new Upload(file, options);

        return p.promise;
    }

    public async pin(cid: string, customOptions: CustomPinOptions = {}) {
        const config = optionsToConfig(
            this,
            DEFAULT_PIN_OPTIONS,
            customOptions,
        );

        await postS5PinCid(cid, config);
    }

    public async unpin(cid: string, customOptions: CustomPinOptions = {}) {
        const config = optionsToConfig(
            this,
            DEFAULT_PIN_OPTIONS,
            customOptions,
        );

        await deleteS5DeleteCid(cid, config);
    }

    public async pinStatus(cid: string, customOptions: CustomPinOptions = {}) {
        const config = optionsToConfig(
            this,
            DEFAULT_PIN_OPTIONS,
            customOptions,
        );

        return await getS5PinCidStatus(cid, config);
    }
}
