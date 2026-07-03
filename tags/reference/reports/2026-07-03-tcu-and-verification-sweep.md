# Session report — 2026-07-03: TCU tagging + full cross-pack verification sweep

Handoff summary of one large working session on `@5argon/arkham-tags`. Two phases:
(1) tag The Circle Undone cycle and clear all deferred cross-pack debt, then
(2) an adversarial verification sweep of every non-rcore pack, requested because the
arkham-starter tag viewer was showing wrongly-classified cards from unswept packs.

Everything below is applied and building (`tsc -b` green), JSON re-exported
(`yarn export-json`), left **uncommitted** for review. Corpus after this session:
**10 packs, 684 cards, 3,399 tags, 376 base tag types, 74 compounds.**

---

## Phase 1 — The Circle Undone (tcu)

### Card list & pipeline

- **106 player cards** (deluxe + 6 mythos packs + novella promos 05313–05324) sourced from
  `campaign-data/references/pack/tcu/*.json` (skip `*_encounter.json`). This source is
  already player-filtered with fully resolved text — better than the old cards-json route.
  Only caveat: exclude back-face codes ending in a letter (ptc's `03009b Sophie`).
- Convention (since ptc): investigators + signature weaknesses ARE included, tagged lightly.
- Pipeline used (now the template for tde and beyond):
  `json/input/<pack>.json` (code/name/text + type/traits/xp/health/sanity/icons)
  → `scaffold-untagged` → 7 parallel tagging agents against `reference/_taxonomy-digest.md`
  (each also reports `noFit` effects) → merge → `assemble-tagged-cards` → `yarn build`
  → `rederive-icons-scoped.ts` with `SCOPE=[pack]` → noFit review → new-tag decisions +
  retro grep-sweep → `seed-strings`/`build-strings` → `export-json`.
- **Do NOT use `derive-stat-tags-all.ts`** — it still contains the old buggy icon rules;
  `rederive-icons-scoped.ts` has the corrected ones (same-skill two-effective, level===0).

### New tags introduced by tcu (all seeded in messages/en.json)

| Tag | Members | Note |
|---|---|---|
| `timing-after-heal-horror` | Carolyn Fern 05001, Hypnotic Therapy 05007 | the cycle's heal-payoff archetype |
| `timing-after-discover-clue` | Alice Luxley 05151, Hawk-Eye Camera 05154 (+ Connect the Dots 05025, Crack the Case 05110 via the sweep) | discovery incl. testless; distinct from after-successfully-investigate |
| `buff-investigator-health/-sanity` | Five of Pentacles 05039, Hawk-Eye 05154 | investigator counterpart of buff-asset-* |
| `deck-bonded` (display "Bonded") | Soothing Melody 05314, Blood-Rite 05317 | owner side = `deck-search-bonded`; tde will use heavily |
| `attach-investigator` | Delay the Inevitable 05021 | |
| `enemy-value-health-reduction` | Wither (4) 05321 | |
| widened `timing-after-play-card-of-trait` | optional `cardType: "event"\|"asset"\|"skill"`, `trait` now optional | **retro rcore add: Wendy's Amulet 01514** (cardType "event"); Double, Double 05320; On Your Own 04236 fixed from bogus `trait:"Event"` |

Retro grep-sweeps over all 10 packs' texts found no other old-pack members for these.
Tarot slot needed nothing new (`SlotAdditionalTarot` / `SlotConvert` already existed).

### tcu conventions ruled during noFit review

- Own-attack defeat riders (Detective's Colt) get **no** `timing-when-defeat-enemy` —
  mirrors the investigate-payoff rule (own test ⇒ condition tag, not after-timing).
- Henry Wan's "reveal until symbol → do nothing" gamble stays **out** of chaos-downside
  (no concrete loss); `chaos-reveal-manual` carries the gamble signal.
- Judged one-off / intentionally untagged: Diana's cancel-payoff trigger, Money Talks
  resource-test, Tennessee Sour Mash treachery-test restriction, Drawing Thin difficulty
  bump, 13th Vision fail-ties, hand-peek, hand→deck shuffle, Preston's Family-Inheritance
  economics.

### Deferred debt cleared alongside

- **Icon re-derive on 7 packs** (ptc/tfa/nat/har/win/jac/ste — deferred since 2026-06-14):
  42 stale tags stripped (different-icon "two-effective", wild on non-level-0). Soak later
  verified perfect on all packs.
- **CrossDeck stragglers**: Copycat 60330, Eidetic Memory 03306, A Chance Encounter 03238
  got `play-area-from-investigator`.

---

## Phase 2 — Cross-pack verification sweep (dwl/ptc/tfa/nat/har/win/jac/ste + tcu)

User-requested after phase 1, explicitly **all packs at once** so tag-viewer lists aren't
polluted by unswept packs. rcore excluded (human-reviewed gold standard, used as the
consistency anchor).

### Pre-pass (deterministic, before the agents)

- **engage-with-you split** (long-standing ledger item): new `engage-target-engaged` for
  "targets/conditions on an enemy engaged with you"; `engage-with-you` = force-engage only.
  Retagged: Oops! 02113 + 60518, Fire Extinguisher 02114, "I'll see you in hell!" 03189,
  Flamethrower 04305, Mano a Mano 60125 + 03229, Necronomicon 60233, Trench Knife 03147,
  "Not without a fight!" 03272. The Engagement compound is now clean.
- Script-checked classes: soak (0 problems anywhere), `Uses (N)` (2 gaps → new kinds
  `uses-starting-try` / `-key` / `-lock` + `perInvestigator` flag on the base),
  "X deck only." (23 signature cards were missing `deck-restriction`).

### The audit

31 agents (one per ~22-card chunk, 586 cards) re-read every card's text against the full
taxonomy digest in both directions (unjustified/wrong tags AND missing tags), anchored to
rcore precedent, each finding backed by an evidence quote + high/uncertain confidence.
Run as one workflow; 10 chunks died on a session limit and were resumed from cache.

**223 findings → all adjudicated individually; ~220 applied (+202 tags, −101 tags),
6 modified for corpus consistency, 1 dropped as duplicate.**

### Binding convention rulings established (follow these for tde+)

1. **Margin-only riders** ("succeed by N or more") get `skill-value-*` only — never
   `skill-test-condition-successful*` alongside.
2. **Own-action defeat riders** get no `timing-when-defeat-enemy` (stripped from Meat
   Cleaver, Timeworn Brand, Coup de Grâce, Enchanted Blade (3)).
3. **Timing qualifiers**: "at the end of <phase/round/turn>" → `AtIf`; "when your turn
   begins" → `When`; "would reveal / would advance" pre-windows → `Before`.
4. **Composure cards ≠ tank**: self-soak routing text ("before it can be assigned to your
   investigator card") is not `tank-redirect-damage-horror` (stripped ×5 incl. tcu
   Guiding Spirit); tank = accepting damage/horror dealt to OTHERS.
5. **Trait-restricted extra slots** don't also get `trait-support-X` — the support
   compounds arg-match `slot-additional-* { restrictedToTrait }` (Bandolier, Arcane
   Enlightenment stripped).
6. **Repeatable spend-resource boosts** = `stats-mod-pump-resource` + boost
   `value: "dynamic"`. Applied corpus-wide INCLUDING rcore: Physical Training 01517,
   Hyperawareness 01534, Hard Knocks 01549, Arcane Studies 01562 now match Dig Deep 01577.
   (With Wendy's Amulet, the only rcore content changes of the session.)
7. **Scaling values** are `"dynamic"` or the `-1` sentinel, never a flat cap
   ("I've got a plan!", Taunt (3), Chicago Typewriter, Blood Eclipse, Higher Education).
8. Bare `enemy-trait-restriction` (no args) is meaningless → removed (4 ptc cards).
9. Collection search ≠ `deck-search-*` (Dark Pact). First-play-from-hand ≠
   `recursion-replay` (both Cryptic Writings → `play-area-into-play-from-hand`).
10. Test-free clue discovery pairs `testless-clue` with `discover-clue-*`.

Other notable fix families: missing chaos-symbol tags on reveal-window cards (Counterspell,
Defiance (2), Mists of R'lyeh (2), Dark Prophecy) and missing elder-sign downside tokens on
all five jac spell upgrades; missing framework-step timings (ST3/ST6/ST7/ST8) on ste/jac
fail-forward cards vs their rcore twins; `test-you-perform` on commit restrictions;
inverted Newspaper clue gate; Lone Wolf's negated support tag; duplicated tag lines in tfa;
Lockpicks/Suggestion margin direction ×3; Minh's elder sign finally tagged `recursion-skill`.

---

## State & next steps

- **Files touched**: all 10 `src/tagged-cards/*.ts`, taxonomy files under `src/tags/`
  (timing/after, attach, deck/misc, buff/investigator-stats [new], enemy/value,
  enemy/engage, uses/starting), unions/digest/strings regenerated, `json/export/*`.
  `json/` (input + untagged worklists) is currently untracked — decide whether to commit.
- **Note**: `json/untagged/tcu.json` is now stale relative to `src/tagged-cards/tcu.ts`
  (sweep fixes were applied to the .ts directly). Do not re-run `assemble-tagged-cards`
  for tcu without first syncing the worklist.
- **Open item (user decision)**: Survival Instinct 01581 (rcore, "disengage" text) vs
  02235 (dwl, "evade" text) diverge in the data; canonical text is "evade".
- **Next cycle: The Dream-Eaters (tde)** — expect heavy `deck-bonded` usage (Segment of
  Onyx etc.); follow the phase-1 pipeline and the rulings above.
