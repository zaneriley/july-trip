/*
  Display name and pin colour for each map category, in one place so the filter
  swatches and the map markers can't drift apart. The label is the sentence-case
  wording shown next to the filter toggle; the colour is the pin colour. This is
  map metadata — categories never appear as a chip on a card (ADR 0001, amended).
*/
export const CATEGORY_META: Record<string, { label: string; color: string }> = {
  'train-stop': { label: 'train stops', color: '#2563eb' },
  sightseeing: { label: 'sightseeing', color: '#dc2626' },
  viewpoint: { label: 'viewpoints', color: '#7c3aed' },
  onsen: { label: 'onsen', color: '#db2777' },
  coffee: { label: 'third-wave coffee', color: '#92400e' },
  kissaten: { label: 'kissaten', color: '#b45309' },
  neighborhood: { label: 'neighborhoods', color: '#059669' },
};
