# 0006 — An interactive planning map per destination

Status: accepted (revisits ADR 0005)

## Context

The page grew from "decide between two destinations" into "plan around each
destination". The ask: a map showing categorized points (train stops,
sightseeing, onsen, third-wave coffee, kissaten, neighborhoods, viewpoints) with
the routes drawn between them, so the group can see what's where and picture a day.

ADR 0005 had dropped the Google Maps JavaScript API in favour of the Embed API
plus deep-links, because Google's developer APIs can't route transit in Japan.
That reason still holds — but a map with our own categorized pins and our own
drawn lines doesn't need transit routing. So the JS API comes back for this, used
only to plot points and draw polylines, never to route.

## Decision

Each destination has a `DestinationMap` (Google Maps JavaScript API):

- **Points** come from the `pois` collection (`src/data/pois.yaml`) — real, sourced
  places with coordinates, each tagged with one category. Pins are coloured by
  category.
- **Routes** come from the `paths` collection (`src/data/paths.yaml`) — author-
  curated orderings of points, drawn as dashed lines. They suggest a sequence,
  they don't claim a timetable.
- **A filter** lets you show/hide categories. This is the only place categories
  surface in the UI (ADR 0001, amended) — a colour swatch and a word per toggle,
  never a chip on a card.
- **Per-point routing** still hands off to the Google Maps app via a transit
  deep-link in each pin's info window, because that's the only place Japan transit
  routing works.

Layout: map on the left, place cards on the right on desktop (the map stays put
while the cards scroll); stacked, map first, on a phone.

The key now needs the **Maps JavaScript API** enabled (the Embed-only setup from
ADR 0005 is superseded). The map degrades to a note if the key is absent.

## Consequences

- The map needs real coordinates and a real source per point — evidence-only
  (ADR 0003) extended to map data. Approximate coordinates are marked
  `coordsUnverified` and shown honestly ("approximate location").
- Categories are now first-class *map* data without becoming card chips.
- The per-place Embed iframe from ADR 0005 is removed; its useful part (the
  transit deep-link) lives on in each map pin.
