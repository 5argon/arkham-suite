/**
 * Build reference/_tag-glossary.md — the COMPACT taxonomy: one line per tag and per compound
 * (id, display name, member count, arguments, player-facing description). Small enough for a
 * review agent to hold whole, where the full digest (every source file + members + rulings)
 * is not; look a tag up in the digest / `yarn roster` / reference/rulings.json when its
 * boundary matters.
 *
 *   node ./script/build-glossary.ts [--out path]
 *
 * Reads the BUILT package (dist/) for member counts — run `yarn build` first.
 */
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { flagValue, i18nKey, loadCorpus, loadMessages, loadTagDefs, referenceDir } from "./lib.ts";

const outPath = flagValue(process.argv.slice(2), "--out") ?? join(referenceDir, "_tag-glossary.md");
const defs = await loadTagDefs();
const messages = await loadMessages();
const corpus = await loadCorpus();
const { compoundTags, resolveCompounds } = await import("../dist/index.js");

const names = new Map<string, Set<string>>();
const add = (id: string, name: string) => (names.get(id) ?? names.set(id, new Set()).get(id)!).add(name);
for (const c of corpus) {
  for (const t of c.tags) add(t.type, c.name);
  for (const ct of resolveCompounds(c.tags as never) as string[]) add(ct, c.name);
}
const count = (id: string) => names.get(id)?.size ?? 0;

let out = "# Tag glossary\n";
out +=
  "# (auto-built by script/build-glossary.ts) One line per tag: `id` — Display Name (distinct member card names) — args — description.\n" +
  "# Tags exist so a player can go from a card they know to cards doing the same job (a sidegrade when copies run out) or browse by function.\n" +
  "# Boundaries between look-alike tags: reference/rulings.json (by tag id) and `yarn roster <id>` for the full member list.\n\n";

const groups = new Map<string, string[]>();
for (const d of defs.values()) (groups.get(d.group) ?? groups.set(d.group, []).get(d.group)!).push(d.id);
for (const [group, ids] of [...groups.entries()].sort(([a], [b]) => a.localeCompare(b))) {
  out += `## ${messages[`tag_group_${i18nKey(group)}`] ?? group} — ${messages[`desc_group_${i18nKey(group)}`] ?? ""}\n`;
  for (const id of ids) {
    const d = defs.get(id)!;
    const args = Object.entries(d.fields).map(([k, f]) => `${k}${f.optional ? "?" : ""}: ${f.type}`);
    out += `- \`${id}\` — ${messages[`tag_${i18nKey(id)}`] ?? id} (${count(id)})${args.length ? ` — args ${args.join("; ")}` : ""} — ${messages[`desc_tag_${i18nKey(id)}`] || "(no description)"}\n`;
  }
  out += "\n";
}

out += "## Compounds — archetypes derived from member tags (never written on cards)\n";
for (const c of compoundTags as { type: string; tags: (string | { type: string; where?: object })[] }[]) {
  const members = c.tags.map((m) => (typeof m === "string" ? m : `${m.type}${m.where ? JSON.stringify(m.where) : ""}`));
  out += `- \`${c.type}\` — ${messages[`tag_compound_${i18nKey(c.type)}`] ?? c.type} (${count(c.type)}) — ${messages[`desc_compound_${i18nKey(c.type)}`] || "(no description)"} Members: ${members.join(", ")}\n`;
}

await writeFile(outPath, out);
console.log(`Wrote ${outPath} (${defs.size} tags, ${compoundTags.length} compounds, ${out.length} chars)`);
