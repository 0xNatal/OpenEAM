// Ambient type declarations for the web app: pulls in Vite's client types and
// declares the typed shape of our import.meta.env variables.
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
