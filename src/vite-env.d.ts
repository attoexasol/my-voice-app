/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: "https://yfzbclhcmadxyklckngi.supabase.co";
  readonly VITE_SUPABASE_ANON_KEY: "7a1bae2f3466eb2d9c72ccd1cd25850a5e8793c3629e43bdc025dd541ede5af3";
  readonly SUPABASE_SERVICE_ROLE_KEY: "dfbf9195efb25a5c226b9f06368868430a3e9be36170b95d7fc87e8c576514dc";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
