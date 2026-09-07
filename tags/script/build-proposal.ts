/**
 * Render reference/taxonomy-proposal.md from reference/_taxonomy-delta.json — the
 * human-review document for the cross-pack taxonomy synthesis. Each item's status is
 * computed from the live taxonomy (src/tags + compound-tags.ts), so the document stays
 * truthful as proposals land — under their proposed id, a renamed successor, or not at all.
 *
 *   node ./script/build-proposal.ts
 */
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

import { listTagFiles, root } from "./lib.ts";
const d = JSON.parse(await readFile(join(root, "reference", "_taxonomy-delta.json"), "utf8"));

const fields = (fs: { name: string; tsType: string }[]) =>
  fs && fs.length ? fs.map((f) => `${f.name}: ${f.tsType}`).join(", ") : "—";

let m = "# Cross-pack Taxonomy Proposal\n\n";
m += "Synthesized from 18 per-pack discovery reports (see `discovery-reports.json`). ";
m += "Status is computed from the live taxonomy each time this file is rebuilt (`node script/build-proposal.ts`): **✅ implemented** ids exist in `src/tags` (or landed under a renamed successor), **✖ dropped** were removed as never used by a card. ";
m += "Items marked **⏳ proposed** are recorded here and implemented as their packs are tagged — this is how the taxonomy resumes from prior thinking.\n\n";

const nf = d.newFiles ?? [];
const nm = d.newEnumMembersInExistingFiles ?? [];
const aa = d.argumentAdditions ?? [];
const ct = d.newCompoundTags ?? [];
const rj = d.rejected ?? [];

m += `## Summary\n\n`;
m += `- New tag files: ${nf.length} (${nf.filter((x: any) => x.usedByDwl).length} implemented)\n`;
m += `- New members in existing files: ${nm.length} (${nm.filter((x: any) => x.usedByDwl).length} implemented)\n`;
m += `- Argument additions: ${aa.length} (${aa.filter((x: any) => x.usedByDwl).length} implemented)\n`;
m += `- New compound tags: ${ct.length} (${ct.filter((x: any) => x.usedByDwl).length} implemented)\n`;
m += `- Rejected proposals: ${rj.length}\n\n`;

// Live status: an item is implemented when its enum value (or its renamed successor) exists in
// src/tags, its file exists, or its compound id exists in compound-tags.ts — not the stale
// `usedByDwl` pilot marker.
const tagSource = (await Promise.all((await listTagFiles()).map((f) => readFile(f, "utf8")))).join("\n");
const compoundSource = await readFile(join(root, "src", "compound-tags", "compound-tags.ts"), "utf8");
const liveIds = new Set([...tagSource.matchAll(/=\s*"([a-z0-9-]+)"/g)].map((m) => m[1]));
const liveCompounds = new Set([...compoundSource.matchAll(/=\s*"c-([a-z0-9-]+)"/g)].map((m) => m[1]));
/** Proposed ids that landed under a different name, or were dropped as unused. */
const IMPLEMENTED_AS: Record<string, string> = {
  "deck-search-bonded": "bonded-fetch",
  "engage-disengage": "enemy-engage-disengage",
  "enemy-cannot-engage": "buff-cannot-engage-you",
  "cancel-treachery-in-play": "discard-treachery-in-play",
};
const DROPPED = new Set(["encounter-reveal-choose"]);
const flagId = (id: string) =>
  liveIds.has(id) ? "✅ implemented"
  : IMPLEMENTED_AS[id] ? `✅ implemented as \`${IMPLEMENTED_AS[id]}\``
  : DROPPED.has(id) ? "✖ dropped (never used by a card)"
  : "⏳ proposed";
const flag = (x: any) =>
  x.value ? flagId(x.value)
  : x.enumMember ? (liveCompounds.has(x.name) ? "✅ implemented" : "⏳ proposed")
  : x.existingEnumMember ? (tagSource.includes(`${x.addField.name}`) ? "✅ implemented" : "⏳ proposed")
  : x.folder && x.file ? (existsSync(join(root, "src", "tags", x.folder, `${x.file}.ts`)) ? "✅ implemented" : "⏳ proposed")
  : "⏳ proposed";

m += `## New tag files\n\n`;
for (const f of nf) {
  m += `### \`${f.folder}/${f.file}.ts\` — \`${f.enumName}\` — ${flag(f)}\n`;
  m += `Base fields: ${fields(f.baseFields)}\n\n`;
  for (const mem of f.members) {
    m += `- \`${mem.member}\` = \`"${mem.value}"\`${mem.extraFields?.length ? ` (+ ${fields(mem.extraFields)})` : ""}\n`;
  }
  m += `\n_${f.rationale}_\n\n`;
  m += `Packs: ${f.sourcePacks?.join(", ")}\n\n`;
}

m += `## New members in existing files\n\n`;
for (const x of nm) {
  m += `- ${flag(x)} — \`${x.enumName}.${x.member}\` = \`"${x.value}"\`${x.extraFields?.length ? ` (+ ${fields(x.extraFields)})` : ""} _(${x.folder}/${x.file}.ts; packs: ${x.sourcePacks?.join(", ")})_\n  - ${x.rationale}\n`;
}
m += `\n`;

m += `## Argument additions to existing tags\n\n`;
for (const x of aa) {
  m += `- ${flag(x)} — \`${x.existingEnumMember}\` gains \`${x.addField.name}: ${x.addField.tsType}\`\n  - ${x.rationale}\n`;
}
m += `\n`;

m += `## New compound tags\n\n`;
for (const x of ct) {
  m += `- ${flag(x)} — \`${x.name}\` (\`${x.enumMember}\`) → ${x.memberTags.map((t: string) => `\`${t}\``).join(", ")}\n  - ${x.rationale}\n`;
}
m += `\n> Note: implemented compounds reference only members that exist today (\`into-play-cheat\` and \`deck-top-control\` will gain more members — commit-from-deck-top, encounter reveal choice, chaos predict, play-from-other-zone — as those tags land).\n\n`;

m += `## Rejected proposals\n\n`;
for (const x of rj) m += `- **${x.proposal}** — ${x.reason}${x.pack ? ` _(${x.pack})_` : ""}\n`;
m += `\n`;

await writeFile(join(root, "reference", "taxonomy-proposal.md"), m);
console.log(`Wrote reference/taxonomy-proposal.md (${m.length} chars)`);
