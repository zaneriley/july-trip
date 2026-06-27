# Changelog

## Unreleased

- Rebuilt around the iMessage group thread (ADR 0007): home is now the Kurobe-vs-
  Atami comparison, and each destination has its own URL (`/kurobe`, `/atami`) with
  its map and places. Tabs removed.
- The comparison shows the easiest way in (fastest time, cheapest fare) rather than
  a worst-case range — so reaching Kurobe reads as the ~2h48 direct shinkansen to
  the town, with the longer alpine-route journeys kept on the destination page.
  Dropped the vague pace/with-a-child/weather cells.
- Added Open Graph link previews generated at build (satori + resvg) from the same
  sourced data — the home preview is the comparison itself; each destination's is
  its photo and figures. The link bubble is the page's first surface in a chat.
- Removed the heart vote and its Cloudflare Worker + KV — reacting happens in the
  thread. Back to a pure static site (ADR 0002 superseded).
- Detail pages use a roomier map-led two-pane layout on desktop.

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
