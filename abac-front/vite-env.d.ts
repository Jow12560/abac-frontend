/// <reference types="vite/client" />

// vite-env.d.ts
interface ImportMetaEnv {
    readonly VITE_BACKEND_URL: string;
    readonly VITE_API_KEY: string;
    // add other environment variables here
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
