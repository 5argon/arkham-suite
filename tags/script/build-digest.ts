/**
 * Build reference/_taxonomy-digest.md — a single concatenation of every tag-definition
 * file plus the compound tags. This is the "current accumulated taxonomy" handed to the
 * tagging/discovery agents so each new pass resumes from everything decided so far.
 *
 *   node ./script/build-digest.ts
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const tagsDir = join(root, "src", "tags");

const entries = await readdir(tagsDir, { recursive: true, withFileTypes: true });
const files = entries
  .filter((e) => e.isFile() && e.name.endsWith(".ts") && e.name !== "index.ts")
  .map((e) => join(e.parentPath ?? (e as unknown as { path: string }).path, e.name))
  .sort();

let out = "# Existing Tag Taxonomy Digest\n";
out += "# (auto-built by script/build-digest.ts; agents: DO NOT re-propose tags already here)\n\n";

for (const f of files) {
  out += `==== FILE: src/tags/${relative(tagsDir, f)} ====\n`;
  out += (await readFile(f, "utf8")).trimEnd() + "\n\n";
}

out += "==== FILE: src/compound-tags/compound-tags.ts ====\n";
out += (await readFile(join(root, "src", "compound-tags", "compound-tags.ts"), "utf8")).trimEnd() + "\n";

await writeFile(join(root, "reference", "_taxonomy-digest.md"), out);
console.log(`Wrote reference/_taxonomy-digest.md (${files.length} tag files, ${out.length} chars)`);
