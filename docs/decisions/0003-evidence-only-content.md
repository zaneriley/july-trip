# 0003 — Evidence-only content

Status: accepted

## Context

A trip-planning page is only useful if its facts are true. It is tempting to let a
language model write evocative descriptions, invent plausible prices, or drop in
stock photos to fill space. All of that produces a page that looks finished and
misleads the people relying on it to make a real decision.

## Decision

Every fact, price, photo, and map must trace to a verifiable source:

- **Photos** — Google Maps user uploads, Wikimedia Commons, or official tourism
  sources, always with a credit.
- **Prices** — Booking.com, Rakuten Travel, JR, or the official attraction site,
  stated in words and dated where it matters.
- **Maps** — real Google Maps place embeds and deep-links to consumer Maps for
  routing and nearby searches, not screenshots or fabricated routes.
- **Descriptions** — written from known facts, with a source link on the card.

No fabricated descriptions, no AI-imagined places, no Lorem Ipsum or placeholder
filler that survives to a commit.

## Consequences

- The page can be trusted at face value.
- Adding content means doing the research first. That is the point.
- A reviewer can check any claim by following its source link.
