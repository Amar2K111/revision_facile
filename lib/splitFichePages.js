/**
 * Découpe une fiche Révision facile aux lignes `---` (séparateur entre parties).
 */
export function splitFichePages(markdown) {
  if (!markdown || typeof markdown !== "string") return [""];
  const raw = markdown.trim();
  if (!raw) return [""];
  const segments = raw
    .split(/\r?\n\s*---\s*\r?\n/g)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  return segments.length > 0 ? segments : [raw];
}
