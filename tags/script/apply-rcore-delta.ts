/**
 * One-off: apply the RCore review-batch delta to src/tagged-cards/rcore.ts.
 *
 *   - stat-derived icon tags (from level/type/icons): add nonskill-lv0-wild-icon and
 *     nonskill-lv0-two-effective-icons to qualifying level-0 non-skill cards; STRIP the
 *     wild tag only from definitively higher-level cards (so a card with unknown level,
 *     e.g. On the Lam, keeps it).
 *   - specific per-card additions: Ward of Protection cost-horror-self; Blinding Light
 *     (0) & (2) chaos-downside-action.
 *
 * Idempotent: each add is skipped if the card already carries that tag type.
 *   node ./script/apply-rcore-delta.ts
 */
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import rcore from "../dist/tagged-cards/rcore.js";

const here = dirname(fileURLToPath(import.meta.url));
const srcPath = join(here, "..", "src", "tagged-cards", "rcore.ts");

const NONSKILL = new Set(["asset", "event"]);
const has = (c, t) => c.tags.some((x) => x.type === t);

const WILD = "nonskill-lv0-wild-icon";
const TWO = "nonskill-lv0-two-effective-icons";

// Per-code injections (expression text → injected as a tag line if absent).
const addByCode = new Map(); // code -> Set of "memberName" markers + expr
const ensure = (code, marker, expr) => {
  if (!addByCode.has(code)) addByCode.set(code, []);
  addByCode.get(code).push({ marker, expr });
};
const stripWild = new Set();

for (const c of rcore) {
  const lvl0 = c.level === 0;
  const nonskill = NONSKILL.has(c.cardType ?? "");
  const icons = c.icons ?? [];
  // wild: add to definite lv0 non-skill wild; strip only from definite higher-level.
  if (lvl0 && nonskill && icons.includes("wild") && !has(c, WILD)) {
    ensure(c.code, "SkillCommitWildIcon", "{ type: TagTypeSkillCommit.SkillCommitWildIcon }");
  }
  if (has(c, WILD) && typeof c.level === "number" && c.level >= 1) stripWild.add(c.code);
  // two effective icons: lv0 non-skill with >=2 printed icons.
  if (lvl0 && nonskill && icons.length >= 2 && !has(c, TWO)) {
    ensure(c.code, "SkillCommitTwoEffectiveIcons", "{ type: TagTypeSkillCommit.SkillCommitTwoEffectiveIcons }");
  }
  // no commit icons: an EVENT with zero printed icons (rare/notable — can't be committed).
  if (c.cardType === "event" && icons.length === 0 && !has(c, "no-commit-icons")) {
    ensure(c.code, "SkillCommitNoIcons", "{ type: TagTypeSkillCommit.SkillCommitNoIcons }");
  }
}

// Per-code line REPLACEMENTS and REMOVALS (substring match within the card's block).
const replaceInCode = new Map([
  // Survival Instinct: the move applies to the PERFORMING investigator (true support).
  ["01581", [["LocationMoveInvestigatorSelf", "LocationMoveInvestigatorPerformer"]]],
]);
const removeInCode = new Map([
  // Soak, not self-harm: the damage/horror lands on the ASSET, not the investigator.
  ["01582", ["CostReactionHorrorSelf"]], // Aquinnah (1) — "take the horror onto its sanity"
  ["01691", ["CostReactionHorrorSelf"]], // Aquinnah (3) — "deal 1 horror to her"
  ["01528", ["CostOther.CostDamageSelf"]], // Beat Cop (2) — "deal 1 damage to it"
]);

// Specific per-card additions.
const wop = rcore.find((c) => c.code === "01565");
if (wop && !has(wop, "cost-horror-self"))
  ensure("01565", "CostHorrorSelf", "{ type: TagTypeCostOther.CostHorrorSelf }");
for (const code of ["01566", "01569"]) {
  const c = rcore.find((x) => x.code === code);
  if (c && !has(c, "chaos-downside-action"))
    ensure(code, "ChaosDownsideAction", "{ type: TagTypeChaosDownside.ChaosDownsideAction, value: 1 }");
}
// Proactive-audit fixes (same omission classes as the batch).
const scry = rcore.find((c) => c.code === "01690");
if (scry && !has(scry, "cost-horror-self"))
  ensure("01690", "CostHorrorSelf", "{ type: TagTypeCostOther.CostHorrorSelf }");
const bat = rcore.find((c) => c.code === "01574");
if (bat && !has(bat, "chaos-downside-discard"))
  ensure("01574", "ChaosDownsideDiscard", "{ type: TagTypeChaosDownside.ChaosDownsideDiscard }");

// ---- rewrite the .ts text ----
const lines = (await readFile(srcPath, "utf8")).split("\n");
const out = [];
let code = null;
let added = 0;
let stripped = 0;
let replaced = 0;
for (let line of lines) {
  const m = line.match(/^    code: "([^"]+)",/);
  if (m) code = m[1];
  // strip a wild-icon line on a card that no longer qualifies
  if (code && stripWild.has(code) && line.includes("SkillCommitWildIcon")) {
    stripped++;
    continue;
  }
  // remove a mis-applied tag line
  if (code && removeInCode.has(code) && removeInCode.get(code).some((s) => line.includes(s))) {
    stripped++;
    continue;
  }
  // replace a tag member on a specific card
  if (code && replaceInCode.has(code)) {
    for (const [from, to] of replaceInCode.get(code)) {
      if (line.includes(from)) {
        line = line.replace(from, to);
        replaced++;
      }
    }
  }
  out.push(line);
  if (/^    tags: \[/.test(line) && code && addByCode.has(code)) {
    for (const { expr } of addByCode.get(code)) {
      out.push(`      ${expr},`);
      added++;
    }
  }
}

await writeFile(srcPath, out.join("\n"));
console.log(`Applied: +${added} tags, -${stripped} removed, ~${replaced} replaced. stripWild: ${[...stripWild].join(", ")}`);
