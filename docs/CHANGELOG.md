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
