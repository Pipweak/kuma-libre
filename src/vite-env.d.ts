/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENABLE_APP_PREVIEW?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
