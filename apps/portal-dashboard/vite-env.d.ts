/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_PORTAL_API_URL: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
