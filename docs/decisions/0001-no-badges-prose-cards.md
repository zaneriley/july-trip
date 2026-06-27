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
- Filtering/sorting by category is not supported, by design. If that need ever
  arises it gets its own decision record, not a chip bolted onto the card.
- New components must not introduce a badge/chip/eyebrow shape.
