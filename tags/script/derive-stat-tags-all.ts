/**
 * Cross-pack stat-derived icon tags (idempotent; safe to re-run, rcore already correct).
 * For every pack file: add nonskill-lv0-wild-icon / nonskill-lv0-two-effective-icons /
 * no-commit-icons to qualifying cards, and STRIP the wild tag from definitively
 * higher-level (>=1) cards that carry the old over-applied tag. All target files already
 * import TagTypeSkillCommit.
 *
 *   node ./script/derive-stat-tags-all.ts
 */
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { allTaggedCards } from "../dist/tagged-cards/index.js";

const here = dirname(fileURLToPath(import.meta.url));
const dir = join(here, "..", "src", "tagged-cards");
const PACKS = ["rcore", "dwl", "ptc", "tfa", "nat", "har", "win", "jac", "ste"];

const NONSKILL = new Set(["asset", "event"]);
const has = (c, t) => c.tags.some((x) => x.type === t);
const WILD = "nonskill-lv0-wild-icon";
const TWO = "nonskill-lv0-two-effective-icons";
const NOIC = "no-commit-icons";

const addByCode = new Map();
const ensure = (code, expr) => {
  if (!addByCode.has(code)) addByCode.set(code, []);
  addByCode.get(code).push(expr);
};
const stripWild = new Set();

for (const c of allTaggedCards) {
  const lvl0 = c.level === 0;
  const ns = NONSKILL.has(c.cardType ?? "");
  const ic = c.icons ?? [];
  if (lvl0 && ns && ic.includes("wild") && !has(c, WILD))
    ensure(c.code, "{ type: TagTypeSkillCommit.SkillCommitWildIcon }");
  if (has(c, WILD) && typeof c.level === "number" && c.level >= 1) stripWild.add(c.code);
  if (lvl0 && ns && ic.length >= 2 && !has(c, TWO))
    ensure(c.code, "{ type: TagTypeSkillCommit.SkillCommitTwoEffectiveIcons }");
  if (c.cardType === "event" && ic.length === 0 && !has(c, NOIC))
    ensure(c.code, "{ type: TagTypeSkillCommit.SkillCommitNoIcons }");
}

let added = 0;
let stripped = 0;
for (const pack of PACKS) {
  const path = join(dir, `${pack}.ts`);
  const lines = (await readFile(path, "utf8")).split("\n");
  const out = [];
  let code = null;
  for (const line of lines) {
    const m = line.match(/^    code: "([^"]+)",/);
    if (m) code = m[1];
    if (code && stripWild.has(code) && line.includes("SkillCommitWildIcon")) {
      stripped++;
      continue;
    }
    out.push(line);
    if (/^    tags: \[/.test(line) && code && addByCode.has(code)) {
      for (const expr of addByCode.get(code)) {
        out.push(`      ${expr},`);
        added++;
      }
    }
  }
  await writeFile(path, out.join("\n"));
}
console.log(`Stat-derived: +${added} tags, -${stripped} stale wild tags.`);
