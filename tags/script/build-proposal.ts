/**
 * Render reference/taxonomy-proposal.md from reference/_taxonomy-delta.json — the
 * human-review document for the cross-pack taxonomy synthesis. Items flagged
 * usedByDwl are already implemented (the pilot); the rest are proposed for when
 * their packs are tagged.
 *
 *   node ./script/build-proposal.ts
 */
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const d = JSON.parse(await readFile(join(root, "reference", "_taxonomy-delta.json"), "utf8"));

const fields = (fs: { name: string; tsType: string }[]) =>
  fs && fs.length ? fs.map((f) => `${f.name}: ${f.tsType}`).join(", ") : "—";

let m = "# Cross-pack Taxonomy Proposal\n\n";
m += "Synthesized from 18 per-pack discovery reports (see `discovery-reports.json`). ";
m += "Items marked **✅ implemented** are live in the taxonomy (added for the dwl pilot, though several also serve later packs). ";
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

const flag = (x: any) => (x.usedByDwl ? "✅ implemented" : "⏳ proposed");

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
