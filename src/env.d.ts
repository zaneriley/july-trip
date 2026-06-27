/// <reference types="astro/client" />

interface ImportMetaEnv {
  /**
   * Google Maps Embed API key, restricted by HTTP referrer to the Pages domain.
   * Public by design (it ships to the browser), but kept out of git. Left blank
   * until provided — components show a "needs API key" placeholder.
   */
  readonly PUBLIC_GOOGLE_MAPS_API_KEY: string;
  /**
   * Base URL of the deployed hearts Worker, e.g.
   * https://july-trip-hearts.<account>.workers.dev
   * Left blank until the Worker is deployed — hearts degrade to read-only zero.
   */
  readonly PUBLIC_HEART_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
