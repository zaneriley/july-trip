# 0007 — Built for the iMessage thread, not as the decision app

Status: accepted (supersedes ADR 0002)

## Context

The four people planning this trip coordinate in an iMessage group chat. That is
where the deciding actually happens — someone pastes a link, everyone tapbacks or
replies, and the choice gets made in the thread. The earlier design tried to be
the decision tool itself (tabs to switch destinations, an anonymous heart vote).
That duplicated what the chat already does, and the tabs even prevented the one
thing the headline asks for: seeing Kurobe and Atami side by side.

## Decision

Treat the page as the **shared evidence the chat references**, not the place the
decision is made:

- **Home is the comparison.** Kurobe and Atami side by side — the figures (time and
  cost from Shibuya, pulled from the journey data) and the feel (pace, with a
  three-year-old, July weather). No tabs.
- **Each destination is its own URL** (`/kurobe`, `/atami`) holding its map and
  places, so it can be linked and previewed on its own.
- **The link preview is a first-class surface.** When a link is pasted into the
  thread, most people read the unfurled bubble without tapping through — so every
  route emits Open Graph tags and a generated preview image (`src/pages/og/`,
  rendered at build with satori + resvg from the same sourced data). The home
  image *is* the comparison; each destination image carries its photo and figures.
- **The hearts vote is removed**, along with its Worker and KV namespace. Reacting
  happens in the chat. The site goes back to pure static.

## Consequences

- No accounts, no server, no KV — a plain static site again, simpler to reason
  about and nothing to break on weak signal. (The `HEARTS` KV namespace and the
  now-unused `PUBLIC_HEART_API_URL` secret can be deleted in Cloudflare/GitHub.)
- The preview images must stay tied to the data; they're generated from the same
  `comparisonColumns()` the page uses, so they can't drift (ADR 0003).
- Next, still open: deep links and previews for individual places, an iOS
  share-sheet button, and Apple Maps / `.ics` links — the rest of the
  link-native plan.
