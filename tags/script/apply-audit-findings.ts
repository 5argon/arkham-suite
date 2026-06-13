/**
 * Apply the cross-pack text-audit findings (json/audit-findings.json) deterministically.
 * Each finding: { code, cls, op:"add"|"remove", tag:<kebab>, value:number|null, reason }.
 * "FLAG" tags are skipped (handled manually). Maps kebab → enum ref via the source enums,
 * edits the right pack file's card block, and ensures the enum is imported.
 *
 *   node ./script/apply-audit-findings.ts
 */
import { readFile, writeFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const tagsDir = join(here, "..", "src", "tags");
const cardsDir = join(here, "..", "src", "tagged-cards");

// 1. kebab tag-type -> { enum, member }
const typeMap = {};
async function walk(d) {
  for (const e of await readdir(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) await walk(p);
    else if (e.name.endsWith(".ts")) {
      const s = await readFile(p, "utf8");
      for (const [, en, body] of s.matchAll(/export enum (TagType\w+) \{([^}]*)\}/g))
        for (const m of body.matchAll(/(\w+)\s*=\s*"([^"]+)"/g)) typeMap[m[2]] = { enum: en, member: m[1] };
    }
  }
}
await walk(tagsDir);

// 2. code -> pack file
const PACKS = ["dwl", "ptc", "tfa", "nat", "har", "win", "jac", "ste", "rcore"];
const codeToPack = new Map();
const fileText = new Map();
for (const pack of PACKS) {
  const t = await readFile(join(cardsDir, `${pack}.ts`), "utf8");
  fileText.set(pack, t);
  for (const m of t.matchAll(/^    code: "([^"]+)",/gm)) codeToPack.set(m[1], pack);
}

// 3. group findings
const findings = JSON.parse(await readFile(join(here, "..", "json", "audit-findings.json"), "utf8"));
const byPack = new Map(); // pack -> code -> {adds:[expr], removes:[member]}
let skipped = 0;
for (const f of findings) {
  if (f.tag === "FLAG") { skipped++; continue; }
  const ref = typeMap[f.tag];
  if (!ref) { console.warn("UNKNOWN tag", f.tag, "on", f.code); skipped++; continue; }
  const pack = codeToPack.get(f.code);
  if (!pack) { console.warn("UNKNOWN code", f.code); skipped++; continue; }
  if (!byPack.has(pack)) byPack.set(pack, new Map());
  const m = byPack.get(pack);
  if (!m.has(f.code)) m.set(f.code, { adds: [], removes: [], enums: new Set() });
  const slot = m.get(f.code);
  if (f.op === "remove") slot.removes.push(ref.member);
  else {
    const expr = typeof f.value === "number"
      ? `{ type: ${ref.enum}.${ref.member}, value: ${f.value} }`
      : `{ type: ${ref.enum}.${ref.member} }`;
    slot.adds.push({ expr, member: ref.member, enum: ref.enum });
    slot.enums.add(ref.enum);
  }
}

// 4. rewrite each affected file (block-aware), then ensure imports
let nAdd = 0, nRemove = 0;
for (const [pack, codes] of byPack) {
  let lines = fileText.get(pack).split("\n");
  const out = [];
  let buf = null, code = null;
  const flush = () => {
    if (!buf) return;
    let b = buf;
    const job = codes.get(code);
    if (job) {
      if (job.removes.length) b = b.filter((l) => !job.removes.some((mem) => l.includes(`.${mem} `) || l.includes(`.${mem},`) || l.includes(`.${mem}}`)));
      if (job.adds.length) {
        const i = b.findIndex((l) => /^    tags: \[/.test(l));
        for (const a of job.adds) {
          if (!b.some((l) => l.includes(`.${a.member} `) || l.includes(`.${a.member},`) || l.includes(`.${a.member}}`))) {
            b.splice(i + 1, 0, `      ${a.expr},`);
            nAdd++;
          }
        }
      }
      nRemove += job.removes.length;
    }
    out.push(...b); buf = null; code = null;
  };
  for (const line of lines) {
    if (/^  \{$/.test(line)) { flush(); buf = [line]; continue; }
    if (buf) { buf.push(line); const m = line.match(/^    code: "([^"]+)"/); if (m) code = m[1]; if (/^  \},$/.test(line)) flush(); continue; }
    out.push(line);
  }
  flush();
  let text = out.join("\n");

  // ensure imports for any enum referenced by adds
  const needed = new Set();
  for (const { enums } of codes.values()) for (const e of enums) needed.add(e);
  const importMatch = text.match(/^import \{\n([\s\S]*?)\n\} from "\.\.\/tags\/index\.js";/m);
  if (importMatch) {
    const have = new Set(importMatch[1].split("\n").map((l) => l.trim().replace(/,$/, "")).filter(Boolean));
    const missing = [...needed].filter((e) => !have.has(e));
    if (missing.length) {
      const merged = [...have, ...missing].sort();
      text = text.replace(importMatch[0], `import {\n${merged.map((e) => `  ${e},`).join("\n")}\n} from "../tags/index.js";`);
    }
  }
  await writeFile(join(cardsDir, `${pack}.ts`), text);
}
console.log(`Applied: +${nAdd} adds, -${nRemove} removes, ${skipped} skipped (FLAG/unknown).`);
