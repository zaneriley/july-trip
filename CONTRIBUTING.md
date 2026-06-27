# Contributing

Solo project, no branches — work straight on `main`. Keep these in mind:

## The design rules are not negotiable

- No all-caps anywhere. Sentence case for every heading, button, and label.
  Tailwind's `uppercase` utility is disabled in `src/styles/global.css`; don't
  reach around it.
- No eyebrow headers (small all-caps labels above a title).
- No badges, chips, tags, pills, or labels. A card is prose. The `Card`
  component has no slot for a category or tag — keep it that way.

## The content rules are not negotiable

Every fact, price, photo, and map must have a real, verifiable source. No
fabricated descriptions, no AI-imagined places, no Lorem Ipsum that survives to a
commit.

## Code comments

Plain English. Explain *why*, not *what*. No jargon, no clipped shorthand.

## Before you push

Build it the way CI will, in a clean container:

```
docker run --rm -v "$PWD":/app -w /app node:22.12.0 sh -c "npm install && npm run build && npx astro check"
```

All green before pushing.
