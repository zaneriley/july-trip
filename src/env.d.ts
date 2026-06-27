/// <reference types="astro/client" />

interface ImportMetaEnv {
  /**
   * Google Maps key (needs the Maps JavaScript API enabled), restricted by HTTP
   * referrer to the Pages domain. Public by design (it ships to the browser), but
   * kept out of git. Left blank until provided — the map shows a "needs key" note.
   */
  readonly PUBLIC_GOOGLE_MAPS_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
