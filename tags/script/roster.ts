/**
 * Print the full roster of ONE tag or compound — every member with its text — the view for
 * judging whether a tag's membership is complete and correct (tag-major review).
 *
 *   node ./script/roster.ts <tag-id | c-compound-id> [--where '{"action":"fight"}'] [--brief]
 *
 *   tag       its name, description, arguments, then each member card with that tag's
 *             arguments and the card text
 *   compound  its name, description, each member tag with how many cards it pulls in, then
 *             every card with the member tag(s) that pulled it in
 *   --where   only members whose tag arguments include these values (tags only)
 *   --brief   one line per card, no text
 *
 * Reads the BUILT package (dist/) — run `yarn build` first.
 */
import { flagValue, i18nKey, loadCorpus, loadMessages, loadTagDefs, type CorpusTag } from "./lib.ts";

const argv = process.argv.slice(2);
const brief = argv.includes("--brief");
const whereRaw = flagValue(argv, "--where");
const where = whereRaw ? (JSON.parse(whereRaw) as Record<string, unknown>) : undefined;
const id = argv.find((a, i) => !a.startsWith("--") && argv[i - 1] !== "--where");
if (!id) {
  console.error("Usage: node script/roster.ts <tag-id | c-compound-id> [--where '{…}'] [--brief]");
  process.exit(1);
}

const corpus = await loadCorpus();
const messages = await loadMessages();
const { compoundTags, memberMatches } = await import("../dist/index.js");
const text = (s: string) => s.replace(/\s*\n\s*/g, " | ");
const args = (t: CorpusTag) => {
  const e = Object.entries(t).filter(([k]) => k !== "type");
  return e.length ? ` {${e.map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join(", ")}}` : "";
};
const whereOk = (t: CorpusTag) =>
  !where || Object.entries(where).every(([k, v]) => JSON.stringify(t[k]) === JSON.stringify(v));

if (id.startsWith("c-")) {
  const def = (compoundTags as { type: string; tags: unknown[] }[]).find((c) => c.type === id);
  if (!def) {
    console.error(`No compound "${id}"`);
    process.exit(1);
  }
  const rows = corpus
    .map((c) => ({ c, via: def.tags.filter((m) => c.tags.some((t) => memberMatches(m as never, t as never))) }))
    .filter((r) => r.via.length);
  console.log(`${id} — ${messages[`tag_compound_${i18nKey(id)}`] ?? id} — ${rows.length} cards / ${new Set(rows.map((r) => r.c.name)).size} names`);
  console.log(`  ${messages[`desc_compound_${i18nKey(id)}`] || "(no description)"}\n`);
  for (const m of def.tags) {
    const n = rows.filter((r) => r.via.includes(m)).length;
    console.log(`  member ${JSON.stringify(m)} → ${n} card${n === 1 ? "" : "s"}`);
  }
  console.log();
  for (const { c, via } of rows) {
    const label = via.map((m) => (typeof m === "string" ? m : JSON.stringify(m))).join(" + ");
    console.log(`${c.code} ${c.name} [${c.pack}] ← ${label}`);
    if (!brief) console.log(`    ${text(c.text)}`);
  }
} else {
  const defs = await loadTagDefs();
  const def = defs.get(id);
  if (!def) {
    console.error(`No tag "${id}"`);
    process.exit(1);
  }
  const rows = corpus.flatMap((c) => c.tags.filter((t) => t.type === id && whereOk(t)).map((t) => ({ c, t })));
  console.log(`${id} — ${messages[`tag_${i18nKey(id)}`] ?? id} — ${rows.length} tags on ${new Set(rows.map((r) => r.c.name)).size} names`);
  console.log(`  ${messages[`desc_tag_${i18nKey(id)}`] || "(no description)"}`);
  if (def.doc) console.log(`  JSDoc: ${def.doc}`);
  const fields = Object.entries(def.fields);
  if (fields.length) console.log(`  args: ${fields.map(([k, f]) => `${k}${f.optional ? "?" : ""}: ${f.type}`).join("; ")}`);
  const inCompounds = (compoundTags as { type: string; tags: unknown[] }[])
    .filter((c) => c.tags.some((m) => (typeof m === "string" ? m : (m as { type: string }).type) === id))
    .map((c) => c.type);
  console.log(`  compounds: ${inCompounds.join(", ") || "(none)"}\n`);
  for (const { c, t } of rows) {
    console.log(`${c.code} ${c.name} [${c.pack}]${args(t)}`);
    if (!brief) console.log(`    ${text(c.text)}`);
  }
}
