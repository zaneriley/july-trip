# 0005 — Maps: place embed plus a transit deep-link, not a drawn route

Status: accepted

## Context

The page wanted to show "how to get from Shibuya to each place by train" on a map.
The first attempt drew the route with the Google Maps JavaScript API's
`DirectionsService` in transit mode. On the live site every route map failed with
"map could not load".

The cause isn't a bug or a misconfigured key. **Google's developer map APIs do not
provide transit directions for Japan** — the Directions API, the newer Routes API,
and the Maps Embed API all share the same backend, and Japanese transit operators
haven't licensed their schedule data to it. A transit route request for a Japanese
origin/destination returns `ZERO_RESULTS`, which throws, which showed the error.
This is a long-standing, deliberate exclusion, confirmed in Google's own FAQ. No
key change fixes it. (The consumer Google Maps app/site *does* have full Japan rail
data — only the developer APIs don't.)

Driving or walking directions do work in Japan, but a "drive to Kurobe Dam" line is
actively misleading for people taking the train, and its time and distance would be
wrong for the real journey.

## Decision

Don't draw the route. For each place:

1. Show an inline location map with the **Maps Embed API** — a plain lazy-loading
   iframe, which also survives weak mountain signal better than a scripted map. This
   is the only part that uses the API key, so enable just "Maps Embed API".
2. **Deep-link the actual routing to the Google Maps app** with a Maps URL
   (`/maps/dir/?api=1&...&travelmode=transit`). On a phone this opens Google Maps,
   where Japan transit works correctly. The link needs no API key. A second link
   (`/maps/search/?api=1&query=coffee near …`) covers the "coffee nearby" case.

## Consequences

- The route and coffee links work even before any key is set, and even on a key
  that only has the Embed API enabled — fewer moving parts to break.
- We never render a wrong-mode route. The inline map honestly shows *where* the
  place is; the authoritative routing is delegated to Google Maps. That keeps the
  page within the evidence-only spirit (ADR 0003).
- The earlier `DirectionsService` / `PlacesService` / `Geocoder` code is gone, so
  the key no longer needs Directions, Places, or Geocoding enabled.
