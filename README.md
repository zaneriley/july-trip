# July trip — Kurobe or Atami?

## What this is

A phone-first site for deciding where four of us (plus a three-year-old) go for
the July 3–5 long weekend — Kurobe or Atami. The deciding happens in our iMessage
group thread; this site is the shared evidence we link to. Home is the two options
side by side (time and cost from Shibuya, and the feel of each); each destination
has its own page with a map and the places. The tone is calm and plain on purpose.

Because the planning lives in a chat, the **link preview matters as much as the
page** — paste a link and the unfurled bubble carries the comparison itself. See
`docs/decisions/0007-link-native-imessage.md`.

## How it's built

- **Astro** static site, TypeScript (strict), **Tailwind** for utility CSS. Pure
  static — no server, no accounts.
- **Cloudflare Pages** hosts the build.
- **Open Graph link previews** generated at build (satori + resvg, `src/pages/og/`)
  from the same sourced data, so a pasted link unfurls into a useful bubble.
- **Google Maps JavaScript API** powers a per-destination planning map: categorized
  pins, author-drawn routes, and a show/hide filter. Per-point train directions
  hand off to the Google Maps app (the only place Japan transit routing works).

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
places, no placeholder filler that survives to commit. This is enforced
structurally: trip content is a graph (see below) where every fact must name its
source, and a figure we couldn't confirm at first hand is shown marked
"unverified", not dressed up as solid.

## Content model

Trip content lives in `src/data` as a small graph of Astro content collections,
defined in `src/content.config.ts`:

- `sources` — citations (url, accessed date, type, reliability). The spine.
- `destinations` — Kurobe, Atami (prose in the markdown body).
- `places` — a thing within a destination (alpine route, onsen town).
- `journeys` — a way to get from Shibuya to a place, with per-leg figures.
- `pois` — categorized map points with real coordinates and an inline source.
- `paths` — author-drawn routes: an ordered list of poi ids drawn on the map.

References between them are the graph edges. The page renders from the graph and
holds no hardcoded trip facts — to add or correct content, edit the data, not the
markup. Rationale in `docs/decisions/0004-provenance-content-graph.md` (the graph)
and `0006-planning-map.md` (the map).

## Local dev

```
cp .env.example .env      # optional: add a Maps key for the planning map
npm install
npm run dev
```

## Deploy

Automatic on push to `main` (see `.github/workflows/deploy.yml`), once these repo
secrets are set: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, and
`GOOGLE_MAPS_API_KEY`. The workflow injects `GOOGLE_MAPS_API_KEY` into the build as
`PUBLIC_GOOGLE_MAPS_API_KEY`. It's a pure static deploy — no Worker, no KV.

## Maps and the Maps key

The planning map uses the **Maps JavaScript API** to plot our own categorized pins
and draw our own routes. It does **not** ask Google to route transit — Google's
developer APIs can't route transit in Japan at all (a licensing exclusion). For
actual train directions, each pin deep-links to the Google Maps app, where Japan
transit works. See `docs/decisions/0006-planning-map.md` and `0005-…`.

So **enable the "Maps JavaScript API"** on the key. The key is **public by design**
— Astro bakes `PUBLIC_*` variables into the client bundle, and a Maps key is meant
to ship to the browser. Secrecy is **not** the security boundary.

The real boundary is the **HTTP-referrer restriction** you set in the Google Cloud
console: limit the key to `*.pages.dev` and `localhost` so it only works from this
site. Holding it as a repo secret only keeps the value out of git history; the
referrer rule is what actually protects it. Left unset, the map shows a note.
