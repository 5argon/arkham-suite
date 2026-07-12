/**
 * Build reference/_taxonomy-digest.md — the single file handed to tagging/discovery agents,
 * containing everything decided so far:
 *
 *   1. Every tag-definition source file (exact TagType* enum references + argument shapes).
 *   2. Under each file, a USAGE & RULINGS block for every tag id it defines:
 *      - confirmed member cards (name, code, text snippet) — the tagging PRECEDENT,
 *      - convention rulings + anti-examples from reference/rulings.json (the migrated ledger).
 *   3. The compound-tag definitions, each with its EVALUATED member list (the compound
 *      blind spot: base tags never show which archetypes they roll into).
 *
 * Members/compounds come from the BUILT package (dist/) — run `yarn build` first, or the
 * digest will (loudly) degrade to definitions-only.
 *
 *   node ./script/build-digest.ts [--exclude code,code,…] [--bare] [--out path]
 *
 *   --exclude   omit these card codes from MEMBER lines and compound rosters (calibration
 *               mode: makes sampled cards invisible as their own precedent)
 *   --bare      definitions-only output (no members/rulings/compound rosters) — the
 *               pre-2026-07-13 digest format, kept for A/B harness experiments
 *   --out       write somewhere other than reference/_taxonomy-digest.md
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const tagsDir = join(root, "src", "tags");

const argv = process.argv.slice(2);
const flagVal = (name: string) => {
  const i = argv.indexOf(name);
  return i === -1 ? undefined : argv[i + 1];
};
const bare = argv.includes("--bare");
const exclude = new Set((flagVal("--exclude") ?? "").split(",").filter(Boolean));
const outPath = flagVal("--out") ?? join(root, "reference", "_taxonomy-digest.md");

// ---------- load tag-definition sources ----------
const entries = await readdir(tagsDir, { recursive: true, withFileTypes: true });
const files = entries
  .filter((e) => e.isFile() && e.name.endsWith(".ts") && e.name !== "index.ts")
  .map((e) => join(e.parentPath ?? (e as unknown as { path: string }).path, e.name))
  .sort();

// tag ids defined per file (string literal values inside `export enum TagType…`)
const idsOfFile = new Map<string, string[]>();
const allIds = new Set<string>();
for (const f of files) {
  const src = await readFile(f, "utf8");
  const ids: string[] = [];
  for (const enumBlock of src.matchAll(/export enum TagType\w*\s*\{([^}]*)\}/g)) {
    for (const m of enumBlock[1].matchAll(/=\s*"([a-z0-9][a-z0-9-]*)"/g)) ids.push(m[1]);
  }
  idsOfFile.set(f, ids);
  for (const id of ids) allIds.add(id);
}

// ---------- load confirmed cards + compound evaluation (from dist; degrade gracefully) ----------
type Card = { code: string; name: string; text: string; tags: { type: string }[] };
let cards: Card[] = [];
let compoundMembers = new Map<string, Card[]>();
try {
  const { allTaggedCards } = await import("../dist/tagged-cards/index.js");
  const { resolveCompounds } = await import("../dist/index.js");
  cards = (allTaggedCards as Card[]).filter((c) => !exclude.has(c.code));
  for (const c of cards) {
    for (const ct of resolveCompounds(c.tags as never) as string[]) {
      if (!compoundMembers.has(ct)) compoundMembers.set(ct, []);
      compoundMembers.get(ct)!.push(c);
    }
  }
} catch (e) {
  console.warn("⚠ dist/ not importable — digest will have NO member/compound data. Run `yarn build` first.");
  console.warn(String(e));
}
const membersOf = new Map<string, Card[]>();
for (const c of cards) {
  for (const t of c.tags) {
    if (!membersOf.has(t.type)) membersOf.set(t.type, []);
    membersOf.get(t.type)!.push(c);
  }
}

// ---------- load rulings (the migrated ledger) ----------
type Ruling = { rulings?: string[]; notMembers?: { card: string; reason: string; instead?: string }[] };
const rulingsRaw = JSON.parse(await readFile(join(root, "reference", "rulings.json"), "utf8")) as Record<
  string,
  Ruling | string[]
>;
const rulings = new Map<string, Ruling>();
for (const [key, val] of Object.entries(rulingsRaw)) {
  if (key === "_comment") continue;
  rulings.set(key, val as Ruling);
}
// validate every key resolves to a tag id (or a non-empty prefix)
const badKeys: string[] = [];
for (const key of rulings.keys()) {
  if (key === "_general") continue;
  if (key.endsWith("*")) {
    const prefix = key.slice(0, -1);
    if (![...allIds].some((id) => id.startsWith(prefix))) badKeys.push(key);
  } else if (!allIds.has(key)) badKeys.push(key);
}
if (badKeys.length) {
  console.error(`✗ rulings.json keys matching no tag id (typo or stale rename?): ${badKeys.join(", ")}`);
  process.exitCode = 1;
}
function rulingsFor(id: string): Ruling[] {
  const out: Ruling[] = [];
  for (const [key, r] of rulings) {
    if (key === "_general") continue;
    if (key === id || (key.endsWith("*") && id.startsWith(key.slice(0, -1)))) out.push(r);
  }
  return out;
}

// ---------- emit ----------
const snippet = (text: string, max = 170) => {
  const oneLine = text.replace(/\s*\n\s*/g, " | ");
  return oneLine.length > max ? oneLine.slice(0, max) + "…" : oneLine;
};

let out = "# Existing Tag Taxonomy Digest\n";
out += "# (auto-built by script/build-digest.ts; agents: DO NOT re-propose tags already here)\n";
out +=
  "# Per tag: definition source, then MEMBERS (confirmed precedent — cite one when applying the tag),\n" +
  "# RULING lines (binding conventions from past reviews), and NOT-MEMBERS (adjudicated anti-examples).\n\n";

const general = rulings.get("_general");
if (!bare && general?.rulings?.length) {
  out += "## GENERAL RULINGS (apply everywhere)\n";
  for (const r of general.rulings) out += `- ${r}\n`;
  out += "\n";
}

for (const f of files) {
  out += `==== FILE: src/tags/${relative(tagsDir, f)} ====\n`;
  out += (await readFile(f, "utf8")).trimEnd() + "\n";
  if (bare) {
    out += "\n";
    continue;
  }
  for (const id of idsOfFile.get(f) ?? []) {
    const members = membersOf.get(id) ?? [];
    out += `\n--- ${id} (${members.length} member${members.length === 1 ? "" : "s"}) ---\n`;
    if (members.length) {
      for (const m of members.slice(0, 3)) out += `MEMBER: ${m.name} (${m.code}) "${snippet(m.text)}"\n`;
      if (members.length > 3)
        out += `…and ${members.length - 3} more: ${members.slice(3, 10).map((m) => `${m.name} (${m.code})`).join(", ")}${members.length > 10 ? ", …" : ""}\n`;
    } else if (cards.length) {
      out += "MEMBER: (none yet — a first application needs extra scrutiny or a noFit flag)\n";
    }
    for (const r of rulingsFor(id)) {
      for (const line of r.rulings ?? []) out += `RULING: ${line}\n`;
      for (const nm of r.notMembers ?? [])
        out += `NOT A MEMBER: ${nm.card} — ${nm.reason}${nm.instead ? ` → use ${nm.instead}` : ""}\n`;
    }
  }
  out += "\n";
}

out += "==== FILE: src/compound-tags/compound-tags.ts ====\n";
out += (await readFile(join(root, "src", "compound-tags", "compound-tags.ts"), "utf8")).trimEnd() + "\n";
if (!bare && compoundMembers.size) {
  out += "\n## EVALUATED COMPOUND MEMBERSHIPS (who actually rolls into each archetype right now)\n";
  out +=
    "# When your base tags land a card in one of these, the card JOINS the list — check it belongs.\n";
  for (const [ct, ms] of [...compoundMembers.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    out += `${ct} (${ms.length}): ${ms.map((m) => `${m.name} (${m.code})`).join(", ")}\n`;
  }
}

await writeFile(outPath, out);
console.log(
  `Wrote ${outPath} (${files.length} tag files, ${allIds.size} tag ids, ` +
    `${cards.length} confirmed cards, ${compoundMembers.size} compounds, ${out.length} chars` +
    `${bare ? ", BARE" : ""}${exclude.size ? `, ${exclude.size} excluded` : ""})`,
);
