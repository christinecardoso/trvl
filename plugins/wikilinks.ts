import { slugify } from "https://deno.land/x/slugify/mod.ts";

export function wikilinksPlugin() {
  return (text) =>
    text.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, target, label) => {
      const slug = slugify(target);
      return `[${label || target}](/${slug}/)`;
    });
}
