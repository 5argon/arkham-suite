/**
 * Seed messages/en.json (inlang message-format) with, for every tag group, tag type
 * and compound tag: a NAME key (humanized default) and an empty DESCRIPTION key — then write
 * the player-facing description in messages/en.json itself (`yarn lint-tags` flags any left
 * empty). MERGE-safe: existing values are never overwritten.
 *
 *   yarn build && node ./script/seed-strings.ts [--prune]
 *
 *   --prune   also drop keys that no group / tag / compound in the taxonomy produces
 *             (leftovers of renamed or removed tags)
 *
 * Humanizing from kebab lives ONLY here (to bootstrap names) — never at runtime.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { tagTypeCategory } from "../dist/tag-category-map.js";
import { tagGroupIds } from "../dist/tag-group.js";
import { compoundTags } from "../dist/compound-tags/compound-tags.js";
import { root } from "./lib.ts";

const prune = process.argv.includes("--prune");
const enPath = join(root, "messages", "en.json");

const humanize = (v: string) =>
  v
    .split("-")
    .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
const keyFor = (v: string) => v.replaceAll("-", "_");

await mkdir(join(root, "messages"), { recursive: true });

const en: Record<string, string> = existsSync(enPath)
  ? JSON.parse(await readFile(enPath, "utf8"))
  : {};

en["$schema"] = en["$schema"] ?? "https://inlang.com/schema/inlang-message-format";

let added = 0;
const expected = new Set<string>(["$schema"]);
const ensure = (key: string, value: string) => {
  expected.add(key);
  if (!(key in en)) {
    en[key] = value;
    added++;
  }
};

for (const id of tagGroupIds) {
  ensure(`tag_group_${keyFor(id)}`, humanize(id));
  ensure(`desc_group_${keyFor(id)}`, "");
}
for (const value of Object.keys(tagTypeCategory)) {
  ensure(`tag_${keyFor(value)}`, humanize(value));
  ensure(`desc_tag_${keyFor(value)}`, "");
}
for (const c of compoundTags) {
  // Compound values carry a `c-` namespace prefix on the machine id; the i18n keys are keyed
  // by the bare name, so strip it here.
  const v = String(c.type).replace(/^c-/, "");
  ensure(`tag_compound_${keyFor(v)}`, humanize(v));
  ensure(`desc_compound_${keyFor(v)}`, "");
}

let pruned = 0;
if (prune) {
  for (const key of Object.keys(en)) {
    if (expected.has(key)) continue;
    delete en[key];
    pruned++;
  }
}

await writeFile(enPath, JSON.stringify(en, null, 2) + "\n");
console.log(
  `Seeded messages/en.json: ${added} new keys, ${pruned} pruned (total ${Object.keys(en).length - 1} strings).`,
);
