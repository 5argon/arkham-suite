/**
 * Seed messages/en.json (inlang message-format) with, for every tag group, tag type
 * and compound tag: a NAME key (humanized default) and a DESCRIPTION key. Group and
 * compound descriptions are hand-authored below; tag descriptions seed empty (an
 * editable surface). MERGE-safe: existing values are never overwritten.
 *
 *   yarn build && node ./script/seed-strings.ts
 *
 * Humanizing from kebab lives ONLY here (to bootstrap names) — never at runtime.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { tagTypeCategory } from "../dist/tag-category-map.js";
import { tagGroupIds } from "../dist/tag-group.js";
import { compoundTags } from "../dist/compound-tags/compound-tags.js";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const enPath = join(root, "messages", "en.json");

const humanize = (v: string) =>
  v
    .split("-")
    .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
const keyFor = (v: string) => v.replaceAll("-", "_");

// Friendly, hand-authored descriptions. Edit these (or messages/en.json directly).
const GROUP_DESCRIPTIONS: Record<string, string> = {
  action: "Taking, granting, or losing actions, and basic actions bundled into a card's ability.",
  aoo: "Attacks of opportunity — provoking them, or avoiding them.",
  attach: "Attaching this card to an asset, enemy, or location.",
  auto: "Automatic results — auto-success or auto-evade with no skill test.",
  buff: "Lingering status effects — swapping skills, raising an asset's max stats, or stopping enemies attacking you.",
  cancel: "Canceling or preventing things — attacks, damage, horror, draws, effects.",
  chaos: "The chaos bag — revealing, sealing, predicting, and manipulating tokens.",
  clue: "Clues — discovering extra clues, or placing them.",
  commit: "Committing skill cards — to others, from outside your hand, fetching, or limits.",
  condition: "Conditional gates — effects that need a resource / sanity / hand-size threshold.",
  cost: "Ability costs — the price paid before the colon of an action / reaction / free ability.",
  damage: "Dealing damage — bonus damage, redirection, spread, and instead-of effects.",
  deck: "Your deck — drawing, searching, discarding, shuffling, and looking at the top.",
  discard: "Discarding cards from play.",
  "discard-pile": "Getting cards back out of the discard pile (to hand, deck, or play).",
  doom: "Doom — adding, removing, or caring about doom.",
  duration: "How long an effect lasts.",
  enemy: "Interacting with enemies — engaging, debuffing, mitigating, and their values.",
  encounter: "The encounter deck and encounter cards.",
  exile: "Exile — removing a card from your collection on use (a campaign cost).",
  gain: "Gaining resources, moving them between players, or gaining keywords.",
  "hand-size": "Maximum hand size, and effects that scale with cards in hand.",
  heal: "Healing damage or horror — from yourself, another investigator, an ally, or this card.",
  location: "Locations — movement, connections, shroud, clues, and your-location effects.",
  multiclass: "Payoffs that scale with how many classes you have access to.",
  "play-area": "Moving cards into or out of play.",
  ready: "Readying (unexhausting) cards.",
  recursion: "Returning cards from the discard pile to play, hand, or deck.",
  remote: "Acting at a distance — investigate or move without being there.",
  rfg: "Removing a card from the game (one-shot, not recoverable).",
  "skill-commit": "What happens when a skill card is committed.",
  "skill-test-condition": "Effects gated on a skill test's result (success / failure / during an attack).",
  "skill-value": "Caring about the margin you succeed or fail a test by.",
  slot: "Granting additional asset slots.",
  soak: "Soak — assets (usually Allies) with 2+ printed health/sanity that absorb hits and can be healed.",
  "stats-mod": "Modifying skill values — flat boosts, set bases, adding a stat, or substitutions.",
  tank: "Soaking for the team — redirecting attacks and encounter cards onto a card.",
  test: "Initiating tests, and effects keyed to performing them.",
  "test-difficulty": "Changing a skill test's difficulty.",
  testless: "Testless effects — deal damage, evade, or discover clues with no skill test.",
  timing: "When an ability triggers — phases, skill steps, when / after windows, and forced.",
  trait: "Caring about card traits (Tome, Spell, Weapon, …).",
  uses: "Uses — starting charges/ammo/supplies/secrets, placing them, or accumulating tokens.",
};

const COMPOUND_DESCRIPTIONS: Record<string, string> = {
  thorns: "Hurts enemies back when they attack or damage you — passive retaliation.",
  "discard-self": "Cards you discard from play (or as a cost) for a one-time burst of value.",
  support:
    "Helps OTHER investigators, not just yourself — a non-selfish, team-oriented effect (healing others, sharing draws/searches, buffing allies).",
  "clue-tech":
    "Clue-finding technology: discover extra clues, reach other locations, lower shroud, or grab clues with no test.",
  "shroud-reduction": "Lowers the shroud value of locations, making them easier to investigate.",
  "difficulty-reduction":
    "Every way to lower the effective difficulty (target number) of a test — a direct difficulty cut or a location's shroud reduction. The target-lowering counterpart to boosting your own skill value.",
  "spend-resource": "Spends resources as a cost — a payoff for a 'big money' economy.",
  "attack-mitigation": "Cancels or prevents an enemy attack outright.",
  "succeed-by": "Rewards succeeding a skill test by a margin (succeed by 2 or more, etc.).",
  "fail-by": "Cares about how much you failed a test by.",
  investigate: "Supports the investigate action / triggers off successful investigations.",
  "enemy-field-control": "Controls where enemies can be — pinning, blocking movement, or relocating them.",
  "exile-package":
    "Exile cards: one powerful use, then removed from your collection (an XP-repurchase deckbuilding theme).",
  "into-play-cheat":
    "Puts cards directly into play from hand/deck/discard, skipping the normal play action (and sometimes the cost).",
  "deck-top-control":
    "Divination — look at, reorder, predict, or choose what you (or the encounter deck) draw next.",
  "bold-action":
    "Bundles a basic action (Fight / Evade / Investigate / Parley / Resign) into the card's own ability, whichever action it is.",
  "chaos-token-control":
    "Plays with the chaos-bag draw: reveal more, ignore, cancel, predict, seal, or treat tokens as something else.",
  "bless-curse-bag": "Adds, removes, replaces, or seals Bless / Curse tokens in the chaos bag.",
  "big-money": "Resource economy — generating, moving, or converting resources into power.",
  "evasion-package":
    "Evasion toolkit: auto/testless evade, disengage, lock down enemies, or avoid attacks of opportunity.",
  "protector-tank":
    "Take hits for the team — redirect enemy attacks and encounter cards onto a durable card, then ready it again.",
  "fail-forward":
    "Turns failure into upside, or softens it — payoffs for failing, retries, or canceling a failed test's effects.",
  "discard-pile-value": "Gets value back out of your discard pile — replay or recur cards from it.",
  "action-compression": "Do more per turn — extra or cheaper actions, extra attacks, or readying.",
  "multiclass-payoff": "Rewards that scale with how many classes you have access to.",
  "health-safety": "Protects your HEALTH — extra effective health (soak items) plus damage healing.",
  "sanity-safety":
    "Protects your SANITY — extra effective sanity (soak items like Elder Sign Amulet) plus horror healing (e.g. Peter Sylvestre).",
  "tome-support": "Cards that care about the Tome trait — Tome support and Tome-only slots.",
  "spell-support": "Cards that care about the Spell trait — Spell support and Spell-only arcane slots.",
  "relic-support": "Cards that care about the Relic trait.",
  "weapon-support": "Cards that care about the Weapon trait — Weapon support and Weapon-only slots.",
  "firearm-support": "Cards that care about the Firearm trait (e.g. refilling a Firearm's ammo).",
  "melee-support": "Cards that care about the Melee trait.",
  "ranged-support": "Cards that care about the Ranged trait.",
  "item-support": "Cards that care about the Item trait.",
  "ally-support": "Supports Ally assets and Ally-only slots.",
  "insight-support": "Cards that care about the Insight trait.",
  "tactic-support": "Cards that care about the Tactic trait.",
  healing:
    "Restores damage or horror — on yourself, another investigator, an ally/asset, or this card itself.",
  "passive-boost":
    "An always-on (or condition-gated) skill boost while the card is in play — no per-test commitment needed.",
  cancel:
    "Negates an incoming thing outright — an attack, damage, horror, a draw, a test result, a weakness, or another effect (a Diana Stanley payoff).",
  "enemy-mitigation":
    "Neutralizes an enemy WITHOUT a standard fight/evade test — discard it, defeat it, shuffle it back, or stop it attacking.",
  "area-damage":
    "Hits MULTIPLE enemies at once — all enemies at a location, a connecting location, or damage spread among them.",
  "efficient-damage":
    "More damage per action — bonus damage, an extra attack, or testless damage (action-compressed offense).",
  search:
    "Digs through a deck (yours, another investigator's, the discard, encounter, or bonded) for a specific card.",
  economy:
    "Generates resources, shares them, discounts costs, or puts cards into play skipping their normal cost.",
  "clue-on-location":
    "Cares about whether clues are ON a location — keyed to clue presence/absence, or dropping clues to set that up.",
  "off-stat-combat":
    "Fight with a non-[combat] stat, or evade with a non-[agility] stat (Mind over Matter, Mystic willpower-fighters).",
  "extra-actions":
    "Grants additional actions for the turn — MORE actions, not more per action (distinct from action compression).",
  "charge-support": "The Charge 'uses' economy — starting / placing charges and charge accumulators.",
  "secret-support": "The Secret 'uses' economy — starting and placing secrets.",
  "ammo-support": "The Ammo 'uses' economy — starting and placing ammo.",
  "supply-support": "The Supply 'uses' economy — starting and placing supplies.",
};

await mkdir(join(root, "messages"), { recursive: true });

const en: Record<string, string> = existsSync(enPath)
  ? JSON.parse(await readFile(enPath, "utf8"))
  : {};

en["$schema"] = en["$schema"] ?? "https://inlang.com/schema/inlang-message-format";

let added = 0;
const ensure = (key: string, value: string) => {
  if (!(key in en)) {
    en[key] = value;
    added++;
  }
};

for (const id of tagGroupIds) {
  ensure(`tag_group_${keyFor(id)}`, humanize(id));
  ensure(`desc_group_${keyFor(id)}`, GROUP_DESCRIPTIONS[id] ?? "");
}
for (const value of Object.keys(tagTypeCategory)) {
  ensure(`tag_${keyFor(value)}`, humanize(value));
  ensure(`desc_tag_${keyFor(value)}`, "");
}
for (const c of compoundTags) {
  // Compound values carry a `c-` namespace prefix on the machine id; the i18n keys
  // and the hand-authored descriptions are keyed by the bare name, so strip it here.
  const v = String(c.type).replace(/^c-/, "");
  ensure(`tag_compound_${keyFor(v)}`, humanize(v));
  ensure(`desc_compound_${keyFor(v)}`, COMPOUND_DESCRIPTIONS[v] ?? "");
}

await writeFile(enPath, JSON.stringify(en, null, 2) + "\n");
console.log(
  `Seeded messages/en.json: ${added} new keys (total ${Object.keys(en).length - 1} strings).`,
);
