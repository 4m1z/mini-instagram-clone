/// <reference types="vite/client" />

type ImportMetaEnv = {
  /** Optional absolute base URL of the REST API. Empty means same origin. */
  readonly VITE_API_BASE_URL?: string;
  /** Optional absolute WebSocket origin, e.g. ws://localhost:8080. */
  readonly VITE_WS_BASE_URL?: string;
};

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
