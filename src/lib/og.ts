/*
  Build the link-preview images at build time. When someone pastes a link into the
  group thread, this is the bubble they see — so the home image carries the actual
  comparison (time and cost, side by side) and each destination image carries its
  photo and headline figures. Rendered with satori (layout -> SVG) and resvg
  (SVG -> PNG). This module runs only at build, never at the edge.
*/
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

// These run only during `astro build`, where the working directory is the repo
// root — so resolve assets from there rather than from this module's built chunk.
const fontFile = (file: string) =>
  readFileSync(join(process.cwd(), 'node_modules/@fontsource/inter/files', file));
const fonts = [
  { name: 'Inter', data: fontFile('inter-latin-400-normal.woff'), weight: 400 as const, style: 'normal' as const },
  { name: 'Inter', data: fontFile('inter-latin-600-normal.woff'), weight: 600 as const, style: 'normal' as const },
];

// Read a photo from /public and inline it so satori can draw it.
function photoDataUri(publicPath: string): string {
  const b64 = readFileSync(join(process.cwd(), 'public', publicPath)).toString('base64');
  return `data:image/jpeg;base64,${b64}`;
}

// Tiny element helpers — satori takes a React-element-like tree. Every container
// with more than one child must declare display:flex, so we bake that in.
type Style = Record<string, unknown>;
type Node = { type: string; props: { style?: Style; children?: unknown; src?: string } };
const box = (style: Style, children: unknown): Node => ({ type: 'div', props: { style: { display: 'flex', ...style }, children } });
const text = (style: Style, children: string): Node => ({ type: 'div', props: { style, children } });
const img = (src: string, style: Style): Node => ({ type: 'img', props: { src, style } });

const C = { ink: '#1c1917', soft: '#78716c', faint: '#a8a29e', value: '#292524', line: '#e7e5e4', paper: '#ffffff', bg: '#fafaf9' };

async function toPng(node: Node): Promise<Uint8Array<ArrayBuffer>> {
  const svg = await satori(node as never, { width: 1200, height: 630, fonts });
  // Uint8Array.from copies into a fresh ArrayBuffer, which is what Response/Blob
  // want — resvg's Buffer is typed as ArrayBufferLike and the DOM types reject it.
  return Uint8Array.from(new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng());
}

export interface OgColumn {
  name: string;
  time: string | null;
  cost: string | null;
  heroImage: string;
}

// Home: the two options side by side, the comparison the chat is having.
export function renderHomeOg(columns: OgColumn[]): Promise<Uint8Array<ArrayBuffer>> {
  return toPng(
    box({ flexDirection: 'column', width: '100%', height: '100%', background: C.bg, padding: 56, fontFamily: 'Inter' }, [
      box({ flexDirection: 'column', marginBottom: 28 }, [
        text({ fontSize: 56, fontWeight: 600, color: C.ink }, 'Kurobe or Atami?'),
        text({ fontSize: 30, color: C.soft, marginTop: 4 }, 'July 3 to 5'),
      ]),
      box({ flex: 1, gap: 24 }, columns.map((col) =>
        box({ flexDirection: 'column', flex: 1, background: C.paper, border: `1px solid ${C.line}`, borderRadius: 24, overflow: 'hidden' }, [
          img(photoDataUri(col.heroImage), { width: '100%', height: 280, objectFit: 'cover' }),
          box({ flexDirection: 'column', padding: 28 }, [
            text({ fontSize: 36, fontWeight: 600, color: C.ink }, col.name),
            text({ fontSize: 20, color: C.faint, marginTop: 18 }, 'from Shibuya'),
            text({ fontSize: 27, color: C.value, marginTop: 2 }, col.time ?? '—'),
            text({ fontSize: 20, color: C.faint, marginTop: 12 }, 'per adult'),
            text({ fontSize: 27, color: C.value, marginTop: 2 }, col.cost ?? '—'),
          ]),
        ]),
      )),
    ]),
  );
}

// One destination: its photo and headline figures.
export function renderDestinationOg(col: OgColumn & { tagline: string }): Promise<Uint8Array<ArrayBuffer>> {
  return toPng(
    box({ width: '100%', height: '100%', background: C.bg, fontFamily: 'Inter' }, [
      img(photoDataUri(col.heroImage), { width: 560, height: '100%', objectFit: 'cover' }),
      box({ flexDirection: 'column', flex: 1, padding: 56, justifyContent: 'center' }, [
        text({ fontSize: 64, fontWeight: 600, color: C.ink }, col.name),
        text({ fontSize: 27, color: C.soft, marginTop: 10, lineHeight: 1.3 }, col.tagline),
        text({ fontSize: 22, color: C.faint, marginTop: 40 }, 'from Shibuya'),
        text({ fontSize: 32, color: C.value, marginTop: 2 }, col.time ?? '—'),
        text({ fontSize: 22, color: C.faint, marginTop: 16 }, 'per adult'),
        text({ fontSize: 32, color: C.value, marginTop: 2 }, col.cost ?? '—'),
      ]),
    ]),
  );
}
