# Changelog

## Unreleased

- Bootstrap the project: Astro static site (TypeScript strict, Tailwind),
  a Cloudflare Worker + KV for anonymous heart counts, and a lazy-loading
  Google Maps component for routes from Shibuya and coffee stops.
- Two-tab page (Kurobe / Atami) with one clearly-marked demo card per
  destination. No real trip content yet — demo cards are placeholders.
- Design rules enforced in CSS and component shapes: no all-caps, no eyebrow
  headers, no badges/chips/tags.
- GitHub Actions deploy to Cloudflare Pages + Worker on push to `main`.
