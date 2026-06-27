# July trip — Kurobe or Atami?

## What this is

A one-page, phone-first site for picking where five of us (plus a three-year-old)
go for the July 3–5 long weekend. It lays out two destinations — Kurobe and Atami —
side by side as tabs. Anyone can tap a heart on the things they'd want to do; the
counts are shared and anonymous, so the group can see what everyone's drawn to
without a poll, a sign-up, or a group chat thread. The tone is calm and plain on
purpose: it's a quiet way to decide together, not a brochure.

## How it's built

- **Astro** static site, TypeScript (strict), **Tailwind** for utility CSS.
- **Cloudflare Pages** hosts the static build.
- A small **Cloudflare Worker** backed by **KV** holds the anonymous heart counts.
- **Google Maps** JavaScript + Places API draws routes from Shibuya and finds
  coffee stops along the way. Maps lazy-load only when scrolled into view.

## Design rules

These are enforced in CSS and component shapes, not left to memory:

- No all-caps anywhere (no uppercase headers, no uppercase buttons, no "go" —
  sentence case only).
- No eyebrow headers (the small all-caps labels above titles).
- No badges, labels, chips, tags — content is prose, not chip-shaped.

## Content rules

Evidence-only. Real photos (Google Maps user uploads, Wikimedia Commons, official
tourism sources), real prices (Booking.com / Rakuten / JR / official attraction
sites), real maps, real coffee places. No fabricated descriptions, no AI-imagined
places, no placeholder filler that survives to commit. The scaffold ships one
clearly-marked demo card per destination — replace them with real content.

## Local dev

```
cp .env.example .env      # optional: add a Maps key and the Worker URL
npm install
npm run dev
```

## Deploy

Automatic on push to `main` (see `.github/workflows/deploy.yml`), once these repo
secrets are set: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `GOOGLE_MAPS_API_KEY`,
and optionally `PUBLIC_HEART_API_URL`. The workflow injects `GOOGLE_MAPS_API_KEY`
into the build as `PUBLIC_GOOGLE_MAPS_API_KEY`. The Worker needs a KV namespace —
create it once and paste the id into `worker/wrangler.toml`.

## A note on the Maps key

The Google Maps key is **public by design** — Astro bakes `PUBLIC_*` variables
into the client bundle, and that's expected for the Maps JavaScript API. Its key
is meant to ship to the browser. Secrecy is **not** the security boundary here.

The real boundary is the **HTTP-referrer restriction** you set in the Google Cloud
console: limit the key to `*.pages.dev` and `localhost` so it only works from this
site. Without that restriction a leaked key could be used anywhere and run up your
quota — so set it before going live. Holding the key as a repo secret only keeps
the value out of git history; the referrer rule is what actually protects it.
