# AGENTS.md — july-trip

The contract for working in this repo. Read it before changing anything.

## What this repo is

A single-page, phone-first site that offers two trip destinations (Kurobe and
Atami) as tabs, with anonymous shared heart reactions, inline place maps, and
Google Maps deep-links for train directions from Shibuya. Astro static site + a
Cloudflare Worker (KV) for the hearts. See
`README.md` for the full picture and `docs/decisions/` for the locked decisions.

## Acceptance gates — non-negotiable

These are enforced in CSS and component shapes, not left to memory. A change that
breaks one of them does not merge.

**Design rules** (see ADR 0001):
- No all-caps anywhere — sentence case only. The `uppercase` Tailwind utility is
  neutralised in `src/styles/global.css`; don't route around it.
- No eyebrow headers (small all-caps labels above a title).
- No badges, chips, tags, pills, or labels. `Card` has no slot for a category or
  tag — keep it that way. Don't add a badge/chip/eyebrow component.

**Content rules** (see ADR 0003 and ADR 0004):
- Evidence-only. Every fact, price, photo, and map traces to a real source
  (Google Maps user uploads, Wikimedia Commons, official tourism sites,
  Booking.com / Rakuten / JR / official attraction pages).
- No fabricated descriptions, no AI-imagined places, no Lorem Ipsum that survives
  to a commit. A figure you can't confirm at a first-party source is marked
  `unverified` in the data and shown with its caveat — never presented as solid.
- Trip content is a graph under `src/data` (schema in `src/content.config.ts`):
  sources, destinations, places, journeys. The page renders from it and holds no
  hardcoded facts. **Edit the data, not the markup.** You cannot add a journey or
  place without naming its sources — that's the rule doing its job.

## Conventions

- Comments are plain English and explain *why*, not *what*. No jargon.
- Solo dev, no branches — straight to `main`.
- Secrets never get committed. The Maps key is public-by-design but injected at
  build time via `PUBLIC_GOOGLE_MAPS_API_KEY`, not hard-coded.

## Before pushing

Build the way CI will, in a clean container:

```
docker run --rm -v "$PWD":/app -w /app node:22.12.0 sh -c "npm install && npm run build && npx astro check"
```

All green before pushing.
