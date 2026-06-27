// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// Static site. The hearts state lives in a separate Cloudflare Worker (see worker/),
// so Astro stays a plain static build with no server adapter.
// https://astro.build/config
export default defineConfig({
  // Set this to the real Pages URL once the project is created in Cloudflare.
  // It only affects absolute-URL generation (sitemap, canonical tags), not the build.
  site: 'https://july-trip.pages.dev',
  vite: {
    plugins: [tailwindcss()],
  },
});
