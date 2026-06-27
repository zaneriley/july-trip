import type { APIRoute } from 'astro';
import { comparisonColumns } from '../../lib/compare';
import { renderHomeOg } from '../../lib/og';

// Prerenders to /og/home.png — the home link's preview bubble (the comparison).
export const GET: APIRoute = async () => {
  const columns = await comparisonColumns();
  const png = await renderHomeOg(
    columns.map((c) => ({
      name: c.dest.data.name,
      time: c.time,
      cost: c.cost,
      heroImage: c.dest.data.heroImage,
    })),
  );
  return new Response(new Blob([png], { type: 'image/png' }));
};
