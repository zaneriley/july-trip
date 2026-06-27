/*
  Small presentation helpers. Times and money are stored as plain numbers in the
  data so they can be compared and, later, summed across a graph; these turn them
  into the words a person actually reads. Prices are deliberately approximate
  ("about ¥4,860") because the underlying figures are too — see the journey
  caveats and the evidence-only rule (ADR 0003).
*/

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `about ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `about ${hours} hr` : `about ${hours} hr ${rest} min`;
}

export function formatYen(amount: number): string {
  return `about ¥${amount.toLocaleString('en-US')}`;
}
