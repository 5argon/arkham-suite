/**
 * Re-derive the stat icon tags for a SCOPE of packs with the CORRECTED rules:
 *   - nonskill-lv0-wild-icon / two-effective require level === 0 EXACTLY (a "no level"
 *     card, e.g. undefined xp, is NOT level 0 — Search for the Truth).
 *   - two-effective means TWO icons toward the SAME skill: max(count of one skill) + wild
 *     >= 2. Two DIFFERENT icons (Taunt: willpower + combat) do NOT qualify.
 * Strips tags that no longer qualify; adds those that now do. Set SCOPE to the packs to rescan.
 *
 *   node ./script/rederive-icons-scoped.ts
 */
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { allTaggedCards } from "../dist/tagged-cards/index.js";

const here = dirname(fileURLToPath(import.meta.url));
const dir = join(here, "..", "src", "tagged-cards");
const SCOPE = ["rtnotz","rtdwl","rtptc","rttfa","rttcu"];

const NONSKILL = new Set(["asset", "event"]);
const byCode = new Map(allTaggedCards.map((c) => [c.code, c]));
const has = (c, t) => c.tags.some((x) => x.type === t);

const SKILLS = ["willpower", "intellect", "combat", "agility"];
function twoSameIcon(icons) {
  const wild = icons.filter((i) => i === "wild").length;
  const maxSame = Math.max(0, ...SKILLS.map((s) => icons.filter((i) => i === s).length));
  return maxSame + wild >= 2;
}

// per-code desired state
const want = new Map(); // code -> {wild:bool, two:bool, noic:bool}
for (const c of allTaggedCards) {
  const lvl0 = c.level === 0;
  const ns = NONSKILL.has(c.cardType ?? "");
  const ic = c.icons ?? [];
  want.set(c.code, {
    wild: lvl0 && ns && ic.includes("wild"),
    two: lvl0 && ns && twoSameIcon(ic),
    noic: c.cardType === "event" && ic.length === 0,
    // double-icon: 2+ of the SAME printed icon, wild counting as its own type
    // (Unexpected Courage wild×2 qualifies; 1 skill + 1 wild does not)
    dbl:
      c.cardType === "skill" &&
      Math.max(0, ...[...SKILLS, "wild"].map((s) => ic.filter((i) => i === s).length)) >= 2,
  });
}

const WILD = "SkillCommitWildIcon";
const TWO = "SkillCommitTwoEffectiveIcons";
const NOIC = "SkillCommitNoIcons";
const DBL = "SkillCommitDoubleIcon";
const expr = (m) => `      { type: TagTypeSkillCommit.${m} },`;

let added = 0,
  stripped = 0;
for (const pack of SCOPE) {
  const path = join(dir, `${pack}.ts`);
  const lines = (await readFile(path, "utf8")).split("\n");
  const out = [];
  let code = null;
  for (const line of lines) {
    const m = line.match(/^    code: "([^"]+)",/);
    if (m) code = m[1];
    const w = code ? want.get(code) : null;
    // strip tags that no longer qualify
    if (w && line.includes(WILD) && !w.wild) { stripped++; continue; }
    if (w && line.includes(TWO) && !w.two) { stripped++; continue; }
    out.push(line);
    if (/^    tags: \[/.test(line) && code) {
      const c = byCode.get(code);
      if (w.wild && !has(c, "skill-commit-nonskill-lv0-wild-icon")) { out.push(expr(WILD)); added++; }
      if (w.two && !has(c, "skill-commit-nonskill-lv0-two-effective-icons")) { out.push(expr(TWO)); added++; }
      if (w.noic && !has(c, "skill-commit-no-commit-icons")) { out.push(expr(NOIC)); added++; }
      if (w.dbl && !has(c, "skill-commit-skill-double-icon")) { out.push(expr(DBL)); added++; }
    }
  }
  await writeFile(path, out.join("\n"));
}
console.log(`Re-derived (${SCOPE.join("+")}): +${added} adds, -${stripped} strips.`);
