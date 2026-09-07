/**
 * Regenerate every json/untagged/<pack>.json worklist FROM the typed pack file, so the
 * worklists never drift from src/tagged-cards/<pack>.ts (the source of truth, which review
 * fixes edit directly). Run it after hand-editing a pack file, or before re-assembling one.
 *
 *   node ./script/sync-worklists.ts [<pack> ...]      default: every pack
 *
 * Each worklist row is { code, name, text, tags: string[] } where every tag is the exact
 * TS object-literal expression found in the pack file — the same shape the tag-cards skill
 * produces and assemble-tagged-cards.ts consumes.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { listPacks, root, srcDir } from "./lib.ts";

const packs = process.argv.slice(2).length ? process.argv.slice(2) : await listPacks();
await mkdir(join(root, "json", "untagged"), { recursive: true });

/** Split the body of `tags: [ ... ]` into one expression per top-level `{ ... }` object. */
function splitTagExpressions(body: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let start = -1;
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (ch === "{") {
      if (depth === 0) start = i;
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth === 0 && start !== -1) {
        out.push(body.slice(start, i + 1).replace(/\s+/g, " ").trim());
        start = -1;
      }
    }
  }
  return out;
}

/** Find the matching `]` for the `[` at `open`, ignoring brackets inside string literals. */
function matchBracket(src: string, open: number): number {
  let depth = 0;
  let quote: string | null = null;
  for (let i = open; i < src.length; i++) {
    const ch = src[i];
    if (quote) {
      if (ch === "\\") i++;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") quote = ch;
    else if (ch === "[") depth++;
    else if (ch === "]" && --depth === 0) return i;
  }
  throw new Error("unbalanced brackets");
}

for (const pack of packs) {
  const src = await readFile(join(srcDir, "tagged-cards", `${pack}.ts`), "utf8");
  const rows: { code: string; name: string; text: string; tags: string[] }[] = [];
  const cardRe = /^\s{4}code: ("(?:[^"\\]|\\.)*"),\n\s{4}name: ("(?:[^"\\]|\\.)*"),\n\s{4}text: ("(?:[^"\\]|\\.)*"),/gm;
  for (const m of src.matchAll(cardRe)) {
    const tagsAt = src.indexOf("tags: [", m.index! + m[0].length);
    const open = tagsAt + "tags: ".length;
    const close = matchBracket(src, open);
    rows.push({
      code: JSON.parse(m[1]),
      name: JSON.parse(m[2]),
      text: JSON.parse(m[3]),
      tags: splitTagExpressions(src.slice(open + 1, close)),
    });
  }
  const expected = (src.match(/^\s{4}code: "/gm) ?? []).length;
  if (rows.length !== expected) throw new Error(`${pack}: parsed ${rows.length} of ${expected} cards`);
  await writeFile(join(root, "json", "untagged", `${pack}.json`), JSON.stringify(rows, null, 1) + "\n");
  console.log(`${pack}: ${rows.length} cards, ${rows.reduce((n, r) => n + r.tags.length, 0)} tags`);
}
