/**
 * apply-tag-ops — apply a batch of card-level tag edits (the output of a review) to the typed
 * pack files, safely. Every tag is written as a plain object in the cards.json shape and
 * rendered to the exact TS expression (enum references, BasicAction / SkillType /
 * TimingQualifier members) — reviewers never hand-type enum names.
 *
 *   node ./script/apply-tag-ops.ts <ops.json> [--check]
 *
 *   --check   validate only (no writes): every op must name a real card, every removed /
 *             replaced tag must be on it, every added tag must be new and render cleanly
 *
 * ops.json is an array of:
 *   {
 *     "code": "01565",            // a card code, or "*" = every card that carries the `from` tag
 *     "name": "Ward of Protection", // optional guard: must match the card's name
 *     "note": "why",              // optional, echoed in the log
 *     "add":     [{ "type": "cancel-encounter-effect" }],
 *     "remove":  [{ "type": "cost-horror-self" }, { "type": "x", "where": { "value": 2 } }],
 *     "replace": [{ "from": { "type": "chaos-modifier", "where": { "treatAs": 0 } },
 *                   "to": [{ "type": "chaos-ignore-modifier" }] }]
 *   }
 * A `remove` / `from` matcher hits every tag of that type whose arguments include `where`.
 *
 * Flow: re-syncs json/untagged/<pack>.json from the typed files, edits the worklists, then
 * re-assembles only the touched packs. Needs a FRESH build (`yarn build`) because matching
 * reads the built corpus; run `yarn build && yarn lint-tags` afterwards and review the
 * compound ratchet.
 */
import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { loadCorpus, loadTagDefs, root, sameTag, srcDir, tagExpression, type CorpusTag } from "./lib.ts";

type Matcher = { type: string; where?: Record<string, unknown> };
type Op = {
  code: string;
  name?: string;
  note?: string;
  add?: CorpusTag[];
  remove?: Matcher[];
  replace?: { from: Matcher; to: CorpusTag[] }[];
};

const argv = process.argv.slice(2);
const check = argv.includes("--check");
const opsPath = argv.find((a) => !a.startsWith("--"));
if (!opsPath) {
  console.error("Usage: node script/apply-tag-ops.ts <ops.json> [--check]");
  process.exit(1);
}
const ops = JSON.parse(await readFile(opsPath, "utf8")) as Op[];

const defs = await loadTagDefs();
const corpus = await loadCorpus();
const byCode = new Map(corpus.map((c) => [c.code, c]));
const matches = (t: CorpusTag, m: Matcher) =>
  t.type === m.type && Object.entries(m.where ?? {}).every(([k, v]) => sameTag(t[k], v));

// ---------- plan: per card, the final tag list (as indices to keep + expressions to add) ----------
type Plan = {
  code: string;
  pack: string;
  keep: boolean[];
  insert: Map<number, string[]>;
  append: string[];
  /** Every tag this batch adds to the card (appended or replaced in) — for duplicate checks across ops. */
  added: CorpusTag[];
  log: string[];
};
const plans = new Map<string, Plan>();
const errors: string[] = [];
const planFor = (code: string) => {
  const c = byCode.get(code)!;
  if (!plans.has(code))
    plans.set(code, { code, pack: c.pack, keep: c.tags.map(() => true), insert: new Map(), append: [], added: [], log: [] });
  return plans.get(code)!;
};
const render = (t: CorpusTag, where: string): string | undefined => {
  try {
    return tagExpression(t, defs);
  } catch (e) {
    errors.push(`${where}: ${(e as Error).message}`);
    return undefined;
  }
};

for (const [n, op] of ops.entries()) {
  const at = `op #${n + 1}${op.code ? ` (${op.code})` : ""}`;
  const targets =
    op.code === "*"
      ? corpus.filter((c) => [...(op.remove ?? []), ...(op.replace ?? []).map((r) => r.from)].some((m) => c.tags.some((t) => matches(t, m))))
      : [byCode.get(op.code)].filter((c) => c !== undefined);
  if (!targets.length) {
    errors.push(`${at}: ${op.code === "*" ? "no card carries the matched tag" : "no such card code"}`);
    continue;
  }
  for (const card of targets) {
    if (op.name && op.code !== "*" && op.name !== card.name) {
      errors.push(`${at}: code ${card.code} is "${card.name}", not "${op.name}"`);
      continue;
    }
    const p = planFor(card.code);
    const label = `${card.code} ${card.name}`;
    for (const m of op.remove ?? []) {
      const hit = card.tags.map((t, i) => (matches(t, m) && p.keep[i] ? i : -1)).filter((i) => i >= 0);
      if (!hit.length && op.code !== "*") errors.push(`${at}: ${label} has no ${JSON.stringify(m)} to remove`);
      for (const i of hit) p.keep[i] = false;
      if (hit.length) p.log.push(`- ${hit.map((i) => JSON.stringify(card.tags[i])).join(", ")}`);
    }
    for (const r of op.replace ?? []) {
      const i = card.tags.findIndex((t, j) => matches(t, r.from) && p.keep[j]);
      if (i < 0) {
        if (op.code !== "*") errors.push(`${at}: ${label} has no ${JSON.stringify(r.from)} to replace`);
        continue;
      }
      const exprs = r.to.map((t) => render(t, at)).filter((e): e is string => !!e);
      p.keep[i] = false;
      p.insert.set(i, [...(p.insert.get(i) ?? []), ...exprs]);
      p.added.push(...r.to);
      p.log.push(`~ ${JSON.stringify(card.tags[i])} → ${r.to.map((t) => JSON.stringify(t)).join(", ")}`);
    }
    for (const t of op.add ?? []) {
      if (card.tags.some((x, i) => p.keep[i] && sameTag(x, t)) || p.added.some((x) => sameTag(x, t))) {
        errors.push(`${at}: ${label} already has ${JSON.stringify(t)}`);
        continue;
      }
      const e = render(t, at);
      if (e) {
        p.append.push(e);
        p.added.push(t);
        p.log.push(`+ ${JSON.stringify(t)}${op.note ? `   (${op.note})` : ""}`);
      }
    }
  }
}

// the worklists (re-synced from the typed files) must match the BUILT corpus the plan was made
// against — a mismatch means src/tagged-cards changed since the last `yarn build`
const packs = [...new Set([...plans.values()].map((p) => p.pack))].sort();
if (packs.length) execFileSync("node", [join(root, "script", "sync-worklists.ts"), ...packs], { stdio: "ignore" });
const worklists = new Map<string, { code: string; tags: string[] }[]>();
for (const pack of packs) {
  const rows = JSON.parse(await readFile(join(root, "json", "untagged", `${pack}.json`), "utf8")) as { code: string; tags: string[] }[];
  worklists.set(pack, rows);
  for (const row of rows) {
    const p = plans.get(row.code);
    if (p && row.tags.length !== p.keep.length)
      errors.push(`${row.code}: src has ${row.tags.length} tags but the build has ${p.keep.length} — run \`yarn build\` first`);
  }
}

for (const p of plans.values()) {
  console.log(`${p.code} ${byCode.get(p.code)!.name} [${p.pack}]`);
  for (const l of p.log) console.log(`  ${l}`);
}
if (errors.length) {
  console.error(`\n✗ ${errors.length} problem(s):\n  ${errors.join("\n  ")}`);
  process.exit(1);
}
console.log(`\n${plans.size} card(s), ${ops.length} op(s) — ${check ? "check passed, nothing written" : "applying"}`);
if (check) process.exit(0);

// ---------- apply via the worklists ----------
for (const pack of packs) {
  const path = join(root, "json", "untagged", `${pack}.json`);
  const rows = worklists.get(pack)!;
  for (const row of rows) {
    const p = plans.get(row.code);
    if (!p) continue;
    const out: string[] = [];
    row.tags.forEach((e, i) => {
      if (p.keep[i]) out.push(e);
      out.push(...(p.insert.get(i) ?? []));
    });
    row.tags = [...out, ...p.append];
  }
  await writeFile(path, JSON.stringify(rows, null, 1) + "\n");
  execFileSync("node", [join(root, "script", "assemble-tagged-cards.ts"), path, join(srcDir, "tagged-cards", `${pack}.ts`)], {
    stdio: "ignore",
  });
}
console.log(`Re-assembled: ${packs.join(", ")}. Next: yarn build && yarn lint-tags (review the compound ratchet).`);
