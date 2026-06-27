import { getCollection, type CollectionEntry } from 'astro:content';
import { formatDuration, formatYen } from './format';

/*
  Reduce a destination's journeys to the two numbers the group actually weighs:
  how long it takes from Shibuya, and what it costs per adult. Both come straight
  from the journey figures (which carry their own sources), so the comparison and
  its link-preview image stay tied to the sourced data, not retyped by hand.
*/
export function summarizeJourneys(journeys: CollectionEntry<'journeys'>[]) {
  const durations = journeys
    .map((j) => j.data.totalDurationMin?.value)
    .filter((n): n is number => typeof n === 'number');
  const fares = journeys
    .map((j) => j.data.totalFareYen?.value)
    .filter((n): n is number => typeof n === 'number');

  // Show the easiest way in, not a worst-case range. "Getting to Kurobe" means
  // the town (one direct shinkansen, ~2h48) — the longer alpine-route journeys
  // are excursions from there, and live on the destination page, not the headline.
  return {
    time: durations.length ? formatDuration(Math.min(...durations)) : null,
    cost: fares.length ? formatYen(Math.min(...fares)) : null,
  };
}

// The destinations in display order, each with its summarized time and cost.
// Shared by the comparison page and the link-preview images so they never drift.
export async function comparisonColumns() {
  const destinations = (await getCollection('destinations')).sort(
    (a, b) => a.data.order - b.data.order,
  );
  const journeys = await getCollection('journeys');
  const places = await getCollection('places');
  const placeToDestination = new Map(places.map((p) => [p.id, p.data.destination.id]));

  return destinations.map((dest) => ({
    dest,
    ...summarizeJourneys(journeys.filter((j) => placeToDestination.get(j.data.to.id) === dest.id)),
  }));
}
