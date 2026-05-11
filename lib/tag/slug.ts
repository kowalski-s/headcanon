/** Canonical slug: lowercase, trimmed, spaces → hyphens (AO3 convention). */
export function toSlug(raw: string): string {
  return raw.toLowerCase().trim().replace(/\s+/g, '-');
}
