# AGENTS.md — july-trip

The contract for working in this repo. Read it before changing anything.

## What this repo is

A phone-first site for deciding between two trip destinations (Kurobe and Atami).
The deciding happens in the group's iMessage thread; the site is the shared
evidence linked there. Home is the two options side by side; each destination has
its own URL with a Google Maps planning map (categorized pins, drawn routes, a
filter) beside prose place cards. Pure static Astro — no server, no accounts. The
link previews (`src/pages/og/`) are a first-class surface. See `README.md` and
`docs/decisions/` (especially ADR 0007).

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
  sources, destinations, places, journeys, pois, paths. The page renders from it
  and holds no hardcoded facts. **Edit the data, not the markup.** You cannot add a
  journey, place, or map point without naming its source — that's the rule working.
- Categories (on `pois`) drive map pin colour and the map's show/hide filter only.
  Never a chip/label on a card (ADR 0001, amended).

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
