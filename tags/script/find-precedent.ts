/**
 * find-precedent — given a card (code or free text), print the most similar CONFIRMED
 * tagged cards with their tags. This is the tagging agent's "open the confirmed pack in
 * another tab": every tag you apply should be citable to a precedent this tool surfaces.
 *
 * Usage:
 *   node script/find-precedent.ts <card-code>        code from the confirmed corpus or any
 *                                                    json/untagged/<pack>.json / json/input/<pack>.json
 *   node script/find-precedent.ts "free text…"       arbitrary rules text
 *   -n N                                             number of results (default 8)
 *
 * Output: (1) same-NAME cards across packs (level variants — check for convention drift),
 * (2) top-N textually similar confirmed cards (TF-IDF cosine over unigrams+bigrams; icon
 * tokens like [action]/[reaction] are kept as tokens), each with its full text and tags.
 *
 * Reads the BUILT package (dist/) — run `yarn build` first.
 */
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { loadCorpus, root, type CorpusCard as Card } from "./lib.ts";

// ---------- args ----------
const argv = process.argv.slice(2);
let topN = 8;
const nIdx = argv.indexOf("-n");
if (nIdx !== -1) {
  topN = Number(argv[nIdx + 1]) || topN;
  argv.splice(nIdx, 2);
}
// --exclude code,code — hide these confirmed cards from the precedent pool entirely
// (calibration mode: a sampled card must not surface itself or its sampled peers)
const exclude = new Set<string>();
const exIdx = argv.indexOf("--exclude");
if (exIdx !== -1) {
  for (const c of (argv[exIdx + 1] ?? "").split(",").filter(Boolean)) exclude.add(c);
  argv.splice(exIdx, 2);
}
const query = argv.join(" ").trim();
if (!query) {
  console.error('Usage: node script/find-precedent.ts <card-code | free text…> [-n N] [--exclude code,code]');
  process.exit(1);
}

const corpus = await loadCorpus();

// ---------- resolve the query to a text (and maybe a name) ----------
let queryText = query;
let queryName: string | undefined;
let queryLabel = "free text";
if (/^\d{5}[a-z]?$/.test(query)) {
  let found = corpus.find((c) => c.code === query);
  if (!found) {
    // scan worklists / raw inputs for a not-yet-confirmed card
    for (const dir of ["untagged", "input"]) {
      const d = join(root, "json", dir);
      let names: string[] = [];
      try {
        names = (await readdir(d)).filter((f) => f.endsWith(".json"));
      } catch {
        continue;
      }
      for (const f of names) {
        const arr = JSON.parse(await readFile(join(d, f), "utf8")) as Omit<Card, "pack">[];
        const hit = arr.find((c) => c.code === query);
        if (hit) {
          found = { ...hit, pack: `${dir}/${f.replace(/\.json$/, "")}` };
          break;
        }
      }
      if (found) break;
    }
  }
  if (!found) {
    console.error(`Card code ${query} not found in confirmed corpus or json/{untagged,input}/*.json`);
    process.exit(1);
  }
  queryText = found.text;
  queryName = found.name;
  queryLabel = `${found.name} (${found.code}) [${found.pack}]`;
}

// the precedent POOL excludes calibration cards (query resolution above used the full corpus)
const pool = corpus.filter((c) => !exclude.has(c.code));

// ---------- TF-IDF cosine ----------
function tokenize(text: string): string[] {
  const norm = text
    .toLowerCase()
    .replace(/<[^>]+>/g, " ") // <b>Forced</b> → forced
    .replace(/\[\[([^\]]+)\]\]/g, "trait_$1") // [[Monster]] → trait_monster
    .replace(/\[([a-z_ ]+)\]/g, "icon_$1"); // [action]/[elder_sign] → icon_action…
  const uni = norm.split(/[^a-z0-9_+]+/).filter((t) => t.length > 1);
  const grams = [...uni];
  for (let i = 0; i < uni.length - 1; i++) grams.push(uni[i] + " " + uni[i + 1]);
  return grams;
}
const docTokens = pool.map((c) => tokenize(c.text));
const df = new Map<string, number>();
for (const toks of docTokens) for (const t of new Set(toks)) df.set(t, (df.get(t) ?? 0) + 1);
const N = pool.length;
const idf = (t: string) => Math.log((N + 1) / ((df.get(t) ?? 0) + 1));
function vec(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
  const v = new Map<string, number>();
  for (const [t, f] of tf) v.set(t, (1 + Math.log(f)) * idf(t));
  return v;
}
function cosine(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0;
  const [small, large] = a.size < b.size ? [a, b] : [b, a];
  for (const [t, w] of small) dot += w * (large.get(t) ?? 0);
  const norm = (m: Map<string, number>) => Math.sqrt([...m.values()].reduce((s, w) => s + w * w, 0));
  return dot / (norm(a) * norm(b) || 1);
}
const qv = vec(tokenize(queryText));
const scored = pool
  .map((c, i) => ({ c, score: cosine(qv, vec(docTokens[i])) }))
  .filter(({ c, score }) => score > 0 && c.code !== query)
  .sort((a, b) => b.score - a.score);

// ---------- print ----------
const printCard = (c: Card, prefix = "") => {
  console.log(`${prefix}${c.name} (${c.code}) [${c.pack}]`);
  console.log(`  text: ${c.text.replace(/\n/g, "\n        ")}`);
  if (c.tags.length) for (const t of c.tags) console.log(`  tag:  ${JSON.stringify(t)}`);
  else console.log("  tag:  (none)");
  console.log();
};

console.log(`QUERY: ${queryLabel}`);
console.log(`  ${queryText.replace(/\n/g, "\n  ")}\n`);

if (queryName) {
  const twins = pool.filter((c) => c.name === queryName && c.code !== query);
  if (twins.length) {
    console.log(`== SAME NAME (${twins.length}) — level variants; check for convention drift ==`);
    for (const t of twins) printCard(t);
  }
}

console.log(`== TOP ${topN} SIMILAR CONFIRMED CARDS ==`);
for (const { c, score } of scored.slice(0, topN)) printCard(c, `${score.toFixed(3)}  `);
