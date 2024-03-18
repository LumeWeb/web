import Uppy, {BasePlugin, DefaultPluginOptions} from '@uppy/core';
import {PROTOCOL_S5, Sdk} from "@lumeweb/portal-sdk";
import {S5Client} from "@lumeweb/s5-js";
import {AxiosProgressEvent} from "axios";


interface UppyFileUploadOptions extends DefaultPluginOptions {
    sdk: Sdk;
}

export default class UppyFileUpload extends BasePlugin {
    private _sdk: Sdk;

    constructor(uppy: Uppy, opts?: UppyFileUploadOptions) {
        super(uppy, opts);
        this.id = opts?.id || 'file-upload';
        this._sdk = opts?.sdk as Sdk;
    }

    install() {
        this.uppy.addUploader(this.handleUpload);
    }

    private async handleUpload(fileIDs: string[]) {
        for (const fileID of fileIDs) {
            const file = this.uppy.getFile(fileID);
            if (!file) {
                continue;
            }

            // @ts-ignore
            if (file.uploader !== 'file') {
                continue;
            }

            const uploadLimit = await this._sdk.account().uploadLimit();

            let data = file.data;

            if (file.data instanceof Blob) {
                data = new File([data], file.name, {type: file.type});
            }

            try {
                await this._sdk.protocols().get<S5Client>(PROTOCOL_S5).getSdk().uploadFile(data as File, {
                    largeFileSize: uploadLimit,
                    onUploadProgress: (progressEvent: AxiosProgressEvent) => {
                        this.uppy.emit('upload-progress', this.uppy.getFile(file.id), {
                            uploader: this,
                            bytesUploaded: progressEvent.loaded,
                            bytesTotal: progressEvent.total,
                        })
                    }
                });

                this.uppy.emit('upload-success', file, {uploadURL: null});
            } catch (err) {
                this.uppy.emit('upload-error', file, err);
            }
        }
    }
}
