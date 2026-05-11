export function between(lower: number | undefined, upper: number | undefined): number {
  if (lower === undefined && upper === undefined) return 1;
  if (lower === undefined) return upper! / 2;
  if (upper === undefined) return lower + 1;
  return (lower + upper) / 2;
}

export function needsRenumber(ordinals: number[]): boolean {
  for (let i = 1; i < ordinals.length; i++) {
    if (ordinals[i] - ordinals[i - 1] < 0.01) return true;
  }
  return false;
}
