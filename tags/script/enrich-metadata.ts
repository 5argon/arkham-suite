/**
 * One-off backfill: inject stat metadata (level / cardType / icons) into every existing
 * `src/tagged-cards/<pack>.ts`, inserted right after each card's `text:` line. The tag
 * EXPRESSIONS are untouched (pure textual insertion), so this never has to round-trip the
 * authored enum references. Idempotent: a file already carrying `cardType:` is skipped.
 *
 *   node ./script/enrich-metadata.ts
 */
import { readFile, writeFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { loadCardMetadata, metadataLines } from "./card-metadata.ts";

const here = dirname(fileURLToPath(import.meta.url));
const dir = join(here, "..", "src", "tagged-cards");
const meta = await loadCardMetadata();

const files = (await readdir(dir)).filter((f) => f.endsWith(".ts") && f !== "index.ts");
let enrichedFiles = 0;
let enrichedCards = 0;

for (const file of files) {
  const path = join(dir, file);
  const src = await readFile(path, "utf8");
  if (src.includes("\n    cardType:") || src.includes("\n    icons:")) continue; // already enriched

  const inLines = src.split("\n");
  const out: string[] = [];
  let code: string | null = null;
  for (const line of inLines) {
    const m = line.match(/^    code: "([^"]+)",/);
    if (m) code = m[1];
    out.push(line);
    if (/^    text: /.test(line) && code) {
      const lines = metadataLines(meta.get(code));
      if (lines.length) {
        out.push(...lines);
        enrichedCards++;
      }
      code = null;
    }
  }
  await writeFile(path, out.join("\n"));
  enrichedFiles++;
}

console.log(`Enriched ${enrichedCards} cards across ${enrichedFiles} files.`);
