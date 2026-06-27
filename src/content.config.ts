import { defineCollection, reference } from 'astro:content';
import { z } from 'zod';
import { glob, file } from 'astro/loaders';

/*
  The content graph. Four node types, linked by reference() — those references
  are the graph edges, so the whole thing is queryable without a separate graph
  engine:

      journey  --to-->  place  --in-->  destination
         \                \                /
          \________ cites _\______ cites _/
                           v
                        source

  Every fact that reaches the page traces back to a `source`, and every source
  records how trustworthy it is. This is the evidence-only rule (ADR 0003) made
  structural: you cannot author a journey or a place without naming where its
  facts came from, and a fact we could not confirm at first hand is marked
  `unverified` rather than quietly presented as solid.

  Adding more to the graph later — attractions, lodging, coffee stops — means
  adding node types that reference the same `sources` spine. Nothing here has to
  be reshaped for the graph to grow.
*/

// A piece of evidence. The provenance spine: everything else points here.
const sources = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/data/sources' }),
  schema: z.object({
    title: z.string(),
    publisher: z.string(),
    url: z.url(),
    // What kind of source this is, so we can weigh it. Not shown as a chip —
    // it drives how much trust a fact carries, and reads as prose when relevant.
    type: z.enum([
      'official', // the operator or government body itself
      'tourism-board',
      'operator', // a transport operator's own page
      'aggregator', // fare/timetable aggregator, not first-party
      'wikimedia',
      'gmaps-user-upload',
    ]),
    // Provenance is only meaningful with a date — prices and timetables drift.
    accessed: z.coerce.date(),
    reliability: z.enum(['primary', 'secondary', 'unverified']),
    note: z.string().optional(),
  }),
});

// A fare or duration figure, written so it can carry its own source. Used inside
// a journey leg, because the research pulled different numbers from different
// pages — the time from one source, the fare from another.
const figure = z.object({
  // Yen, or minutes — context makes it clear which on the field that holds it.
  value: z.number(),
  sources: z.array(reference('sources')).default([]),
});

// One destination option (Kurobe or Atami). Prose lives in the markdown body.
const destinations = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/destinations' }),
  schema: z.object({
    name: z.string(),
    region: z.string(),
    // Display order on the page. No preference is implied by the order.
    order: z.number().default(0),
    sources: z.array(reference('sources')).default([]),
  }),
});

// A specific thing within a destination — the dam/alpine route, an onsen town.
// "Kurobe" holds two of these; "Atami" holds one for now. Prose in the body.
const places = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/places' }),
  schema: z.object({
    name: z.string(),
    destination: reference('destinations'),
    // One real photo, self-hosted under /photos, carrying its own licence and a
    // link back to where it came from — provenance for the image, same as for a
    // fact (ADR 0003). Only license-confirmed images go here.
    image: z
      .object({
        src: z.string(), // path under public/, e.g. /photos/kurobe-dam.jpg
        alt: z.string(),
        credit: z.string(), // the attribution the licence requires
        creditUrl: z.url(), // the source file page, so the credit is checkable
        license: z.string(), // e.g. "CC BY 3.0"
      })
      .optional(),
    sources: z.array(reference('sources')).default([]),
  }),
});

// One leg of a journey: a single train, bus, or ropeway ride.
const leg = z.object({
  mode: z.enum(['walk', 'local-train', 'shinkansen', 'limited-express', 'bus', 'cable-car', 'ropeway']),
  // The named service where it has one, e.g. "Kodama", "Hakutaka", "Odoriko".
  service: z.string().optional(),
  from: z.string(),
  to: z.string(),
  durationMin: figure.optional(),
  fareYen: figure.optional(),
});

// A way to get from an origin to a place, carrying its own provenance and an
// honest verification status. Multiple journeys per place are expected.
const journeys = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/data/journeys' }),
  schema: z.object({
    // Where the trip starts. The whole site assumes Shibuya, but it's explicit
    // here so a future origin doesn't require a schema change.
    from: z.string().default('Shibuya'),
    to: reference('places'),
    // A short sentence-case label, e.g. "by shinkansen (Kodama)".
    label: z.string(),
    legs: z.array(leg),
    totalDurationMin: figure.optional(),
    totalFareYen: figure.optional(),
    // A plain-language note, e.g. about reserved seating with a young child.
    seatNote: z.string().optional(),
    // How sure we are of the figures, end to end. Drives the prose caveat shown
    // on the card — never a badge.
    verified: z.enum(['verified', 'partially-verified', 'unverified']),
    // What specifically is shaky, in plain words. Shown when not fully verified.
    caveat: z.string().optional(),
    sources: z.array(reference('sources')).default([]),
  }),
});

// The categories a map point can have. These drive pin colour and the show/hide
// filter on the map — and ONLY that. They are never rendered as a chip or label
// on a card; a category is a way to filter the map, not a thing that answers a
// question on its own (see ADR 0001, amended, and ADR 0006).
export const POI_CATEGORIES = [
  'train-stop',
  'sightseeing',
  'viewpoint',
  'onsen',
  'coffee', // third-wave / specialty
  'kissaten', // traditional Showa-era coffee houses
  'neighborhood',
] as const;

// A single map point. Many per destination. Provenance is inline here rather than
// a reference to the `sources` spine: these are mostly one-off Wikipedia/Tabelog
// citations, not figures reused across the graph, so a link + type per point is
// the honest, low-overhead way to keep the evidence-only rule (ADR 0003).
const pois = defineCollection({
  loader: file('./src/data/pois.yaml'),
  schema: z.object({
    name: z.string(),
    category: z.enum(POI_CATEGORIES),
    lat: z.number(),
    lng: z.number(),
    note: z.string(),
    destination: reference('destinations'),
    source: z.object({
      url: z.url(),
      type: z.enum(['official', 'tourism-board', 'wikimedia', 'wikidata', 'google-maps', 'tabelog', 'osm']),
    }),
    // True when the coordinate is approximate (e.g. derived from a street address
    // rather than a published lat/long). Shown honestly, never hidden.
    coordsUnverified: z.boolean().default(false),
  }),
});

// An author-curated route drawn on the map as a line through an ordered set of
// points — "the alpine route crossing", "a day on foot in central Atami". It is a
// suggested ordering of real, sourced points, not a claimed transit timetable.
const paths = defineCollection({
  loader: file('./src/data/paths.yaml'),
  schema: z.object({
    label: z.string(),
    destination: reference('destinations'),
    // Ordered poi ids. The map looks each up and draws a line through them.
    stops: z.array(z.string()),
  }),
});

export const collections = { sources, destinations, places, journeys, pois, paths };
