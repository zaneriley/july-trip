# 0004 — Content is a provenance-carrying graph

Status: accepted

## Context

The page started with trip facts written directly into the markup. That doesn't
scale to the goal: gather more information over time (transit options, lodging,
attractions, coffee stops) and let it enrich the page, while honouring the
evidence-only rule (ADR 0003) — every fact traceable to a real source, and facts
we can't confirm marked as such rather than presented as solid.

Hardcoded prose can't do that. There's nowhere to attach a source to a number,
nowhere to record how verified it is, and no way to relate one fact to another.

## Decision

Trip content lives in Astro content collections under `src/data`, defined in
`src/content.config.ts`, as a small graph of four node types:

- **`sources`** — the provenance spine. Each is a real citation with a `url`, an
  `accessed` date, a `type` (official / aggregator / …), and a `reliability`
  (primary / secondary / unverified).
- **`destinations`** — Kurobe, Atami. Prose in the markdown body.
- **`places`** — a thing within a destination (the alpine route, an onsen town).
- **`journeys`** — a way to get from an origin to a place, with per-leg figures.

The edges are `reference()` calls: a journey points to its place, a place to its
destination, and everything to its sources. That makes the data a queryable
graph without any separate graph engine. Provenance is attached per entry and
per leg: a journey carries a `sources[]` list and a `verified` status, and each
fare or duration can cite its own source — because the research genuinely pulled
the time from one page and the fare from another.

The page renders entirely from this graph (`src/pages/index.astro` reads the
collections; it holds no trip facts). To add or correct content, edit the data.

## Consequences

- Adding a new kind of content (lodging, attractions) is a new node type that
  references the same `sources` spine — no reshaping of what exists.
- Every figure on the page links back to where it came from, and an unconfirmed
  figure says so in plain words (never a coloured badge — ADR 0001).
- There is a schema to satisfy: you cannot add a journey or place without naming
  its sources. That friction is the evidence-only rule doing its job.
- If a real graph store is ever wanted, the collections can be emitted as JSON-LD
  or triples; nothing here forecloses that.
