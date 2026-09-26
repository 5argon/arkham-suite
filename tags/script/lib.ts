/**
 * Shared helpers for the tags maintenance scripts: package paths, the built corpus, and
 * command-line flags.
 */
import { readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

export const root = join(dirname(fileURLToPath(import.meta.url)), "..");
export const srcDir = join(root, "src");
export const distDir = join(root, "dist");
export const referenceDir = join(root, "reference");
export const tagsDir = join(srcDir, "tags");

export interface CorpusTag {
  type: string;
  [k: string]: unknown;
}

export interface CorpusCard {
  code: string;
  name: string;
  text: string;
  level?: number;
  cardType?: string;
  subtype?: "weakness" | "basicweakness";
  icons?: string[];
  tags: CorpusTag[];
  /** The `src/tagged-cards/<pack>.ts` file the card comes from. */
  pack: string;
}

/** The pack ids with a `src/tagged-cards/<pack>.ts` file (dist may hold stale packs). */
export async function listPacks(): Promise<string[]> {
  return (await readdir(join(srcDir, "tagged-cards")))
    .filter((f) => f.endsWith(".ts") && f !== "index.ts")
    .map((f) => f.replace(/\.ts$/, ""))
    .sort();
}

/** Every tagged card from the BUILT package (run `yarn build` first), stamped with its pack. */
export async function loadCorpus(): Promise<CorpusCard[]> {
  const corpus: CorpusCard[] = [];
  for (const pack of await listPacks()) {
    const mod = await import(join(distDir, "tagged-cards", `${pack}.js`));
    for (const c of mod.default as Omit<CorpusCard, "pack">[]) corpus.push({ ...c, pack });
  }
  return corpus;
}

/** Every tag-definition source file under `src/tags` (excluding the barrels), sorted. */
export async function listTagFiles(): Promise<string[]> {
  const entries = await readdir(tagsDir, { recursive: true, withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name.endsWith(".ts") && e.name !== "index.ts")
    .map((e) => join(e.parentPath, e.name))
    .sort();
}

/** The value following `--name` on the command line, or undefined. */
export function flagValue(argv: string[], name: string): string | undefined {
  const i = argv.indexOf(name);
  return i === -1 ? undefined : argv[i + 1];
}

// ---------- text similarity (TF-IDF cosine over unigrams + bigrams) ----------

/** Card text → tokens: lowercased unigrams + bigrams; traits and icons kept as distinct tokens. */
export function tokenize(text: string): string[] {
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

export type SparseVec = Map<string, number>;

/** A TF-IDF index over `texts`: the documents' vectors plus a vectorizer for new text. */
export function tfidfIndex(texts: string[]): { docs: SparseVec[]; vectorize: (text: string) => SparseVec } {
  const docTokens = texts.map(tokenize);
  const df = new Map<string, number>();
  for (const toks of docTokens) for (const t of new Set(toks)) df.set(t, (df.get(t) ?? 0) + 1);
  const n = texts.length;
  const idf = (t: string) => Math.log((n + 1) / ((df.get(t) ?? 0) + 1));
  const vec = (tokens: string[]): SparseVec => {
    const tf = new Map<string, number>();
    for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
    const v: SparseVec = new Map();
    for (const [t, f] of tf) v.set(t, (1 + Math.log(f)) * idf(t));
    return v;
  };
  return { docs: docTokens.map(vec), vectorize: (text) => vec(tokenize(text)) };
}

export function cosine(a: SparseVec, b: SparseVec): number {
  let dot = 0;
  const [small, large] = a.size < b.size ? [a, b] : [b, a];
  for (const [t, w] of small) dot += w * (large.get(t) ?? 0);
  const norm = (m: SparseVec) => Math.sqrt([...m.values()].reduce((s, w) => s + w * w, 0));
  return dot / (norm(a) * norm(b) || 1);
}

// ---------- tag definitions parsed from src/tags ----------

export interface TagDef {
  id: string;
  /** The enum reference written in src/tagged-cards, e.g. "TagTypeHeal.HealDamageYou". */
  ref: string;
  /** Group = top-level folder under src/tags. */
  group: string;
  file: string;
  /** The interface's JSDoc, comment markers stripped ("" when none). */
  doc: string;
  /** Argument name → declared TS type (own + inherited fields, `type` excluded). */
  fields: Record<string, { type: string; optional: boolean }>;
}

/** Every tag id defined under src/tags, with its enum reference, JSDoc and argument types. */
export async function loadTagDefs(): Promise<Map<string, TagDef>> {
  const { readFile } = await import("node:fs/promises");
  const defs = new Map<string, TagDef>();
  for (const file of await listTagFiles()) {
    const src = await readFile(file, "utf8");
    const group = file.slice(tagsDir.length + 1).split(/[\\/]/)[0];
    const refOf = new Map<string, string>(); // "TagTypeX.Member" → id
    for (const em of src.matchAll(/export enum (TagType\w+)\s*\{([^}]*)\}/g))
      for (const mm of em[2].matchAll(/(\w+)\s*=\s*"([a-z0-9][a-z0-9-]*)"/g)) refOf.set(`${em[1]}.${mm[1]}`, mm[2]);
    type Iface = { doc: string; parents: string[]; fields: TagDef["fields"]; typeRef?: string };
    const ifaces = new Map<string, Iface>();
    // a body is either `{}` on one line or runs to the next `}` at column 0
    const ifaceRe = /(\/\*\*(?:(?!\*\/)[\s\S])*\*\/\s*)?(?:export\s+)?interface\s+(\w+)(?:\s+extends\s+([\w\s,]+?))?\s*(?:\{\s*\}|\{([\s\S]*?)\n\})/g;
    for (const m of src.matchAll(ifaceRe)) {
      const fields: TagDef["fields"] = {};
      let typeRef: string | undefined;
      for (const seg of topLevelMembers(m[4] ?? "")) {
        const fm = /^(\w+)(\?)?:\s*([\s\S]+?);?$/.exec(seg);
        if (!fm) continue;
        const type = fm[3].replace(/\s+/g, " ").trim();
        if (fm[1] === "type") typeRef = type;
        else fields[fm[1]] = { type, optional: fm[2] === "?" };
      }
      const doc = (m[1] ?? "")
        .replace(/^\s*\/\*\*|\*\/\s*$/g, "")
        .split("\n")
        .map((l) => l.replace(/^\s*\*\s?/, "").trim())
        .filter(Boolean)
        .join(" ");
      ifaces.set(m[2], { doc, parents: (m[3] ?? "").split(",").map((s) => s.trim()).filter(Boolean), fields, typeRef });
    }
    const allFields = (name: string): TagDef["fields"] => {
      const i = ifaces.get(name);
      if (!i) return {};
      return Object.assign({}, ...i.parents.map(allFields), i.fields);
    };
    for (const [name, i] of ifaces) {
      const id = i.typeRef && refOf.get(i.typeRef);
      if (id) defs.set(id, { id, ref: i.typeRef!, group, file, doc: i.doc, fields: allFields(name) });
    }
    for (const [ref, id] of refOf)
      if (!defs.has(id)) defs.set(id, { id, ref, group, file, doc: "", fields: {} });
  }
  return defs;
}

/** An interface body's top-level members (comments stripped; multi-line types kept whole). */
function topLevelMembers(body: string): string[] {
  const clean = body.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
  const out: string[] = [];
  let cur = "";
  let depth = 0;
  for (const line of clean.split("\n")) {
    if (depth === 0 && /^\s*\w+\??:/.test(line) && cur.trim()) {
      out.push(cur.trim());
      cur = "";
    }
    cur += line + "\n";
    for (const ch of line) depth += "{([".includes(ch) ? 1 : "})]".includes(ch) ? -1 : 0;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

/** Enum-typed argument values: the enum's string value → member name. */
const ENUM_MEMBERS: Record<string, Record<string, string>> = {
  BasicAction: { fight: "Fight", investigate: "Investigate", evade: "Evade", move: "Move", parley: "Parley", resign: "Resign", play: "Play", draw: "Draw", resource: "Resource" },
  SkillType: { willpower: "Willpower", combat: "Combat", intellect: "Intellect", agility: "Agility" },
  SkillIcon: { will: "Willpower", combat: "Combat", intellect: "Intellect", agility: "Agility", wild: "Wild" },
  TimingQualifier: { before: "Before", when: "When", "at/if": "AtIf", after: "After" },
};

function literal(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(literal).join(", ")}]`;
  if (v !== null && typeof v === "object")
    return `{ ${Object.entries(v).map(([k, x]) => `${k}: ${literal(x)}`).join(", ")} }`;
  return JSON.stringify(v);
}

/**
 * Render a plain tag object (the cards.json shape, e.g. `{ type: "heal-damage-you", value: 1 }`)
 * as the TS object-literal expression used in src/tagged-cards. Throws on an unknown tag id,
 * an argument the tag doesn't declare, or a value its enum-typed argument doesn't have.
 */
export function tagExpression(tag: CorpusTag, defs: Map<string, TagDef>): string {
  const def = defs.get(tag.type);
  if (!def) throw new Error(`unknown tag id "${tag.type}"`);
  const parts = [`type: ${def.ref}`];
  for (const [k, v] of Object.entries(tag)) {
    if (k === "type") continue;
    const field = def.fields[k];
    if (!field) throw new Error(`${tag.type} has no argument "${k}" (declared: ${Object.keys(def.fields).join(", ") || "none"})`);
    // kohaku's TestingBasicAction is a BasicAction subset
    const enumName = /^(Testing)?BasicAction$/.test(field.type) ? "BasicAction" : Object.keys(ENUM_MEMBERS).find((e) => field.type === e);
    if (enumName) {
      const member = ENUM_MEMBERS[enumName][String(v)];
      if (!member) throw new Error(`${tag.type}.${k}: "${v}" is not a ${enumName} value`);
      parts.push(`${k}: ${enumName}.${member}`);
    } else parts.push(`${k}: ${literal(v)}`);
  }
  return `{ ${parts.join(", ")} }`;
}

/** Structural equality of two tag objects / argument values. */
export function sameTag(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
  const ka = Object.keys(a), kb = Object.keys(b);
  return ka.length === kb.length && ka.every((k) => sameTag((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]));
}

/** messages/en.json — the display names and descriptions. */
export async function loadMessages(): Promise<Record<string, string>> {
  const { readFile } = await import("node:fs/promises");
  return JSON.parse(await readFile(join(root, "messages", "en.json"), "utf8"));
}
export const i18nKey = (id: string) => id.replace(/^c-/, "").replaceAll("-", "_");
