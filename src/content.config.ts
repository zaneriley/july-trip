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
    // A one-line "what it is", for the comparison and the link preview.
    tagline: z.string(),
    // Two more comparison dimensions, one specific line each, so the home can put
    // the same rows side by side. Kept concrete (names real things), not vague.
    kidNote: z.string(),
    foodNote: z.string(),
    // The destination's hero photo (a /photos path), reused in the comparison and
    // the generated link-preview image.
    heroImage: z.string(),
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
  'food', // restaurants, seafood houses, the food-walking arcade
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
    // How you get there from the base station — the walkability chip on cards/pins
    // ("5 min walk" / "needs a train"). Optional; set where it's known.
    accessFromStation: z.string().optional(),
    // The coarse way you reach it from the base station — used to band the map's
    // tile list into "on foot" vs "needs a train/bus/car/ferry". Set on every point.
    reach: z.enum(['walk', 'train', 'bus', 'car', 'ferry']).optional(),
    // Scannable restaurant metadata, surfaced as chips instead of buried in the
    // note. All optional; set on food points where a source confirms them.
    rating: z.string().optional(), // Tabelog score, e.g. "3.69"
    priceBand: z.string().optional(), // short band, e.g. "¥1–2k"
    closedDay: z.string().optional(), // "Tue", "Sun & Mon", or "none" for open-daily
    reservation: z.string().optional(), // "reserve", "book ahead", "walk-in", "queues"
    source: z.object({
      url: z.url(),
      type: z.enum(['official', 'tourism-board', 'wikimedia', 'wikidata', 'google-maps', 'tabelog', 'osm', 'blog']),
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

// Real, license-confirmed photos. `subject` ties a photo to the place/poi/route
// it depicts, so a tile or card can pull every photo of its subject. Provenance
// (credit + link + licence) travels with each photo (ADR 0003).
const photos = defineCollection({
  loader: file('./src/data/photos.yaml'),
  schema: z.object({
    subject: z.string(),
    src: z.string(),
    alt: z.string(),
    credit: z.string(),
    creditUrl: z.url(),
    license: z.string(),
  }),
});

// Decision facts for the trip dates — the operating, seasonal, and weather notes
// that bear on choosing. Each is a sourced statement (not editorial), attributed
// to the page it came from, so the "good to know" section stays evidence-only.
const notes = defineCollection({
  loader: file('./src/data/notes.yaml'),
  schema: z.object({
    // Which option it bears on: kurobe, atami, or both.
    destination: z.enum(['kurobe', 'atami', 'both']),
    text: z.string(),
    source: z.object({ label: z.string(), url: z.url() }),
    // Order within the section; lower first.
    order: z.number().default(0),
  }),
});

// Things to do with a three-year-old, per city — a sourced collection, including
// honest "caution" items (a long mountain day is no place for a toddler).
const kids = defineCollection({
  loader: file('./src/data/kids.yaml'),
  schema: z.object({
    destination: reference('destinations'),
    name: z.string(),
    note: z.string(),
    fit: z.enum(['good', 'caution']).default('good'),
    order: z.number().default(0),
    source: z.object({ label: z.string(), url: z.url() }),
  }),
});

// The anticipated weather for the dates, per city — a few labelled rows, each
// with its source, so it reads as a block, not a paragraph.
const weather = defineCollection({
  loader: file('./src/data/weather.yaml'),
  schema: z.object({
    destination: reference('destinations'),
    headline: z.string(),
    // A real short-range forecast for the trip dates — optional, and dated so it
    // reads as "as-of", not a standing fact. It will keep shifting; re-check.
    forecast: z
      .object({
        issued: z.string(),
        note: z.string(),
        days: z.array(
          z.object({
            day: z.string(),
            sky: z.string(),
            high: z.number(),
            low: z.number(),
            rain: z.string(),
          }),
        ),
        sources: z.array(z.object({ label: z.string(), url: z.url() })),
      })
      .optional(),
    rows: z.array(
      z.object({
        label: z.string(),
        value: z.string(),
        sourceLabel: z.string().optional(),
        sourceUrl: z.url().optional(),
      }),
    ),
  }),
});

// More to do beyond the headline sights — town-level, family, indoor, retro — as
// a sourced list (no map pin needed). Each item names its source.
const todo = defineCollection({
  loader: file('./src/data/todo.yaml'),
  schema: z.object({
    destination: reference('destinations'),
    name: z.string(),
    note: z.string(),
    tag: z.string().optional(),
    order: z.number().default(0),
    source: z.object({ label: z.string(), url: z.url() }),
  }),
});

// Pop-culture footprint — "you might know it from" — film, anime, songs, trivia.
const popculture = defineCollection({
  loader: file('./src/data/popculture.yaml'),
  schema: z.object({
    destination: reference('destinations'),
    title: z.string(),
    medium: z.string(),
    note: z.string(),
    order: z.number().default(0),
    source: z.object({ label: z.string(), url: z.url() }),
  }),
});

// Where to stay — a few real, family-fitting lodgings per town, with the facts a
// group with a toddler actually weighs: access from the station, rooms that fit
// four adults + a child, a price estimate, private-bath and kid amenities.
const lodging = defineCollection({
  loader: file('./src/data/lodging.yaml'),
  schema: z.object({
    name: z.string(),
    nameJa: z.string().optional(),
    destination: reference('destinations'),
    order: z.number().default(0),
    tier: z.string(),
    access: z.string(),
    rooms: z.string(),
    price: z.string(),
    privateOnsen: z.string(),
    kids: z.string(),
    source: z.object({ label: z.string(), url: z.url() }),
  }),
});

// Other glamping & cabins we found anywhere near Tokyo — a low-priority browse
// list, not part of the main decision. Each carries its public-transport reality
// (route, time, cost) because most are otherwise pitched as "X minutes by car".
const glamping = defineCollection({
  loader: file('./src/data/glamping.yaml'),
  schema: z.object({
    name: z.string(),
    nameJa: z.string().optional(),
    area: z.string(),
    type: z.string(), // glamping | cabin
    order: z.number().default(0),
    lat: z.number(),
    lng: z.number(),
    capacity: z.string(),
    ac: z.string(),
    bath: z.string(),
    price: z.string(),
    kidNote: z.string(),
    transitTime: z.string(),
    transitCost: z.string(),
    transitRoute: z.string(),
    transitVerdict: z.string(),
    source: z.object({ label: z.string(), url: z.url() }),
  }),
});

// "Neat stuff I found" — the genuinely offbeat, cult, surprising curiosities of
// each place, the stuff that's not on the standard sight list. A flag carries a
// caveat where one matters (adults-only, not reachable this year).
const neat = defineCollection({
  loader: file('./src/data/neat.yaml'),
  schema: z.object({
    destination: reference('destinations'),
    name: z.string(),
    note: z.string(),
    flag: z.string().optional(),
    order: z.number().default(0),
    source: z.object({ label: z.string(), url: z.url() }),
  }),
});

// The lodging decision layer the home renders — role-tagged picks with the
// decision-specific framing (availability snapshot, all-in cost, the catch).
// Shared facts (photos, fuller detail) stay in lodging/glamping; this is a view.
const picks = defineCollection({
  loader: file('./src/data/picks.yaml'),
  schema: z.object({
    role: z.enum(['pick', 'safe', 'also', 'passed']),
    order: z.number(),
    name: z.string(),
    // Present on the three live picks; absent on the passed-on entries.
    lat: z.number().optional(),
    lng: z.number().optional(),
    rating: z.string().optional(),
    ratingCount: z.string().optional(),
    ratingSource: z.string().optional(),
    ratingNote: z.string().optional(),
    photoSubject: z.string().optional(),
    vibe: z.string().optional(),
    onsen: z.string().optional(),
    fits: z.string().optional(),
    getThere: z.string().optional(),
    meals: z.string().optional(),
    toddler: z.string().optional(),
    allIn: z.string().optional(),
    availSat: z.string().optional(),
    catch: z.string().optional(),
    backup: z.string().optional(),
    detailUrl: z.string().optional(),
    // Present only on the passed-on entries.
    why: z.string().optional(),
  }),
});

export const collections = { sources, destinations, places, journeys, pois, paths, photos, notes, kids, weather, todo, popculture, lodging, glamping, neat, picks };
