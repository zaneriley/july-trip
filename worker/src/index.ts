/*
  The hearts Worker. It holds one number per card in a KV namespace and nothing
  else — no accounts, no sessions, no personal data. Five people on their phones
  share the same counts.

  Routes:
    GET    /hearts            -> { [cardId]: count }
    POST   /heart/:cardId     -> add one, returns the new { count }
    DELETE /heart/:cardId     -> remove one (floored at zero), returns { count }

  Double-tapping is prevented on the client (each phone remembers what it has
  hearted), so the Worker itself stays trivially simple: it just adds and subtracts.
*/

export interface Env {
  // Bound in wrangler.toml. Stores one integer per card id.
  HEARTS: KVNamespace;
}

// Keys are namespaced so a future feature could share the same KV without clashing.
const PREFIX = 'card:';

const cors = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...cors },
  });
}

async function readCount(env: Env, cardId: string): Promise<number> {
  const raw = await env.HEARTS.get(PREFIX + cardId);
  return raw ? Number(raw) : 0;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    const url = new URL(request.url);
    const parts = url.pathname.split('/').filter(Boolean);

    // GET /hearts -> all counts at once, so the page fetches in a single request.
    if (request.method === 'GET' && parts[0] === 'hearts') {
      const counts: Record<string, number> = {};
      const list = await env.HEARTS.list({ prefix: PREFIX });
      for (const key of list.keys) {
        const id = key.name.slice(PREFIX.length);
        counts[id] = await readCount(env, id);
      }
      return json(counts);
    }

    // POST or DELETE /heart/:cardId
    if (parts[0] === 'heart' && parts[1]) {
      const cardId = decodeURIComponent(parts[1]);
      if (request.method === 'POST' || request.method === 'DELETE') {
        const delta = request.method === 'POST' ? 1 : -1;
        const next = Math.max(0, (await readCount(env, cardId)) + delta);
        await env.HEARTS.put(PREFIX + cardId, String(next));
        return json({ count: next });
      }
    }

    return json({ error: 'not found' }, 404);
  },
};
