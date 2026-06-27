# 0001 — Cards are prose, not chip collections

Status: accepted

## Context

The site presents places to consider for a trip. The easy default in modern web
UI is to decorate each item with badges, tags, category chips, and coloured pills.
That style turns content into a form to be scanned and filtered, and it shouts.

## Decision

Cards carry prose, not chips. The `Card` component has exactly: a sentence-case
title, a real multi-line description, an optional single photo with credit, an
optional price written as a sentence, and an optional source link. There is no
slot — no prop, no data attribute — for a category, tag, type, badge, label, or
chip. Related rules: no all-caps anywhere, and no eyebrow headers. These are
enforced in CSS (`src/styles/global.css` neutralises the `uppercase` utility) and
by the shape of the components, so they can't be quietly worked around.

## Consequences

- A reader gets sentences, not a dashboard. The page reads like a person wrote it.
- New components must not introduce a badge/chip/eyebrow shape on a card.

## Amendment (2026-06-27): categories on the map, not on cards

The planning map (ADR 0006) needs categories — train stops, sightseeing, coffee,
and so on — to colour its pins and drive a show/hide filter. That is allowed,
because there a category is a way to *filter the map*, not a label sitting on a
card pretending to answer a question. The boundary, restated plainly:

- Categories may exist as data on a map point and may appear as a colour swatch
  and word in the map's filter control.
- Categories must never appear as a chip, tag, pill, or data-label on a card. The
  `Card` component still has no category slot, and that stays true.
