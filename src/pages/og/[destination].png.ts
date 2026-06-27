import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { comparisonColumns } from '../../lib/compare';
import { renderDestinationOg } from '../../lib/og';

// Prerenders to /og/kurobe.png and /og/atami.png — each destination's preview.
export async function getStaticPaths() {
  const destinations = await getCollection('destinations');
  return destinations.map((dest) => ({ params: { destination: dest.id } }));
}

export const GET: APIRoute = async ({ params }) => {
  const columns = await comparisonColumns();
  const col = columns.find((c) => c.dest.id === params.destination)!;
  const png = await renderDestinationOg({
    name: col.dest.data.name,
    tagline: col.dest.data.tagline,
    time: col.time,
    cost: col.cost,
    heroImage: col.dest.data.heroImage,
  });
  return new Response(new Blob([png], { type: 'image/png' }));
};
