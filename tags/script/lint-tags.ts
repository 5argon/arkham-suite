/**
 * lint-tags — deterministic checks encoding every mechanically-detectable fix-class from the
 * tagging review ledger (reference/rulings.json is the judgment-side twin of this file).
 * Heuristics have RECALL that agent sweeps historically lacked (the chaos-downside class was
 * found 0/8 by agents, 8/8 by a word-heuristic); an agent/human then adjudicates each flag.
 *
 * Usage:
 *   node script/lint-tags.ts [--pack <pack>] [--snapshot]
 *
 *   --pack <pack>   only report findings on cards of that pack (corpus-wide checks like
 *                   twin-divergence still consider all packs, but only report groups that
 *                   touch the pack)
 *   --snapshot      write reference/compound-membership.json (the compound ratchet baseline)
 *                   and exit
 *
 * Severities: ERROR = violates a hard convention; WARN = needs adjudication (allowlist it in
 * reference/lint-allow.json once ruled legit); INFO = FYI, never fails the run.
 * Exit code 1 when any ERROR or non-allowlisted WARN remains.
 *
 * Allowlist entry: { "rule": "<check-id>", "key": "<card-code | card-name>", "note": "why" }
 *
 * Reads the BUILT package (dist/) — run `yarn build` first.
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");

// ---------- args ----------
const argv = process.argv.slice(2);
const snapshot = argv.includes("--snapshot");
const packIdx = argv.indexOf("--pack");
const onlyPack = packIdx !== -1 ? argv[packIdx + 1] : undefined;

// ---------- load corpus per pack ----------
type Tag = { type: string; [k: string]: unknown };
type Card = {
  code: string;
  name: string;
  text: string;
  level?: number;
  cardType?: string;
  icons?: string[];
  tags: Tag[];
  pack: string;
};
const corpus: Card[] = [];
// enumerate packs from src (dist may hold stale .js from removed packs)
const packDir = join(root, "dist", "tagged-cards");
const packs = (await readdir(join(root, "src", "tagged-cards")))
  .filter((f) => f.endsWith(".ts") && f !== "index.ts")
  .map((f) => f.replace(/\.ts$/, ""))
  .sort();
for (const pack of packs) {
  const mod = await import(join(packDir, `${pack}.js`));
  for (const c of mod.default as Omit<Card, "pack">[]) corpus.push({ ...c, pack });
}
const { resolveCompounds } = await import("../dist/index.js");

// ---------- compound snapshot mode ----------
const snapshotPath = join(root, "reference", "compound-membership.json");
const currentCompounds = (): Record<string, string[]> => {
  const map: Record<string, string[]> = {};
  for (const c of corpus) {
    for (const ct of resolveCompounds(c.tags as never) as string[]) {
      (map[ct] ??= []).push(c.code);
    }
  }
  for (const k of Object.keys(map)) map[k].sort();
  return Object.fromEntries(Object.entries(map).sort(([a], [b]) => a.localeCompare(b)));
};
if (snapshot) {
  await writeFile(snapshotPath, JSON.stringify(currentCompounds(), null, 2) + "\n");
  console.log(`Wrote ${snapshotPath} (compound ratchet baseline)`);
  process.exit(0);
}

// ---------- allowlist ----------
type Allow = { rule: string; key: string; note?: string };
let allow: Allow[] = [];
try {
  allow = JSON.parse(await readFile(join(root, "reference", "lint-allow.json"), "utf8"));
} catch {
  /* no allowlist yet */
}
const isAllowed = (rule: string, ...keys: string[]) =>
  allow.some((a) => a.rule === rule && keys.includes(a.key));

// ---------- findings ----------
type Level = "ERROR" | "WARN" | "INFO";
const findings: { level: Level; rule: string; card?: Card; msg: string }[] = [];
let suppressed = 0;
function report(level: Level, rule: string, card: Card | undefined, msg: string) {
  if (card && onlyPack && card.pack !== onlyPack) return;
  if (card && isAllowed(rule, card.code, card.name)) {
    suppressed++;
    return;
  }
  findings.push({ level, rule, card, msg });
}
const has = (c: Card, pred: (t: Tag) => boolean) => c.tags.some(pred);
const typeIs = (prefix: string) => (t: Tag) => t.type.startsWith(prefix);
const typeEq = (id: string) => (t: Tag) => t.type === id;

// ---------- per-card checks ----------
for (const c of corpus) {
  const text = c.text ?? "";

  // dup-identical: two byte-identical tags carry no information (ledger: dedup convention)
  const seen = new Set<string>();
  for (const t of c.tags) {
    const k = JSON.stringify(t, Object.keys(t).sort());
    if (seen.has(k)) report("ERROR", "dup-identical", c, `duplicate identical tag ${k}`);
    seen.add(k);
  }

  // dynamic-sentinel: -1 sentinels are retired; variable amounts are "dynamic"
  for (const t of c.tags) {
    for (const [k, v] of Object.entries(t)) {
      if (v === -1) report("ERROR", "dynamic-sentinel", c, `${t.type}.${k} = -1 (use "dynamic")`);
    }
  }

  // ammo-charge: the "guns spending charges" class (2026-07-03 split)
  const usesAmmo = /uses\s*\((?:\d+|x)\s+ammo\)/i.test(text) || /\bammo\b/i.test(text);
  if (has(c, typeEq("cost-action-spend-charge")) && usesAmmo)
    report("ERROR", "ammo-charge", c, "spends charge but text says ammo → cost-action-spend-ammo");
  if (has(c, typeEq("cost-action-spend-ammo")) && !usesAmmo)
    report("WARN", "ammo-charge", c, "cost-action-spend-ammo but no 'ammo' in text");

  // replenish-cap: uses-replenish requires an explicit cap; 'replenish' text requires the tag
  const saysReplenish = /replenish/i.test(text);
  const hasLimit = /limit\b/i.test(text);
  if (has(c, typeEq("uses-replenish")) && !saysReplenish && !hasLimit)
    report("WARN", "replenish-cap", c, "uses-replenish but no 'replenish'/'Limit' in text (uncapped self-refund → uses-self-place)");
  if (saysReplenish && !has(c, typeEq("uses-replenish")))
    report("WARN", "replenish-cap", c, "'replenish' in text but no uses-replenish tag");

  // selfharm-soak: 'deal X to IT/HER' is soak routing, not a self-harm cost (Aquinnah class)
  if (has(c, typeIs("soak-")) && has(c, (t) => /^cost-(?:free-|reaction-)?(damage|horror)-self$/.test(t.type)))
    report("WARN", "selfharm-soak", c, "both soak-* and a self-harm cost — if text deals to IT/THIS, drop the self-harm tag");

  // margin-rider: 'succeed by N' riders get skill-value-* ONLY
  if (has(c, typeIs("skill-value-succeed-by")) && has(c, typeIs("skill-test-condition-successful")))
    report("WARN", "margin-rider", c, "skill-value-succeed-by-* alongside skill-test-condition-successful* (margin-only riders get skill-value only)");
  if (has(c, typeIs("skill-value-fail-by")) && has(c, typeEq("skill-test-condition-fail")))
    report("WARN", "margin-rider", c, "skill-value-fail-by-* alongside skill-test-condition-fail");

  // own-action-defeat: defeat riders on the card's own attack don't get the persistent window
  if (has(c, typeEq("timing-when-defeat-enemy")) && (has(c, typeEq("action-bold-fight")) || /\bFight\./.test(text)))
    report("WARN", "own-action-defeat", c, "timing-when-defeat-enemy on a card with its own Fight — own-action riders don't get the window");

  // trait-restriction-args: Weakness/Elite are not traits; bare tag is banned
  for (const t of c.tags.filter(typeEq("enemy-trait-restriction"))) {
    const trait = String(t.trait ?? "");
    if (!trait) report("ERROR", "trait-restriction-args", c, "enemy-trait-restriction with no trait arg");
    else if (/^(elite|weakness)$/i.test(trait))
      report("ERROR", "trait-restriction-args", c, `enemy-trait-restriction trait '${trait}' — use enemy-elite-* / enemy-nonweakness`);
  }

  // deck-restriction: signature 'X deck only.' line
  if (/deck only\./i.test(text) && !has(c, typeEq("deck-restriction")))
    report("WARN", "deck-restriction", c, "'deck only.' in text but no deck-restriction tag");

  // chaos-downside: the class agents found 0/8 of — flag reveal-window cards with a symbol penalty
  if (
    has(c, typeEq("timing-skill-st3-reveal-chaos-token")) &&
    /\[(skull|cultist|tablet|elder_thing|auto_?fail)\]/i.test(text) &&
    /(lose|discard|take \d+ (damage|horror)|deal \d+ (damage|horror) to your)/i.test(text) &&
    !has(c, typeIs("chaos-downside-")) &&
    !has(c, typeIs("chaos-symbol-payoff"))
  )
    report("WARN", "chaos-downside", c, "reveal window + symbol penalty text but no chaos-downside-* tag");

  // manual-reveal-st3: st3 is a SKILL-TEST step (ST.3); a pure manual-reveal gamble happens
  // outside any test (ruled 2026-07-13; Hypnotic Gaze/Astral Travel/Voice of Ra class)
  if (has(c, typeEq("chaos-reveal-manual")) && has(c, typeEq("timing-skill-st3-reveal-chaos-token")))
    report("WARN", "manual-reveal-st3", c, "chaos-reveal-manual + timing-skill-st3 — manual gambles are not skill tests; keep st3 only if the card ALSO interacts with in-test reveals");

  // both-values: same tag type+action with two different numeric values — legit for
  // 'N or M instead' replacements (allowlist those), a bug for equal-increment additives
  // (collapse to ceiling — Enchanted Blade class)
  const byTypeAction = new Map<string, Set<number>>();
  for (const t of c.tags) {
    if (typeof t.value !== "number") continue;
    const k = `${t.type}|${t.action ?? ""}`;
    (byTypeAction.get(k) ?? byTypeAction.set(k, new Set()).get(k)!).add(t.value);
  }
  for (const [k, vals] of byTypeAction) {
    if (vals.size > 1)
      report(
        "WARN",
        "both-values",
        c,
        `${k.split("|")[0]} has values {${[...vals].sort().join(",")}} — legit if 'N or M instead' replacement; a bug if additive (→ single ceiling)`,
      );
  }

  // stat-derived: nonskill-lv0-* tags must match level/cardType/icon metadata exactly
  const isNonskillLv0 = (c.cardType === "asset" || c.cardType === "event") && c.level === 0;
  const icons = c.icons ?? [];
  const wild = icons.filter((i) => i === "wild").length;
  const maxSame = Math.max(0, ...["willpower", "intellect", "combat", "agility"].map((s) => icons.filter((i) => i === s).length));
  const wantWild = isNonskillLv0 && wild > 0;
  const wantTwo = isNonskillLv0 && maxSame + wild >= 2;
  if (has(c, typeEq("skill-commit-nonskill-lv0-wild-icon")) !== wantWild)
    report("ERROR", "stat-derived", c, `skill-commit-nonskill-lv0-wild-icon ${wantWild ? "missing" : "present but rule says no"} (level=${c.level}, type=${c.cardType}, icons=${icons.join("/") || "none"})`);
  if (has(c, typeEq("skill-commit-nonskill-lv0-two-effective-icons")) !== wantTwo)
    report("ERROR", "stat-derived", c, `skill-commit-nonskill-lv0-two-effective-icons ${wantTwo ? "missing" : "present but rule says no"} (level=${c.level}, type=${c.cardType}, icons=${icons.join("/") || "none"})`);
  if (c.cardType === "event" && icons.length === 0 && !has(c, typeEq("skill-commit-no-commit-icons")))
    report("ERROR", "stat-derived", c, "event with zero icons missing skill-commit-no-commit-icons");
  // double-icon: 2+ of the SAME printed icon on a skill card, wild counting as its own type
  const wantDbl =
    c.cardType === "skill" &&
    Math.max(0, ...["willpower", "intellect", "combat", "agility", "wild"].map((s) => icons.filter((i) => i === s).length)) >= 2;
  if (has(c, typeEq("skill-commit-skill-double-icon")) !== wantDbl)
    report("ERROR", "stat-derived", c, `skill-commit-skill-double-icon ${wantDbl ? "missing" : "present but rule says no"} (icons=${icons.join("/") || "none"})`);
}

// ---------- twin divergence (corpus-wide; the level-variant drift class) ----------
const byName = new Map<string, Card[]>();
for (const c of corpus) (byName.get(c.name) ?? byName.set(c.name, []).get(c.name)!).push(c);
for (const [name, group] of byName) {
  if (group.length < 2) continue;
  if (onlyPack && !group.some((c) => c.pack === onlyPack)) continue;
  if (isAllowed("twins", name)) {
    suppressed++;
    continue;
  }
  // identical text ⇒ tags must match exactly (ERROR, per same-text subgroup); different
  // text (level variants) ⇒ report drift as INFO (may be a legit level difference).
  // Stat-derived tags are excluded from the same-text comparison: they depend on
  // level/icons, which same-text cards can still differ on (Extensive Research L0 vs L1);
  // the dedicated stat-derived check validates them against metadata exactly.
  const STAT_DERIVED = new Set([
    "skill-commit-nonskill-lv0-wild-icon",
    "skill-commit-nonskill-lv0-two-effective-icons",
    "skill-commit-no-commit-icons",
    "skill-commit-skill-double-icon",
  ]);
  const tagSet = (c: Card) =>
    new Set(c.tags.filter((t) => !STAT_DERIVED.has(t.type)).map((t) => JSON.stringify(t, Object.keys(t).sort())));
  const setsDiffer = (cards: Card[]) => {
    const base = tagSet(cards[0]);
    return cards.some((c) => {
      const s = tagSet(c);
      return s.size !== base.size || [...s].some((t) => !base.has(t));
    });
  };
  const detail = (cards: Card[]) =>
    cards
      .map((c) => `${c.code}[${c.pack}${c.level !== undefined ? ` L${c.level}` : ""}]: ${[...tagSet(c)].sort().join(" ")}`)
      .join("\n      ");
  const byText = new Map<string, Card[]>();
  for (const c of group) (byText.get(c.text) ?? byText.set(c.text, []).get(c.text)!).push(c);
  for (const sub of byText.values()) {
    if (sub.length >= 2 && setsDiffer(sub))
      report("ERROR", "twins", sub[0], `'${name}' SAME text but different tags:\n      ${detail(sub)}`);
  }
  if (byText.size > 1 && setsDiffer(group))
    report("INFO", "twins", group[0], `'${name}' variants' tags diverge (may be a legit level difference — verify):\n      ${detail(group)}`);
}

// ---------- singleton tags (corpus-wide INFO — creative-invention review list) ----------
const memberCount = new Map<string, Card[]>();
for (const c of corpus) for (const t of c.tags) (memberCount.get(t.type) ?? memberCount.set(t.type, []).get(t.type)!).push(c);
const singletons = [...memberCount.entries()].filter(([, cs]) => cs.length === 1);
if (!onlyPack && singletons.length)
  findings.push({
    level: "INFO",
    rule: "singleton-tags",
    msg: `${singletons.length} tags with exactly ONE member (fine, but each first application deserved scrutiny): ${singletons.map(([t, cs]) => `${t}→${cs[0].code}`).join(", ")}`,
  });

// ---------- compound ratchet: diff vs snapshot ----------
try {
  const prev = JSON.parse(await readFile(snapshotPath, "utf8")) as Record<string, string[]>;
  const cur = currentCompounds();
  const codeName = new Map(corpus.map((c) => [c.code, c.name]));
  for (const ct of new Set([...Object.keys(prev), ...Object.keys(cur)])) {
    const before = new Set(prev[ct] ?? []);
    const after = new Set(cur[ct] ?? []);
    const joined = [...after].filter((x) => !before.has(x));
    const left = [...before].filter((x) => !after.has(x));
    if (joined.length || left.length)
      findings.push({
        level: "INFO",
        rule: "compound-diff",
        msg: `${ct}: ${joined.length ? `JOINED ${joined.map((x) => `${codeName.get(x) ?? "?"} (${x})`).join(", ")}` : ""}${joined.length && left.length ? "; " : ""}${left.length ? `LEFT ${left.map((x) => `${codeName.get(x) ?? "?"} (${x})`).join(", ")}` : ""} — confirm each belongs/should leave, then re-run --snapshot`,
      });
  }
} catch {
  findings.push({ level: "INFO", rule: "compound-diff", msg: "no reference/compound-membership.json baseline — run with --snapshot to create the ratchet" });
}

// ---------- print ----------
const order: Level[] = ["ERROR", "WARN", "INFO"];
for (const level of order) {
  for (const f of findings.filter((f) => f.level === level)) {
    const where = f.card ? ` ${f.card.name} (${f.card.code}) [${f.card.pack}]` : "";
    console.log(`${level} ${f.rule}:${where} ${f.msg}`);
  }
}
const errors = findings.filter((f) => f.level === "ERROR").length;
const warns = findings.filter((f) => f.level === "WARN").length;
console.log(
  `\n${errors} error(s), ${warns} warning(s), ${findings.filter((f) => f.level === "INFO").length} info, ${suppressed} allowlisted${onlyPack ? ` (pack: ${onlyPack})` : ""} across ${corpus.length} cards`,
);
if (errors || warns) process.exitCode = 1;
