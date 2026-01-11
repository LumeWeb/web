export interface LbryUploadResponse {
  upload_hash: string;
}

export interface LbryError {
  success: false;
  error: string;
}

export interface LbryServiceConfig {
  authToken?: string;
}