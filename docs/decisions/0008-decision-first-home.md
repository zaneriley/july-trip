# 0008 — The home is a comparison, not a browse surface

Status: accepted (revisits the "one giant map on the home" direction)

## Context

The group is at the "which city do we pick?" stage — Kurobe or Atami, for a fixed
July 3–5 weekend. An earlier iteration put a single map of *both* cities (~58 mixed
pins, the two clusters ~250 km apart) and a flat grid of ~44 photo tiles mixing
sights, food, and cafes from both places on the home.

A peer-review + ui-critique pass found that this is browse-mode content served to a
decide-mode user. Two failures stood out:

- **The merged map implies the wrong task.** Two options 250 km apart on one map
  reads as a single itinerary you tour, not an either/or you choose between. The
  one relationship between the two — "pick one" — is the one a shared map can't show.
- **The flat mixed grid dissolves the A/B boundary** the decision depends on, and
  offloads the comparison onto the reader's memory.

People at a two-option stage compare attribute-to-attribute on shared rows
(structural-alignment theory), and for a weekend with a three-year-old the deciding
axes are travel effort, kid-suitability, weather/date fit, then character and cost.

## Decision

Split the surfaces by decision state.

**Home = compare (pre-choice).** Two option columns, Kurobe and Atami side by side,
each with a hero photo, the character (tagline), the aligned numbers (getting there,
cost — same row position so you read across), a few signature shots, and that city's
sourced "for July 3–5" facts. A shared "good to know for both" strip. Two "look
closer →" links. No interactive map, no full photo grid, no restaurant lists.

**Per-city pages = explore (post-choice).** `/kurobe` and `/atami` hold that city's
own map (its pins only, finally legible at one zoom), its place cards and journeys,
its photo gallery grouped by category, its eating-and-drinking list, and its date
facts. This is the depth, correctly gated behind a lean.

## Consequences

- The data was already right (`comparisonColumns()`, the sourced graph) — this is a
  reorganization, not new features: three modules moved from the home down to the
  city pages, and the comparison promoted up.
- The both-cities map is gone; each city's map lives where it's legible.
- Reverses the earlier "single giant map on the home" request, which didn't serve
  the decision the home exists for.
