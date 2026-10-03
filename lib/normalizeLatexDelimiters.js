/** Convertit \\(...\\) et \\[...\\] en syntaxe attendue par remark-math ($…$, $$…$$). */

export function normalizeLatexDelimiters(markdown) {
  if (!markdown || typeof markdown !== "string") return "";
  return markdown
    .replace(/\\\(([\s\S]*?)\\\)/g, (_, inner) => `$${inner.trim()}$`)
    .replace(/\\\[([\s\S]*?)\\\]/g, (_, inner) => `$$\n${inner.trim()}\n$$`);
}
