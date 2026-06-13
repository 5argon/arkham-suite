/**
 * Export the TypeScript-authored tags to the public JSON — the ONE way consumers get
 * tagged cards (the package does not ship them as TS objects). Reads the *built* package
 * (`dist/`), so run `yarn build` first. Writes to `json/export/`:
 *
 *   - cards.json          THE public artifact: [{ code, name, text, tags: RawTag[] }],
 *                         where `tags` MERGES base tags and compound archetypes into one
 *                         list. Compound entries are bare `{ type: "c-..." }` — the `c-`
 *                         prefix marks them, so the data is self-describing. Consumers run
 *                         `hydrate(cards)` to split it back into typed tags + compoundTags.
 *   - compound-tags.json  the compound DEFINITIONS [{ type, tags }] (reference / tooling).
 *   - tags.json           sorted vocabulary of every distinct base tag `type` used.
 *
 * Run with Node (the built output is Node ESM and resolves the kohaku workspace dep):
 *   node ./script/export-json.ts
 */
import { writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
// Internal module: allTaggedCards is intentionally NOT part of the public API.
import { allTaggedCards } from "../dist/tagged-cards/index.js";
import { compoundTags, resolveCompounds } from "../dist/index.js";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "..", "json", "export");

await mkdir(outDir, { recursive: true });

// 1. THE public artifact — base tags and rasterized compounds merged into one `tags` list.
const cards = allTaggedCards.map((c) => ({
  code: c.code,
  name: c.name,
  text: c.text,
  level: c.level,
  cardType: c.cardType,
  icons: c.icons,
  tags: [
    ...c.tags,
    ...resolveCompounds(c.tags).map((type) => ({ type })),
  ],
}));
await writeFile(join(outDir, "cards.json"), JSON.stringify(cards, null, 2));

// 2. Compound definitions (reference / tooling; consumers don't need these to read memberships).
const compounds = compoundTags.map((c) => ({ type: c.type, tags: c.tags }));
await writeFile(join(outDir, "compound-tags.json"), JSON.stringify(compounds, null, 2));

// 3. Sorted vocabulary of every distinct base tag type used on a card.
const vocab = new Set<string>();
for (const c of allTaggedCards) {
  for (const t of c.tags) vocab.add(t.type);
}
await writeFile(
  join(outDir, "tags.json"),
  JSON.stringify(Array.from(vocab).sort(), null, 2),
);

const compoundEntries = cards.reduce(
  (n, c) => n + c.tags.filter((t) => t.type.startsWith("c-")).length,
  0,
);
console.log(
  `Exported ${cards.length} cards (${compoundEntries} rasterized compound entries), ` +
    `${compounds.length} compound definitions, ${vocab.size} distinct base tag types to ${outDir}`,
);
