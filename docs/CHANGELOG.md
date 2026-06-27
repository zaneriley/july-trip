# Changelog

## Unreleased

- Bootstrap the project: Astro static site (TypeScript strict, Tailwind),
  a Cloudflare Worker + KV for anonymous heart counts, and a lazy-loading
  Google Maps component for routes from Shibuya and coffee stops.
- Two-tab page (Kurobe / Atami) rendered from a content graph.
- Design rules enforced in CSS and component shapes: no all-caps, no eyebrow
  headers, no badges/chips/tags.
- GitHub Actions deploy to Cloudflare Pages + Worker on push to `main`.
- Content is now a provenance-carrying graph (`src/data`, schema in
  `src/content.config.ts`): sources, destinations, places, journeys, linked by
  references. The page reads the graph and holds no hardcoded trip facts. See
  ADR 0004.
- Seeded real, sourced shinkansen options to both destinations — Kurobe modelled
  as the Tateyama Kurobe alpine route plus Unazuki Onsen; Atami with Kodama,
  Odoriko, and local-train options. Figures that couldn't be confirmed at a
  first-party source are marked `unverified` and shown with their caveat.
- Removed the page's intro paragraph and the per-destination intro prose.
- Added a real, self-hosted, license-confirmed photo to each place card
  (Wikimedia Commons), with the attribution linking back to its source file.
- Replaced the broken transit route maps: Google's developer APIs don't route
  transit in Japan, so each place now shows a Maps Embed location map plus
  deep-links to the Google Maps app for train directions and coffee — which need
  no key and where Japan transit actually works. See ADR 0005.
- Added a per-destination planning map (Google Maps JavaScript API): real,
  sourced points categorized as train stops, sightseeing, viewpoints, onsen,
  third-wave coffee, kissaten, and neighborhoods; author-drawn routes; and a
  show/hide category filter. Map-left / cards-right on desktop, stacked on a
  phone. Categories drive the map only, never a chip on a card (ADR 0001 amended;
  see ADR 0006). New `pois` and `paths` collections hold the points and routes.
