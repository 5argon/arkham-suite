/**
 * suggest-tags — for each card, the tags that its textually most similar cards carry but it
 * does not. The review aid for MISSED tags: an early card tagged before a later mechanic got
 * its tag, or a reprint whose wording drifted, shows up as "its look-alikes all have X".
 * Suggestions are hints to adjudicate against the tag's definition, never to apply blindly.
 *
 *   node ./script/suggest-tags.ts [--pack p[,p…]] [--code c[,c…]] [--k 10] [--min 3] [--floor 0.15] [--json out.json]
 *
 *   --pack / --code   only report these cards (neighbors always come from the whole corpus)
 *   --k               neighbors considered per card (default 10; same-name cards excluded)
 *   --min             a tag must be on at least this many of those neighbors (default 3)
 *   --floor           ignore neighbors below this TF-IDF cosine similarity (default 0.15)
 *   --json            also write the suggestions as JSON
 *
 * Stat-derived and bookkeeping tags (skill-commit-*, soak-*, deck-restriction, bonded-card,
 * customizable) are never suggested. Weaknesses are never tagged, so they are left out both as
 * cards to report and as neighbors.
 *
 * Reads the BUILT package (dist/) — run `yarn build` first.
 */
import { writeFile } from "node:fs/promises";
import { cosine, flagValue, loadCorpus, tfidfIndex } from "./lib.ts";

const argv = process.argv.slice(2);
const packs = new Set((flagValue(argv, "--pack") ?? "").split(",").filter(Boolean));
const codes = new Set((flagValue(argv, "--code") ?? "").split(",").filter(Boolean));
const k = Number(flagValue(argv, "--k") ?? 10);
const min = Number(flagValue(argv, "--min") ?? 3);
const floor = Number(flagValue(argv, "--floor") ?? 0.15);
const jsonOut = flagValue(argv, "--json");

const NEVER = /^(skill-commit-|soak-)|^(deck-restriction|bonded-card|customizable)$/;

const corpus = (await loadCorpus()).filter((c) => !c.subtype);
const index = tfidfIndex(corpus.map((c) => c.text));
const typesOf = corpus.map((c) => new Set(c.tags.map((t) => t.type)));

type Suggestion = { type: string; count: number; examples: { code: string; name: string }[] };
const results: { code: string; name: string; pack: string; suggestions: Suggestion[] }[] = [];

corpus.forEach((card, i) => {
  if ((packs.size && !packs.has(card.pack)) || (codes.size && !codes.has(card.code))) return;
  const neighbors = corpus
    .map((c, j) => ({ j, score: j === i || c.name === card.name ? -1 : cosine(index.docs[i], index.docs[j]) }))
    .filter((n) => n.score >= floor)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
  const tally = new Map<string, number[]>();
  for (const n of neighbors)
    for (const type of typesOf[n.j])
      if (!typesOf[i].has(type) && !NEVER.test(type)) (tally.get(type) ?? tally.set(type, []).get(type)!).push(n.j);
  const suggestions = [...tally.entries()]
    .filter(([, js]) => js.length >= min)
    .sort((a, b) => b[1].length - a[1].length)
    .map(([type, js]) => ({
      type,
      count: js.length,
      examples: js.slice(0, 3).map((j) => ({ code: corpus[j].code, name: corpus[j].name })),
    }));
  if (suggestions.length) results.push({ code: card.code, name: card.name, pack: card.pack, suggestions });
});

for (const r of results) {
  console.log(`${r.code} ${r.name} [${r.pack}]`);
  for (const s of r.suggestions)
    console.log(`  + ${s.type}  (${s.count}/${k} look-alikes: ${s.examples.map((e) => `${e.name} ${e.code}`).join(", ")})`);
}
console.log(`\n${results.length} cards with suggestions (k=${k}, min=${min}, floor=${floor})`);
if (jsonOut) {
  await writeFile(jsonOut, JSON.stringify(results, null, 1) + "\n");
  console.log(`Wrote ${jsonOut}`);
}
