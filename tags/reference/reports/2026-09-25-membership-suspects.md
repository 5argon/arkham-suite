# 2026-09-25 — Membership suspects, first pass

A suspect list to verify in the Tag Browser: **every tag with ≤ 4 distinct card names (156 tags)**,
plus **all 72 compounds**. Nothing was edited. Links open the local starter dev server
(`localhost:5173/tool/tag-browser`). Tags link to `?tag=`, compounds to `?compound=`, and card codes
to the card audit view.

**How it was made.** Nine read-only reviewers each took a category batch. For each tag they read its
JSDoc, RULING and NOT-MEMBER lines. They then grepped all 1851 card texts for the same effect, and gave a
verdict: missed member, merge, wrong member, or genuinely unique. Every card-level "missed" claim (82 of
them) was then checked mechanically: the code exists, the name matches, the card lacks the tag, and the
tag exists. All 82 passed. The quotes behind the high-confidence items were read against the card text.
Confidence is **[H]** high or **[M]** medium; low-confidence findings were dropped.

**Mechanical sweeps (no reviewer needed):**
- Identical-text reprints with different tags: 5 pairs, all legitimate (they differ by level or
  printed icons, which drive the `skill-commit-*` and soak values). No drift.
- Cards with zero base tags: 53. Almost all are enemy or treachery weaknesses (by convention). The
  rest form one cluster of campaign/deckbuilding Permanents: Charon's Obol, Shrewd Analysis, Déjà Vu,
  In the Thick of It, Ascetic, Spiritual Healing, Versatile, Underworld Support. See G4.
- 250 of 464 tags sit in no compound. Mostly by design (scope, timing, plumbing), but the
  archetype-shaped ones are listed in B.

---

## Outcome — applied 2026-09-26

Sections A–F were applied; section G is untouched. The build is green, lint shows 0 errors and 0 warnings, and the compound ratchet was re-baselined. 232 cards were retagged and 363 changed compound membership. Used tags went from 464 to 451 (one-card tags from 47 to 38; tags with ≤ 4 names from 156 to 130), and compounds from 72 to 74. The new compounds are **Seal** and **Doom Control**. Every decision is recorded in `rulings.json`: a `_general` entry plus per-tag rulings and NOT-MEMBERs.

**Done differently from the suggestion, after re-reading the definitions:**
- **Deciphered Reality kept its tag, reversing the suggestion above.** Clue Tech's JSDoc says extra clues on a *successful investigation* are not clue tech. So `clue-discover-*` was the wrong home for investigate riders, and the lookalike cards were the ones mistagged. The tag is now `clue-additional-other-location{instead}`. Seeking Answers ×3, Divination ×2, Professor William Webb ×2, Damning Testimony and Second Sight (5) moved into the `clue-additional-*` family and left Clue Tech. Efficient Clue now takes only `instead: false`.
- **Evidence** folds into `cost-*-spend-resource{source:"card"}`, following the existing Gregory Gry ruling. C2's "evidence intruders in Spend Resource" note was therefore rejected.
- **Premonition** twins both use `chaos-seal-revealed`, not `-any`: `-any` means a token *of your choice*.
- **Margin shifters** (Granny Orne 60508, Inquisitive, Lab Coat, plus Steady-Handed) got a new `skill-value-margin-adjust` tag instead of a boost or succeed-by tag. It feeds both Succeed By and Fail By.
- **Scrying Mirror** got `chaos-predict` (it reveals the token before commits); `chaos-reveal-before-effect` is only a rider marker.
- **Thorns** dropped its timing member. The new `enemy-target-attacking` tag keeps the counterattacks in: Counterpunch, Survival Knife, Service Revolver, Mechanic's Wrench, and Daniela Reyes 12001 (which the ratchet caught).
- **Testless displacement** for Enemy Mitigation is a new `testless-move-enemy` tag (Warning Shot, Pete's Guitar, Flute of the Outer Gods).
- **`doom-prevent-advance`** was widened to any stall, so Fortune or Fate and Tidal Memento joined as well.
- **Wendy's Amulet** is `discard-pile-to-deck{bottom}`. **Double Down** is `stats-mod-pump-resource{2}`.
- **Compound descriptions:** 11 `desc_tag_compound_*` keys were dead, because the reader looks up `desc_compound_*`. They held the 2026-09-05 audit's updated texts, which never reached the Tag Browser. Those texts moved to the live keys, and every empty compound description was filled.

**Not applied:**
- **Per-symbol seal tags were not merged** (C). They mirror `chaos-reveal-token-*`; their compound membership was fixed instead.
- **Optional tidy-ups** (C, last bullet) change shape only, with no search gain.
- **`uses-starting-other`** is G5. **The Maleson co-tag** is G3.
- **String of Curses into Doom Adding** would pull in the Tony's Quarry and Nameless Lurker weakness enemies, so it waits on G9. (G9 is now resolved: those enemies carry no tags. `doom-add{target:"enemy"}` holds only String of Curses and Whispers of Doom. **Joined 2026-09-26:** Doom Adding now takes every `doom-add` target, so Fickle Fortune (agenda) joined with them.)
- **Stargazing:** no tag separates seeding the encounter deck from the shuffles after an enemy is removed.
- **Riot Whistle** needs `Engage` added to kohaku's `BasicAction`.
- **Chicago Typewriter:** there is no action-pump tag, and a one-card tag would recreate the problem this pass removes.
- **Fire Extinguisher (1)** exiles rather than discards, and level variants may diverge.
- **The Action Compression `ready-self` "intruders"** (Jacob Morrison, Eye of the Djinn, Well Connected) fit "readying to act again", so they stay.
- **Recorded as NOT-MEMBERs:**
  - Blood Curse and Scrying: a conditional drawback is not a cost.
  - Diana Stanley: her trigger is any effect, not a chaos token.
  - The Chthonian Stone ×2 and Lucky Dice 07307: bouncing to hand is not a discard downside.
  - Underworld Market: it uses the market deck, not a player deck.
  - Cryptic Grimoire (4): it replaces the draw rather than cancelling it.

**New weakness leaks for G9:** Shocking Discovery and Dead Ends (Search); Mob Enforcer, Bianca "Die Katz" and Down and Out (Spend Resource); Day of Reckoning (Seal).

---

## Your two examples

- [`cancel-encounter-draw`](http://localhost:5173/tool/tag-browser?tag=cancel-encounter-draw): Dr. William T. Maleson [02302](http://localhost:5173/tool/tag-browser?tab=card&focus=02302) alone. His functional twin
  Nine of Rods [54009](http://localhost:5173/tool/tag-browser?tab=card&focus=54009) ("Cancel all of that card's effects and shuffle it into the encounter deck. Then,
  draw another card"), and the other Maleson [09054](http://localhost:5173/tool/tag-browser?tab=card&focus=09054), both carry [`cancel-encounter-effect`](http://localhost:5173/tool/tag-browser?tag=cancel-encounter-effect) +
  [`cancel-revelation`](http://localhost:5173/tool/tag-browser?tag=cancel-revelation). So 02302 is invisible to anyone browsing "cancel an encounter card".
  The digest RULING deliberately separates "cancel the drawing" from "cancel its effects". Keep that
  if you like, but at least co-tag 02302. One more candidate for this tag: Cryptic Grimoire L4 [07192](http://localhost:5173/tool/tag-browser?tab=card&focus=07192)
  ("When you would draw the top card of the encounter deck … Draw a card from your deck instead"). [M]
- [`clue-additional-revealed-locations`](http://localhost:5173/tool/tag-browser?tag=clue-additional-revealed-locations): your hunch was right. Will of the Cosmos [12066](http://localhost:5173/tool/tag-browser?tab=card&focus=12066) already
  carries [`clue-discover-any-location`](http://localhost:5173/tool/tag-browser?tag=clue-discover-any-location). Deciphered Reality [02303](http://localhost:5173/tool/tag-browser?tab=card&focus=02303) ("discover 1 clue from each
  revealed location in play") is a multi-location discovery, not an *additional* clue in the sense of
  `clue/additional.ts`. Retag it `clue-discover-any-location{value:"dynamic"}` and delete the tag.
  Today it is invisible to remote-clue browsing. [H]

---

## A. Start here — the 20 highest-value items

Compound definition gaps (a one-line fix pulls in many cards):
1. [Off Stat Combat](http://localhost:5173/tool/tag-browser?compound=c-off-stat-combat) lacks `stats-mod-add-stat{action:"fight"|"evade"}`. That leaves out 28 cards /
   19 names (Spectral Razor, Storm Ruler, Suggestion, Slip Away, Kymani, Cheap Shot…), including
   **Mind over Matter**, which its own JSDoc names. [Off-Stat Investigation](http://localhost:5173/tool/tag-browser?compound=c-off-stat-investigation) already has the
   `investigate` twin. [H]
2. [`trait-support-firearm`](http://localhost:5173/tool/tag-browser?tag=trait-support-firearm) (25 names), [`trait-support-melee`](http://localhost:5173/tool/tag-browser?tag=trait-support-melee) and [`trait-support-ranged`](http://localhost:5173/tool/tag-browser?tag=trait-support-ranged) are in **no compound**.
   [Weapon Support](http://localhost:5173/tool/tag-browser?compound=c-weapon-support)'s JSDoc promises "their own support compounds", which don't exist. Also
   missing: `slot-additional-hand{Firearm}` ("Viola" Case [11012](http://localhost:5173/tool/tag-browser?tab=card&focus=11012), Protective Vest [60181](http://localhost:5173/tool/tag-browser?tab=card&focus=60181)). [H]
3. [Economy](http://localhost:5173/tool/tag-browser?compound=c-economy) lacks [`cost-alternate-payment`](http://localhost:5173/tool/tag-browser?tag=cost-alternate-payment), so all 9 cards are outside: the EOTE wallets (Prophetic,
   Sleuth, Bruiser, Crafty, Antiquary), Schoffner's Catalogue, Same Old Thing [60561](http://localhost:5173/tool/tag-browser?tab=card&focus=60561) (in no compound
   at all), Mortar and Pestle, Archibald MacVeigh. [H]
4. [Remote Clue](http://localhost:5173/tool/tag-browser?compound=c-remote-clue) lacks [`remote-investigate`](http://localhost:5173/tool/tag-browser?tag=remote-investigate) (in no compound): In the Know, Pocket Telescope, Local Map,
   Sixth Sense, Testing Sprint, Trish Scarborough, Beguile, Glassing. [H]
5. [Difficulty Reduction](http://localhost:5173/tool/tag-browser?compound=c-difficulty-reduction) lacks [`enemy-value-fight-reduction`](http://localhost:5173/tool/tag-browser?tag=enemy-value-fight-reduction) (in no compound) and
   [`enemy-value-evade-reduction`](http://localhost:5173/tool/tag-browser?tag=enemy-value-evade-reduction): Expose Weakness, Improvised Weapon, Anatomical Diagrams, Makeshift
   Trap, Wither, Stealth, Bolas. [H]
6. [Discard Pile Value](http://localhost:5173/tool/tag-browser?compound=c-discard-pile-value) lacks [`play-area-into-play-from-discard`](http://localhost:5173/tool/tag-browser?tag=play-area-into-play-from-discard) (A Chance Encounter),
   [`discard-pile-to-bottom-deck`](http://localhost:5173/tool/tag-browser?tag=discard-pile-to-bottom-deck) (Gift of Nodens, Copycat, Detective's Colt) and [`recursion-asset`](http://localhost:5173/tool/tag-browser?tag=recursion-asset) (Salvage).
   Meanwhile [`recursion-skill`](http://localhost:5173/tool/tag-browser?tag=recursion-skill) drags in ~11 "return a *committed* skill to hand" cards that never touch
   the discard pile (Try and Try Again, Grisly Totem, Amanda, Minh…). [H]
7. [Spend Resource](http://localhost:5173/tool/tag-browser?compound=c-spend-resource) lacks [`cost-action-spend-resource`](http://localhost:5173/tool/tag-browser?tag=cost-action-spend-resource); its free and reaction twins are members.
   Book of Shadows, Luger P08, Mob Connections and Tommy Muldoon are left out. [H]
8. [Health Safety](http://localhost:5173/tool/tag-browser?compound=c-health-safety) / [Sanity Safety](http://localhost:5173/tool/tag-browser?compound=c-sanity-safety) lack [`buff-investigator-health`](http://localhost:5173/tool/tag-browser?tag=buff-investigator-health) / [`buff-investigator-sanity`](http://localhost:5173/tool/tag-browser?tag=buff-investigator-sanity).
   Five of Pentacles, The Black Fan and Daisy 90001 are left out, and Directive [90029](http://localhost:5173/tool/tag-browser?tab=card&focus=90029) ("You get +3
   sanity") is in no compound at all. [H]
9. [Chaos Token Control](http://localhost:5173/tool/tag-browser?compound=c-chaos-token-control) lacks the symbol seals ([`chaos-seal-token-skull`](http://localhost:5173/tool/tag-browser?tag=chaos-seal-token-skull) and the other symbols,
   [`chaos-seal-token-auto-fail`](http://localhost:5173/tool/tag-browser?tag=chaos-seal-token-auto-fail)) and [`chaos-modifier`](http://localhost:5173/tool/tag-browser?tag=chaos-modifier). Seal of the Seventh Sign, Chthonian Stone, Sign
   of Xelotaph, Sure Gamble and Snipe are in **no compound**. More broadly, the Seal keyword has no home
   (see B, new compounds). [H]
10. [`ready-ally`](http://localhost:5173/tool/tag-browser?tag=ready-ally) is in no compound, while [`ready-self`](http://localhost:5173/tool/tag-browser?tag=ready-self) and [`ready-asset`](http://localhost:5173/tool/tag-browser?tag=ready-asset) are in [Action Compression](http://localhost:5173/tool/tag-browser?compound=c-action-compression).
    Charlie Kane, Bonnie Walsh and Inspiring Presence are left out. [Ally Support](http://localhost:5173/tool/tag-browser?compound=c-ally-support) misses it too. [H]
11. [Commit](http://localhost:5173/tool/tag-browser?compound=c-commit): Winifred Habbamock [60301](http://localhost:5173/tool/tag-browser?tab=card&focus=60301), the example in its own description, is absent.
    Add [`commit-count-condition`](http://localhost:5173/tool/tag-browser?tag=commit-count-condition). [H]
12. [Succeed By](http://localhost:5173/tool/tag-browser?compound=c-succeed-by) lacks [`test-succeed-by`](http://localhost:5173/tool/tag-browser?tag=test-succeed-by) (all four shotguns out); [Fail By](http://localhost:5173/tool/tag-browser?compound=c-fail-by) lacks
    [`skill-value-fail-by-or-more`](http://localhost:5173/tool/tag-browser?tag=skill-value-fail-by-or-more) (Grimm's, Precious Memento, Empirical Hypothesis). [H]
13. [Fail Forward](http://localhost:5173/tool/tag-browser?compound=c-fail-forward): weaknesses get in via [`timing-after-fail-skill-test`](http://localhost:5173/tool/tag-browser?tag=timing-after-fail-skill-test) (Atychiphobia, Overconfident,
    Weight of the World, Unaware, plus Marcus Sengstacke's horror-on-himself). Meanwhile "If this test
    fails, ‹benefit›" cards are out: Take Heart, Unexpected Courage L2, On the Brink, Self-Sacrifice,
    "As you wish", Nose to the Grindstone. [H]
14. [Area Damage](http://localhost:5173/tool/tag-browser?compound=c-area-damage) and [Multi Enemy](http://localhost:5173/tool/tag-browser?compound=c-multi-enemy): member [`testless-damage-connecting-location`](http://localhost:5173/tool/tag-browser?tag=testless-damage-connecting-location) adds **only**
    single-target cards (Small Favor, Long Shot, Servant of Brass, Guerrilla Tactics). Drop it from both. [H]
15. [Evade Payoff](http://localhost:5173/tool/tag-browser?compound=c-evade-payoff) overlaps [Evasion Package](http://localhost:5173/tool/tag-browser?compound=c-evasion-package) on 16 of its 17 names (both hold
    [`timing-after-evade-enemy`](http://localhost:5173/tool/tag-browser?tag=timing-after-evade-enemy)), and the two JSDocs contradict each other. [H]

Duplicate tags that split one effect in two:

16. [`chaos-treat-as-elder-sign`](http://localhost:5173/tool/tag-browser?tag=chaos-treat-as-elder-sign) vs `chaos-treat-token-as{to:"elder-sign"}`. The latter's only user is
    Father Mateo [04004](http://localhost:5173/tool/tag-browser?tab=card&focus=04004), whose text is word-for-word Eucatastrophe's. Searching "treat as elder sign"
    misses him. Merge. [H]
17. [`test-succeed-by`](http://localhost:5173/tool/tag-browser?tag=test-succeed-by) duplicates [`skill-value-succeed-by-dynamic`](http://localhost:5173/tool/tag-browser?tag=skill-value-succeed-by-dynamic) (Hold Up and .45 Thompson use the latter
    for the same "for each point you succeed by"). [`test-fail-by`](http://localhost:5173/tool/tag-browser?tag=test-fail-by) is the shotguns' friendly-fire
    drawback, which [`damage-instead-fail-range`](http://localhost:5173/tool/tag-browser?tag=damage-instead-fail-range) already records. Delete it; don't fold it into
    fail-by-dynamic, or the shotguns land in Fail Forward. [H]
18. Evidence spends use two encodings: [`cost-reaction-spend-evidence`](http://localhost:5173/tool/tag-browser?tag=cost-reaction-spend-evidence) (Michael Leigh, Oculus Mortuum) vs
    `cost-*-spend-resource{source:"card"}` (Alton O'Connell, Empirical Hypothesis, Darrell, Research
    Notes, Damning Testimony, Microscope). The second also leaks evidence cards into [Spend Resource](http://localhost:5173/tool/tag-browser?compound=c-spend-resource). [H]
19. [`timing-skill-st5-determine-skill-value`](http://localhost:5173/tool/tag-browser?tag=timing-skill-st5-determine-skill-value) is on 4 cards out of ≥ 17 of identical shape: Cornered [04160](http://localhost:5173/tool/tag-browser?tab=card&focus=04160)
    has it and Bangle of Jinxes [08075](http://localhost:5173/tool/tag-browser?tab=card&focus=08075) doesn't. Drop it (the `stats-mod-boost-in-test-*` tags cover it) or
    sweep it. [H]

Key effects with no tag at all:

20. Evanescent Ascension [10039](http://localhost:5173/tool/tag-browser?tab=card&focus=10039) has no chaos tag ("Resolve that investigator's [elder_sign] effect").
    Orphic Theory [09051](http://localhost:5173/tool/tag-browser?tab=card&focus=09051) blanks a treachery's text, but that is untagged and it is in no compound.
    Déjà Vu [60531](http://localhost:5173/tool/tag-browser?tab=card&focus=60531) and Shrewd Analysis [04106](http://localhost:5173/tool/tag-browser?tab=card&focus=04106) have zero tags. Arcane Research [04109](http://localhost:5173/tool/tag-browser?tab=card&focus=04109) is named as a
    "future member" in [`campaign-deck-swap-between-games`](http://localhost:5173/tool/tag-browser?tag=campaign-deck-swap-between-games)'s own JSDoc but was never added. [H]

---

## B. Compound fixes, by compound

New-compound candidates (whole mechanics with no home):
- **Seal** (TDC keyword): all `chaos-seal-token-*` + [`chaos-spend-sealed`](http://localhost:5173/tool/tag-browser?tag=chaos-spend-sealed) (16) + [`chaos-reveal-sealed-instead`](http://localhost:5173/tool/tag-browser?tag=chaos-reveal-sealed-instead).
  Only `-any`, `-revealed` and the bless/curse seals are in any compound today. [M]
- **Doom control**: [`doom-remove`](http://localhost:5173/tool/tag-browser?tag=doom-remove) (17), [`doom-move`](http://localhost:5173/tool/tag-browser?tag=doom-move), [`doom-prevent-advance`](http://localhost:5173/tool/tag-browser?tag=doom-prevent-advance) are in no compound, while
  [Doom Adding](http://localhost:5173/tool/tag-browser?compound=c-doom-adding) exists. [M]
- **Firearm/Weapon tech**: see A2. Optionally `uses-support-ammo`/`uses-replenish` belong alongside (Extra
  Ammunition, Custom Ammunition). [M]

Per compound:
- [Ally Support](http://localhost:5173/tool/tag-browser?compound=c-ally-support): add [`slot-additional-ally`](http://localhost:5173/tool/tag-browser?tag=slot-additional-ally) (JSDoc still says "incl. Ally-only ally slots"; Charisma ×3,
  Charlie Kane, Directive 90027, Rod of Animalism), [`ready-ally`](http://localhost:5173/tool/tag-browser?tag=ready-ally), [`buff-asset-health`](http://localhost:5173/tool/tag-browser?tag=buff-asset-health) (The Star). [H]
- [Action Compression](http://localhost:5173/tool/tag-browser?compound=c-action-compression): add [`ready-ally`](http://localhost:5173/tool/tag-browser?tag=ready-ally) [H]. Intruders via [`ready-self`](http://localhost:5173/tool/tag-browser?tag=ready-self) that save no action: Jacob
  Morrison [07309](http://localhost:5173/tool/tag-browser?tab=card&focus=07309), Eye of the Djinn [07225](http://localhost:5173/tool/tag-browser?tab=card&focus=07225), Well Connected [54006](http://localhost:5173/tool/tag-browser?tab=card&focus=54006) ("[fast] Spend 2 resources: Ready"). [M]
- [Bless Curse Bag](http://localhost:5173/tool/tag-browser?compound=c-bless-curse-bag): add [`chaos-bag-count-condition`](http://localhost:5173/tool/tag-browser?tag=chaos-bag-count-condition) (The Stygian Eye [07263](http://localhost:5173/tool/tag-browser?tab=card&focus=07263), Book of Living Myths) [H].
  Intruders: 8 "any symbol" cards expanded into all 8 reveal-token tags (Butterfly Effect, Ethereal
  Form, Read the Signs, Spectral Razor 10102, Eldritch Whispers, Mask of Silenus, Augur of Elokoss,
  Scrape By). [M]
- [Bold Action](http://localhost:5173/tool/tag-browser?compound=c-bold-action): [`action-bold-move`](http://localhost:5173/tool/tag-browser?tag=action-bold-move) and [`action-bold-engage`](http://localhost:5173/tool/tag-browser?tag=action-bold-engage) aren't members (Astral Travel, Shortcut, Scout
  Ahead, The Truth Beckons, Righteous Hunt). Add them, or say the five-action list is deliberate. [M]
- [Cancel](http://localhost:5173/tool/tag-browser?compound=c-cancel): add [`cancel-use-instead`](http://localhost:5173/tool/tag-browser?tag=cancel-use-instead) (Empower Self; the only `cancel-*` tag outside). [M]
- [Chaos Token Control](http://localhost:5173/tool/tag-browser?compound=c-chaos-token-control): see A9 [H]. Intruders: the weaknesses Rex's Curse, Glimpse the Void and
  Ectoplasmic Horror via reveal-more / another-instead. [M]
- [Clue On Location](http://localhost:5173/tool/tag-browser?compound=c-clue-on-location): add [`cost-free-spend-clue`](http://localhost:5173/tool/tag-browser?tag=cost-free-spend-clue) + [`cost-reaction-spend-clue`](http://localhost:5173/tool/tag-browser?tag=cost-reaction-spend-clue) (Quick Study, Maleson
  ×2: "place 1 of your clues on your location" is exactly the "dropping clues" in its description). [H]
- [Clue Tech](http://localhost:5173/tool/tag-browser?compound=c-clue-tech): [`clue-discover-your-location`](http://localhost:5173/tool/tag-browser?tag=clue-discover-your-location) and related tags sit on investigate-SUCCESS riders, which contradicts the
  compound's own note: Seeking Answers ×3, Divination ×2, Prof. William Webb ×2, Damning Testimony,
  Second Sight (5). Retag them `clue-additional-*` (which also feeds [Efficient Clue](http://localhost:5173/tool/tag-browser?compound=c-efficient-clue)). [M]
- [Conditional Passive Boost](http://localhost:5173/tool/tag-browser?compound=c-conditional-passive-boost): add `passive-any{action:"parley"}` (Walter Fitzpatrick [11104](http://localhost:5173/tool/tag-browser?tab=card&focus=11104)) [H].
  `passive-any{evade}` and `{investigate}` match 0 cards; Dirty Fighting [09073](http://localhost:5173/tool/tag-browser?tab=card&focus=09073) has no action arg. [M]
- [Cross-Deck (Borrow)](http://localhost:5173/tool/tag-browser?compound=c-cross-deck): Bob Jenkins [08016](http://localhost:5173/tool/tag-browser?tab=card&focus=08016) lacks [`play-area-from-investigator`](http://localhost:5173/tool/tag-browser?tag=play-area-from-investigator) (or add member
  `play-from-other-zone{zone:"other-hand"}`) [H]. Kleptomania is a weakness intruder. [M]
- [Discard Self](http://localhost:5173/tool/tag-browser?compound=c-discard-self): Fire Extinguisher (1) [02114](http://localhost:5173/tool/tag-browser?tab=card&focus=02114) "Exile Fire Extinguisher: Evade" is out while its L3
  twin is in [M]. Anchor Chain, Hand Hook and Nautical Charts (`action-activate-from-hand{discardInstead}`)
  are a candidate member. [M]
- [Doom Adding](http://localhost:5173/tool/tag-browser?compound=c-doom-adding): intruder Baron Samedi ×2 (weakness removing itself) [M]. String of Curses [09088](http://localhost:5173/tool/tag-browser?tab=card&focus=09088) is
  out; `doom-add{target:"enemy"}` would also pull in the Tony's Quarry / Nameless Lurker weakness enemies. [M]
- [Encounter Deck](http://localhost:5173/tool/tag-browser?compound=c-encounter-deck): Eye of Ghatanothoa [11073](http://localhost:5173/tool/tag-browser?tab=card&focus=11073) ("top card of the encounter deck revealed") lacks
  [`deck-look-encounter`](http://localhost:5173/tool/tag-browser?tag=deck-look-encounter). Stargazing [06027](http://localhost:5173/tool/tag-browser?tab=card&focus=06027) was dropped with the enemy-removal cards in §6 but removes no
  enemy, so it is now in no compound. [M]
- [Enemy Nerf](http://localhost:5173/tool/tag-browser?compound=c-enemy-nerf) / [Enemy Mitigation](http://localhost:5173/tool/tag-browser?compound=c-enemy-mitigation): intruder "Where's the party?" [11053](http://localhost:5173/tool/tag-browser?tab=card&focus=11053) via [`enemy-exhaust`](http://localhost:5173/tool/tag-browser?tag=enemy-exhaust); it
  *spawns* an enemy (exhausted and engaged with you). [H] Testless displacement (Warning Shot, Pete's Guitar,
  Flute) is missing, and [`location-move-enemy-displace`](http://localhost:5173/tool/tag-browser?tag=location-move-enemy-displace) mixes test riders in. [M]
- [Engagement](http://localhost:5173/tool/tag-browser?compound=c-engagement): engaged-count scalers need a tag: "Not without a fight!", Trench Knife, Directive
  90025 (see G11). [M]
- [Evasion Package](http://localhost:5173/tool/tag-browser?compound=c-evasion-package): [`action-bold-evade`](http://localhost:5173/tool/tag-browser?tag=action-bold-evade) isn't a member, so 53 evade cards are outside (Slip Away, Mists of
  R'lyeh, Shadowmeld…). That may be deliberate ("evade tech"); if so, state it in the JSDoc. [M]
- [Heal Horror](http://localhost:5173/tool/tag-browser?compound=c-heal-horror): consider [`timing-after-heal-horror`](http://localhost:5173/tool/tag-browser?tag=timing-after-heal-horror) (Private Practice, Soul Sanctification). [M]
- [Health Safety](http://localhost:5173/tool/tag-browser?compound=c-health-safety) / [Sanity Safety](http://localhost:5173/tool/tag-browser?compound=c-sanity-safety): see A8. Also consider [`cancel-damage`](http://localhost:5173/tool/tag-browser?tag=cancel-damage) / [`cancel-horror`](http://localhost:5173/tool/tag-browser?tag=cancel-horror) ("I've
  had worse…", Devil's Luck, Perseverance). [M]
- [Big Hand](http://localhost:5173/tool/tag-browser?compound=c-big-hand): [`hand-size-dependent`](http://localhost:5173/tool/tag-browser?tag=hand-size-dependent) has no direction, so it pulls in the *punishers* Last Chance ×2,
  Thrice-Damned Curiosity and Feed the Mind L3. Add a `comparison` arg and keep "min". [H]
- [Mobility](http://localhost:5173/tool/tag-browser?compound=c-mobility): add [`action-bold-move`](http://localhost:5173/tool/tag-browser?tag=action-bold-move); 9 of 11 are already inside, but Eon Chart is out. [M]
- [Player Deck Look](http://localhost:5173/tool/tag-browser?compound=c-player-deck-look): Norman Withers [08004](http://localhost:5173/tool/tag-browser?tab=card&focus=08004) and Livre d'Eibon [08005](http://localhost:5173/tool/tag-browser?tab=card&focus=08005) lack [`deck-look-you`](http://localhost:5173/tool/tag-browser?tag=deck-look-you). [M]
- [Protector Tank](http://localhost:5173/tool/tag-browser?compound=c-protector-tank) / [Support](http://localhost:5173/tool/tag-browser?compound=c-support): via `tank-move-damage-horror{cross-investigator}`, "Devil" [10119](http://localhost:5173/tool/tag-browser?tab=card&focus=10119) and
  Wrong Place, Right Time [10115](http://localhost:5173/tool/tag-browser?tab=card&focus=10115) move damage *off* you. Re-check the 2026-07-16 ruling that pre-listed
  Devil. [M]
- [Relic Support](http://localhost:5173/tool/tag-browser?compound=c-relic-support): Enchant Weapon [07261](http://localhost:5173/tool/tag-browser?tab=card&focus=07261) ("gains the [[Relic]] trait") lacks [`trait-support-relic`](http://localhost:5173/tool/tag-browser?tag=trait-support-relic). [M]
- [Search](http://localhost:5173/tool/tag-browser?compound=c-search): consider [`deck-search-reaction`](http://localhost:5173/tool/tag-browser?tag=deck-search-reaction) (Occult Evidence, Surprising Find, Astounding Revelation). [M]
- [Self Harm Damage](http://localhost:5173/tool/tag-browser?compound=c-self-harm-damage) / [Self Harm Horror](http://localhost:5173/tool/tag-browser?compound=c-self-harm-horror): intruders The Black Cat [06285](http://localhost:5173/tool/tag-browser?tab=card&focus=06285) (the damage goes on the Cat),
  Dendromorphosis (weakness), and Scrying L3 ×2 + Feed the Mind L3, where the horror is a conditional
  drawback carried as `cost-horror-self`. Blood Curse [60467](http://localhost:5173/tool/tag-browser?tab=card&focus=60467) is out. [M]
- [Skill Value Boost](http://localhost:5173/tool/tag-browser?compound=c-skill-value-boost): Well Connected ×3 ("+1 skill value … for every 4 resources") lacks
  [`stats-mod-boost-in-test-any`](http://localhost:5173/tool/tag-browser?tag=stats-mod-boost-in-test-any). [M]
- [Slot Tech](http://localhost:5173/tool/tag-browser?compound=c-slot-tech): Trigger Man [09076](http://localhost:5173/tool/tag-browser?tab=card&focus=09076), which the JSDoc names, has no [`slot-ignore`](http://localhost:5173/tool/tag-browser?tag=slot-ignore). [H]
- [Support](http://localhost:5173/tool/tag-browser?compound=c-support): add [`gain-resource-investigator`](http://localhost:5173/tool/tag-browser?tag=gain-resource-investigator) (Stand Together, Bank Job, Crack the Case) [H] and
  [`commit-other-investigator`](http://localhost:5173/tool/tag-browser?tag=commit-other-investigator) (Leadership, Fighting Lessons, Bestow Resolve) [M].
- [Testless Damage](http://localhost:5173/tool/tag-browser?compound=c-testless-damage): Aquinnah ×3 is out ([`damage-redirect-attack`](http://localhost:5173/tool/tag-browser?tag=damage-redirect-attack) sits in Efficient Damage) [M].
  [`damage-spread`](http://localhost:5173/tool/tag-browser?tag=damage-spread) adds only Flamethrower and Gatling Gun, which are Fight attacks. [M]
- [Thorns](http://localhost:5173/tool/tag-browser?compound=c-thorns): add [`testless-damage-attacking-enemy`](http://localhost:5173/tool/tag-browser?tag=testless-damage-attacking-enemy) (Hypnotic Gaze ×3, Dodge L2, Counterattack) [H].
  [`timing-after-enemy-attacks`](http://localhost:5173/tool/tag-browser?tag=timing-after-enemy-attacks) brings in non-retaliators: Bangle of Jinxes, Blood Will Have Blood,
  Lesson Learned, Restrained. [M]
- [Treachery Handling](http://localhost:5173/tool/tag-browser?compound=c-treachery-handling): Orphic Theory (see C, `enemy-blank-text`) [H]; consider [`phase-skip`](http://localhost:5173/tool/tag-browser?tag=phase-skip) (A Watchful
  Peace, Deliverance). [M]
- [Victory Display](http://localhost:5173/tool/tag-browser?compound=c-victory-display): intruder Bianca "Die Katz" [10063](http://localhost:5173/tool/tag-browser?tab=card&focus=10063); adding a weakness to the victory display is
  its removal, not banking VP. [M]

---

## C. Base tags — merges and restructures

- [`clue-additional-revealed-locations`](http://localhost:5173/tool/tag-browser?tag=clue-additional-revealed-locations) → [`clue-discover-any-location`](http://localhost:5173/tool/tag-browser?tag=clue-discover-any-location) (see "Your two examples"). [H]
- [`chaos-treat-as-elder-sign`](http://localhost:5173/tool/tag-browser?tag=chaos-treat-as-elder-sign) ≡ `chaos-treat-token-as{elder-sign}` (A16). [H]
- [`test-succeed-by`](http://localhost:5173/tool/tag-browser?tag=test-succeed-by) → [`skill-value-succeed-by-dynamic`](http://localhost:5173/tool/tag-browser?tag=skill-value-succeed-by-dynamic); delete [`test-fail-by`](http://localhost:5173/tool/tag-browser?tag=test-fail-by) (A17). [H]
- [`cost-reaction-spend-evidence`](http://localhost:5173/tool/tag-browser?tag=cost-reaction-spend-evidence) vs spend-resource{card}: pick one encoding for evidence (A18). [H]
- [`timing-skill-st5-determine-skill-value`](http://localhost:5173/tool/tag-browser?tag=timing-skill-st5-determine-skill-value): drop or sweep (A19). [H]
- [`timing-forced-spawn-your-location`](http://localhost:5173/tool/tag-browser?tag=timing-forced-spawn-your-location) → [`timing-when-enemy-spawns-your-location`](http://localhost:5173/tool/tag-browser?tag=timing-when-enemy-spawns-your-location). Ambush [03148](http://localhost:5173/tool/tag-browser?tab=card&focus=03148) is the same
  event, and "forced" in the id breaks the neutral-window general ruling. [`timing-forced-enters-location`](http://localhost:5173/tool/tag-browser?tag=timing-forced-enters-location)
  in the same file has the same naming problem. [H]
- [`enemy-defeat-on-attack-success`](http://localhost:5173/tool/tag-browser?tag=enemy-defeat-on-attack-success) → [`enemy-mitigation-defeat`](http://localhost:5173/tool/tag-browser?tag=enemy-mitigation-defeat). Monster Slayer [02300](http://localhost:5173/tool/tag-browser?tab=card&focus=02300) lacks the latter, while
  Waylay has it. [H]
- [`enemy-blank-text`](http://localhost:5173/tool/tag-browser?tag=enemy-blank-text) → `blank-text{target: enemy|treachery}`, so Orphic Theory can join Mind Wipe. [M]
- [`ready-ally`](http://localhost:5173/tool/tag-browser?tag=ready-ally) → `ready-asset{restrictedToTrait:"Ally"}`; at minimum, add it to the compounds. [H]
- [`discard-pile-to-bottom-deck`](http://localhost:5173/tool/tag-browser?tag=discard-pile-to-bottom-deck) → `discard-pile-to-deck{position}`. [M]
- [`chaos-seal-token-skull`](http://localhost:5173/tool/tag-browser?tag=chaos-seal-token-skull) / -cultist / -tablet / -elder-thing: identical members (Chthonian Stone ×2, Sign of
  Xelotaph) and no card seals just one symbol. Make it one tag, or a symbol argument. [M]
- [`chaos-seal-token-0`](http://localhost:5173/tool/tag-browser?tag=chaos-seal-token-0): "+1" has no seal tag. Misdirection "Seal (+1 or 0)" is 0; Bulwark and Crystalline
  Elder Sign "Seal (+1 or [elder_sign])" are elder-sign only. Widen it or add a value argument. [M]
- [`chaos-ignore-modifier`](http://localhost:5173/tool/tag-browser?tag=chaos-ignore-modifier) vs `chaos-modifier{treatAs:0}`: Dawn Star ("ignore the modifiers of each
  [curse]") vs Accursed ("treat the modifier of each [curse] … as 0") are the same thing. Jim Culver
  02004 is the skull version. [M]
- [`timing-after-enemy-deal-damage-self`](http://localhost:5173/tool/tag-browser?tag=timing-after-enemy-deal-damage-self) / [`timing-after-enemy-deal-damage-you`](http://localhost:5173/tool/tag-browser?tag=timing-after-enemy-deal-damage-you) →
  `timing-when-take-damage/-horror{source:"enemy-attack"}`. Guard Dog is invisible to "react when my asset
  takes damage"; Flesh Ward's horror half is uncovered. [M]
- [`location-shroud-reduction`](http://localhost:5173/tool/tag-browser?tag=location-shroud-reduction) + [`location-shroud-minus-1`](http://localhost:5173/tool/tag-browser?tag=location-shroud-minus-1) + [`location-shroud-minus-2`](http://localhost:5173/tool/tag-browser?tag=location-shroud-minus-2) → one tag with `value`.
  Every compound already lists all three. [M]
- `duration-next` family ([`duration-next`](http://localhost:5173/tool/tag-browser?tag=duration-next), [`duration-next-skill-test-this-phase`](http://localhost:5173/tool/tag-browser?tag=duration-next-skill-test-this-phase),
  [`duration-next-skill-test-this-turn`](http://localhost:5173/tool/tag-browser?tag=duration-next-skill-test-this-turn)) → one `duration-next{window: turn|phase|round}`. There is no
  "this round" variant, which is why Pnakotic Manuscripts and One in the Chamber fell through (see D). [M]
- Pumps: [`stats-mod-pump-ammo`](http://localhost:5173/tool/tag-browser?tag=stats-mod-pump-ammo) + [`stats-mod-pump-charge`](http://localhost:5173/tool/tag-browser?tag=stats-mod-pump-charge) → `stats-mod-pump-uses{useType}`. That would give The
  Necronomicon (John Dee) [60233](http://localhost:5173/tool/tag-browser?tab=card&focus=60233) (secret) and Soul Sanctification [09123](http://localhost:5173/tool/tag-browser?tab=card&focus=09123) (offering) a home;
  Chicago Typewriter [02304](http://localhost:5173/tool/tag-browser?tab=card&focus=02304) is an action pump. [M]
- `uses-starting-*`: try, key, lock, leyline and durability each have one card name, while renown (3 names),
  rumors, leads, shell, arrow, time and aether have no tag. A `uses-starting-other{tokenName}` would cover
  both. This is the 2026-09-05 §5 open item, now with a concrete shape. [M]
- Clue-as-cost is spread over [`cost-free-spend-clue`](http://localhost:5173/tool/tag-browser?tag=cost-free-spend-clue), [`cost-reaction-spend-clue`](http://localhost:5173/tool/tag-browser?tag=cost-reaction-spend-clue) and [`clue-place-your-location`](http://localhost:5173/tool/tag-browser?tag=clue-place-your-location),
  plus Analysis [09049](http://localhost:5173/tool/tag-browser?tab=card&focus=09049) with no clue tag. The payoffs Press Pass and Research Notes want exactly this set. [M]
- [`cost-action-discard-from-hand`](http://localhost:5173/tool/tag-browser?tag=cost-action-discard-from-hand) → [`cost-discard-card`](http://localhost:5173/tool/tag-browser?tag=cost-discard-card). "I'll do it myself" (fast) and Called to Guinée
  (action) have the same exit but sit in different tags. [M]
- Optional tidy-ups (no search loss): [`gain-alert`](http://localhost:5173/tool/tag-browser?tag=gain-alert) / [`gain-aloof`](http://localhost:5173/tool/tag-browser?tag=gain-aloof) / [`gain-retaliate`](http://localhost:5173/tool/tag-browser?tag=gain-retaliate) → `enemy-gain-keyword{keyword}`;
  the [`cancel-lose-action`](http://localhost:5173/tool/tag-browser?tag=cancel-lose-action) / [`cancel-lose-resource`](http://localhost:5173/tool/tag-browser?tag=cancel-lose-resource) / [`cancel-discard-from-hand`](http://localhost:5173/tool/tag-browser?tag=cancel-discard-from-hand) trio (all Deny Existence);
  the `trait-support-*` one-offs → `trait-support{trait}`; `doom-prevent-advance` broadened to "doom
  prevention" (Elle Rubash, Handcuffs). [M]

---

## D. Base tags — missed members

| Tag | Card | Why | Conf |
|---|---|---|---|
| [`campaign-deck-swap-between-games`](http://localhost:5173/tool/tag-browser?tag=campaign-deck-swap-between-games) | Arcane Research [04109](http://localhost:5173/tool/tag-browser?tab=card&focus=04109) | "reduce the experience cost of the first [[Spell]] card you upgrade"; named in the tag's own JSDoc | H |
| | Green Man Medallion [98002](http://localhost:5173/tool/tag-browser?tab=card&focus=98002) | same clause as member Pelt Shipment | H |
| | Déjà Vu [60531](http://localhost:5173/tool/tag-browser?tab=card&focus=60531) | "reduce the experience cost to repurchase … by 1 each"; zero tags | H |
| | Shrewd Analysis [04106](http://localhost:5173/tool/tag-browser?tab=card&focus=04106) | "upgrade a second copy … at no experience cost"; zero tags | H |
| | Refine [09121](http://localhost:5173/tool/tag-browser?tab=card&focus=09121) | "mark a checkbox on an upgrade sheet" (= Raven Quill) | M |
| [`commit-fetch`](http://localhost:5173/tool/tag-browser?tag=commit-fetch) | Mandy Thompson [06002](http://localhost:5173/tool/tag-browser?tab=card&focus=06002) | elder sign: "Search the top 3 … either draw it or commit it" (= Guided by the Unseen) | H |
| [`commit-count-condition`](http://localhost:5173/tool/tag-browser?tag=commit-count-condition) | Analytical Mind [03010](http://localhost:5173/tool/tag-browser?tab=card&focus=03010) | "After you commit exactly 1 card" | H |
| [`timing-skill-st2-commit-cards`](http://localhost:5173/tool/tag-browser?tag=timing-skill-st2-commit-cards) | Minh Thi Phan [03002](http://localhost:5173/tool/tag-browser?tab=card&focus=03002) | "After an investigator … commits a card" (= Grisly Totem) | H |
| | Analytical Mind [03010](http://localhost:5173/tool/tag-browser?tab=card&focus=03010) | same trigger | H |
| [`clue-place-your-location`](http://localhost:5173/tool/tag-browser?tag=clue-place-your-location) | Search for the Truth (Adv.) [90079](http://localhost:5173/tool/tag-browser?tab=card&focus=90079) | "Place that clue on your location" | H |
| | Analysis [09049](http://localhost:5173/tool/tag-browser?tab=card&focus=09049) / Rex Murphy [90078](http://localhost:5173/tool/tag-browser?tab=card&focus=90078) | own-clue placement; no clue tag / only the curse half tagged | M |
| [`deck-draw-fill-hand`](http://localhost:5173/tool/tag-browser?tag=deck-draw-fill-hand) | Nothing Left to Lose [06284](http://localhost:5173/tool/tag-browser?tab=card&focus=06284) | "draw cards until you have 5 cards in your hand" | H |
| [`duration-next`](http://localhost:5173/tool/tag-browser?tag=duration-next) (or a round variant) | Pnakotic Manuscripts [04307](http://localhost:5173/tool/tag-browser?tab=card&focus=04307) | "for the next skill test … this round"; no duration tag | H |
| | One in the Chamber [09029](http://localhost:5173/tool/tag-browser?tab=card&focus=09029) | "your next attack with that asset this round" | H |
| | Experimental Psychology [60252](http://localhost:5173/tool/tag-browser?tab=card&focus=60252), .18 Derringer [60522](http://localhost:5173/tool/tag-browser?tab=card&focus=60522), Hatchet Man [04155](http://localhost:5173/tool/tag-browser?tab=card&focus=04155), Gray's Anatomy [09058](http://localhost:5173/tool/tag-browser?tab=card&focus=09058) | one-shot "next …" riders | M |
| [`duration-next-skill-test-this-phase`](http://localhost:5173/tool/tag-browser?tag=duration-next-skill-test-this-phase) | Expose Weakness [02228](http://localhost:5173/tool/tag-browser?tab=card&focus=02228) / [04195](http://localhost:5173/tool/tag-browser?tab=card&focus=04195) | "for the next attack … this phase" (has until-end-phase) | M |
| [`tank-redirect-encounter`](http://localhost:5173/tool/tag-browser?tag=tank-redirect-encounter) | Deliverance [11079](http://localhost:5173/tool/tag-browser?tab=card&focus=11079) | "You draw each encounter card that would normally be drawn this mythos phase" | H |
| [`enemy-engage-with-you`](http://localhost:5173/tool/tag-browser?tag=enemy-engage-with-you) | "I'm done runnin'!" [05016](http://localhost:5173/tool/tag-browser?tab=card&focus=05016) | "Ready and engage all enemies" (all 3 Taunts carry it) | H |
| [`enemy-engage-none`](http://localhost:5173/tool/tag-browser?tag=enemy-engage-none) | The Truth Beckons [07154](http://localhost:5173/tool/tag-browser?tab=card&focus=07154) | "Play only if you are not engaged with an enemy" | H |
| [`enemy-engage-not-with-you`](http://localhost:5173/tool/tag-browser?tag=enemy-engage-not-with-you) | Telescopic Sight [05230](http://localhost:5173/tool/tag-browser?tab=card&focus=05230) | same clause as Springfield M1903, which has it | H |
| [`enemy-value-fight`](http://localhost:5173/tool/tag-browser?tag=enemy-value-fight) | .45 Thompson (3) [05187](http://localhost:5173/tool/tag-browser?tab=card&focus=05187) | "where X is that enemy's fight value" | H |
| [`enemy-mitigation-defeat`](http://localhost:5173/tool/tag-browser?tag=enemy-mitigation-defeat) | Monster Slayer (5) [02300](http://localhost:5173/tool/tag-browser?tab=card&focus=02300) | "defeat that enemy" (Waylay has it) | H |
| [`location-shroud-dependent`](http://localhost:5173/tool/tag-browser?tag=location-shroud-dependent) | Stirring Up Trouble [07112](http://localhost:5173/tool/tag-browser?tab=card&focus=07112) | "equal to your location's shroud value" | H |
| [`hand-size-max-decrease`](http://localhost:5173/tool/tag-browser?tag=hand-size-max-decrease) | George Barnaby [11017](http://localhost:5173/tool/tag-browser?tab=card&focus=11017) | "max hand size is equal to the number of facedown cards … (Limit 5)"; `value` needs to allow dynamic | H |
| [`hand-size-max-increase`](http://localhost:5173/tool/tag-browser?tag=hand-size-max-increase) | Dream-Enhancing Serum [06159](http://localhost:5173/tool/tag-browser?tab=card&focus=06159) | "Only the first copy of each card … counts toward your maximum hand size" | M |
| [`recursion-event`](http://localhost:5173/tool/tag-browser?tag=recursion-event) | Speak to the Dead [10091](http://localhost:5173/tool/tag-browser?tab=card&focus=10091) | "return the chosen event to your hand" | H |
| | Hunter's Instinct [60574](http://localhost:5173/tool/tag-browser?tab=card&focus=60574) / [12074](http://localhost:5173/tool/tag-browser?tab=card&focus=12074) | "Add a level 0(-2) event in your discard pile to your hand" | H |
| | Do-or-Die [60568](http://localhost:5173/tool/tag-browser?tab=card&focus=60568) | "[survivor] asset or event in your discard pile … add it to your hand" (also recursion-asset) | M |
| [`recursion-asset`](http://localhost:5173/tool/tag-browser?tag=recursion-asset) | Jumpsuit [12075](http://localhost:5173/tool/tag-browser?tab=card&focus=12075) | "[[Tool]] or [[Weapon]] asset in your discard pile … add it to your hand" | H |
| | A Chance Encounter [02270](http://localhost:5173/tool/tag-browser?tab=card&focus=02270) / [03238](http://localhost:5173/tool/tag-browser?tab=card&focus=03238), Tetsuo Mori [06155](http://localhost:5173/tool/tag-browser?tab=card&focus=06155), Randall Cho [60102](http://localhost:5173/tool/tag-browser?tab=card&focus=60102) | ally/item/weapon from the discard pile | M |
| [`timing-when-enemy-spawns-your-location`](http://localhost:5173/tool/tag-browser?tag=timing-when-enemy-spawns-your-location) | Ambush [03148](http://localhost:5173/tool/tag-browser?tab=card&focus=03148) | "After an enemy spawns at attached location" | H |
| [`trait-support-science`](http://localhost:5173/tool/tag-browser?tag=trait-support-science) + [`trait-support-tool`](http://localhost:5173/tool/tag-browser?tag=trait-support-tool) | Well-Funded [10051](http://localhost:5173/tool/tag-browser?tab=card&focus=10051) | "While you control a [[Science]] or [[Tool]] asset" | H |
| | Kate Winthrop [10004](http://localhost:5173/tool/tag-browser?tab=card&focus=10004) | "Move 1 clue … to a [[Science]] or [[Tool]] asset" | M |
| [`trait-support-ally`](http://localhost:5173/tool/tag-browser?tag=trait-support-ally) | Charlie Kane [09018](http://localhost:5173/tool/tag-browser?tab=card&focus=09018), Bonnie Walsh [09019](http://localhost:5173/tool/tag-browser?tab=card&focus=09019) | exhaust/ready an [[Ally]] | M |
| [`trait-support-relic`](http://localhost:5173/tool/tag-browser?tag=trait-support-relic) | Enchant Weapon [07261](http://localhost:5173/tool/tag-browser?tab=card&focus=07261) | "gains the [[Relic]] trait" | M |
| [`slot-ignore`](http://localhost:5173/tool/tag-browser?tag=slot-ignore) | Trigger Man [09076](http://localhost:5173/tool/tag-browser?tab=card&focus=09076) | "Attach an [[Illicit]] asset … to Trigger Man" | H |
| [`slot-convert`](http://localhost:5173/tool/tag-browser?tag=slot-convert) | Astral Mirror [09091](http://localhost:5173/tool/tag-browser?tab=card&focus=09091) | empty arcane slots → hand slots | M |
| [`chaos-resolve-additional`](http://localhost:5173/tool/tag-browser?tag=chaos-resolve-additional) | Evanescent Ascension [10039](http://localhost:5173/tool/tag-browser?tab=card&focus=10039) | "Resolve that investigator's [elder_sign] effect (in addition…)"; no chaos tag | M |
| [`chaos-downside-action`](http://localhost:5173/tool/tag-browser?tag=chaos-downside-action) | Old Hunting Rifle [04273](http://localhost:5173/tool/tag-browser?tab=card&focus=04273) | the jam on [skull]/[auto_fail]; no downside tag | M |
| `chaos-downside-*` | Lucky Dice [02230](http://localhost:5173/tool/tag-browser?tab=card&focus=02230), Seal of the Seventh Sign [04311](http://localhost:5173/tool/tag-browser?tab=card&focus=04311), Chthonian Stone [53008](http://localhost:5173/tool/tag-browser?tab=card&focus=53008) | lose the card/uses on a bad token | M |
| [`chaos-do-not-reveal`](http://localhost:5173/tool/tag-browser?tag=chaos-do-not-reveal) | Three Aces [06199](http://localhost:5173/tool/tag-browser?tab=card&focus=06199) | "(do not reveal chaos tokens from the chaos bag)" (see G1) | M |
| [`chaos-seal-token-any`](http://localhost:5173/tool/tag-browser?tag=chaos-seal-token-any) | Premonition [04199](http://localhost:5173/tool/tag-browser?tab=card&focus=04199) | "reveal a random chaos token … seal it"; its twin 12064 has the tag | M |
| [`chaos-predict`](http://localhost:5173/tool/tag-browser?tag=chaos-predict) | Scrying Mirror [60406](http://localhost:5173/tool/tag-browser?tab=card&focus=60406) | "Perform the 'reveal chaos token' step … now" | M |
| [`buff-cannot-attack-you`](http://localhost:5173/tool/tag-browser?tag=buff-cannot-attack-you) | Infighting [03314](http://localhost:5173/tool/tag-browser?tab=card&focus=03314) | "Cancel all attacks made by non-[[Elite]] enemies against you this phase" | M |
| [`enemy-engage-with-you-multiple`](http://localhost:5173/tool/tag-browser?tag=enemy-engage-with-you-multiple) | "Get behind me!" [08021](http://localhost:5173/tool/tag-browser?tab=card&focus=08021) | every would-be attacker then engages you | M |
| [`enemy-evade-multiple`](http://localhost:5173/tool/tag-browser?tag=enemy-evade-multiple) | Lightfooted [10076](http://localhost:5173/tool/tag-browser?tab=card&focus=10076), Expeditious Retreat [06246](http://localhost:5173/tool/tag-browser?tab=card&focus=06246), Silas's Net [07015](http://localhost:5173/tool/tag-browser?tab=card&focus=07015) | "evade another enemy" | M |
| [`enemy-ignore-keyword`](http://localhost:5173/tool/tag-browser?tag=enemy-ignore-keyword) | Mesmeric Influence [10096](http://localhost:5173/tool/tag-browser?tab=card&focus=10096) | "ignore all keyword … effects" | M |
| [`gain-resource-move-investigator`](http://localhost:5173/tool/tag-browser?tag=gain-resource-move-investigator) | Charles Ross, Esq. [03149](http://localhost:5173/tool/tag-browser?tab=card&focus=03149), Bob Jenkins [08016](http://localhost:5173/tool/tag-browser?tab=card&focus=08016) | resource pooling across investigators | M |
| [`location-connecting-investigator`](http://localhost:5173/tool/tag-browser?tag=location-connecting-investigator) | Bestow Resolve [09032](http://localhost:5173/tool/tag-browser?tab=card&focus=09032), Contemplative [11088](http://localhost:5173/tool/tag-browser?tab=card&focus=11088) | "at your location or a connecting location" (only in the commit range arg) | M |
| [`location-clue-exist`](http://localhost:5173/tool/tag-browser?tag=location-clue-exist) | Roland Banks [01501](http://localhost:5173/tool/tag-browser?tab=card&focus=01501) | elder sign "+1 for each clue on your location" | M |
| [`deck-look-you`](http://localhost:5173/tool/tag-browser?tag=deck-look-you) | Norman Withers [08004](http://localhost:5173/tool/tag-browser?tab=card&focus=08004), Livre d'Eibon [08005](http://localhost:5173/tool/tag-browser?tab=card&focus=08005) | top card revealed / swap the top card | M |
| [`deck-look-encounter`](http://localhost:5173/tool/tag-browser?tag=deck-look-encounter) | Eye of Ghatanothoa [11073](http://localhost:5173/tool/tag-browser?tab=card&focus=11073) | "top card of the encounter deck revealed" | M |
| [`deck-look-place-bottom`](http://localhost:5173/tool/tag-browser?tag=deck-look-place-bottom) | Underworld Market [09077](http://localhost:5173/tool/tag-browser?tab=card&focus=09077) | "Place the rest on the bottom" (market deck; edge case) | M |
| [`discard-pile-to-deck`](http://localhost:5173/tool/tag-browser?tag=discard-pile-to-deck) | Persistence [10118](http://localhost:5173/tool/tag-browser?tab=card&focus=10118), Improvised Weapon [04033](http://localhost:5173/tool/tag-browser?tab=card&focus=04033)/[11092](http://localhost:5173/tool/tag-browser?tab=card&focus=11092), Winging It [04272](http://localhost:5173/tool/tag-browser?tab=card&focus=04272), Impromptu Barrier [04312](http://localhost:5173/tool/tag-browser?tab=card&focus=04312) | used from the discard pile, then shuffled back (Isabelle 12013 has it) | M |
| [`discard-pile-to-bottom-deck`](http://localhost:5173/tool/tag-browser?tag=discard-pile-to-bottom-deck) | Wendy's Amulet [01514](http://localhost:5173/tool/tag-browser?tab=card&focus=01514) / [90039](http://localhost:5173/tool/tag-browser?tab=card&focus=90039) | plays from the discard pile → bottom of the deck | M |
| [`doom-prevent-advance`](http://localhost:5173/tool/tag-browser?tag=doom-prevent-advance) | Elle Rubash [09092](http://localhost:5173/tool/tag-browser?tab=card&focus=09092), Handcuffs [04265](http://localhost:5173/tool/tag-browser?tab=card&focus=04265) | doom that doesn't count / cannot be placed | M |
| [`ready-ally`](http://localhost:5173/tool/tag-browser?tag=ready-ally) | "Ashcan" Pete [02005](http://localhost:5173/tool/tag-browser?tab=card&focus=02005) | elder sign "Ready Duke" | M |
| [`stats-mod-boost-in-test-any`](http://localhost:5173/tool/tag-browser?tag=stats-mod-boost-in-test-any) | Granny Orne [60508](http://localhost:5173/tool/tag-browser?tab=card&focus=60508) | "fails by either 1 less or 1 more"; no tag at all (60527 has this one) | M |
| skill-value-succeed-by-* | Inquisitive [11101](http://localhost:5173/tool/tag-browser?tab=card&focus=11101), Lab Coat [09050](http://localhost:5173/tool/tag-browser?tab=card&focus=09050) | "succeed by up to 2 more or down to 2 less" / "You succeed by 0, instead" | M |
| [`timing-when-take-damage`](http://localhost:5173/tool/tag-browser?tag=timing-when-take-damage) (+horror) | Guard Dog [01521](http://localhost:5173/tool/tag-browser?tab=card&focus=01521) / [09034](http://localhost:5173/tool/tag-browser?tab=card&focus=09034), Flesh Ward [60106](http://localhost:5173/tool/tag-browser?tab=card&focus=60106) | damage-on-this-asset / damage from an attack windows | M |
| [`timing-after-seal-cancel-ignore-token`](http://localhost:5173/tool/tag-browser?tag=timing-after-seal-cancel-ignore-token) | Diana Stanley [05004](http://localhost:5173/tool/tag-browser?tab=card&focus=05004), Nihilism [60404](http://localhost:5173/tool/tag-browser?tab=card&focus=60404) | "cancels or ignores" triggers | M |
| [`timing-after-discover-clue`](http://localhost:5173/tool/tag-browser?tag=timing-after-discover-clue) | Newspaper (2) [03313](http://localhost:5173/tool/tag-browser?tab=card&focus=03313) | "When you would discover 1 or more clues" | M |
| [`uses-accumulate`](http://localhost:5173/tool/tag-browser?tag=uses-accumulate) | Darrell's Kodak [09016](http://localhost:5173/tool/tag-browser?tab=card&focus=09016) | moves evidence onto itself | M |
| `uses-support-*` | Ghastly Possession [09090](http://localhost:5173/tool/tag-browser?tab=card&focus=09090) | "replenish half of its uses" (any use type) | M |
| `testless-damage-*` | Grievous Wound [09027](http://localhost:5173/tool/tag-browser?tab=card&focus=09027), Scarlet Rot [10089](http://localhost:5173/tool/tag-browser?tab=card&focus=10089), Archive of Conduits [08041](http://localhost:5173/tool/tag-browser?tab=card&focus=08041), Taunt (3) [60130](http://localhost:5173/tool/tag-browser?tab=card&focus=60130) | damage with no test | M |
| `cost-*-damage-self` | Blood Curse [60467](http://localhost:5173/tool/tag-browser?tab=card&focus=60467) | "take 1 direct damage" (only damage-to-investigator) | M |
| (resource spend) | Double Down [11107](http://localhost:5173/tool/tag-browser?tab=card&focus=11107) | "spend up to 3 resources"; no resource tag | M |
| [`action-additional`](http://localhost:5173/tool/tag-browser?tag=action-additional) | Riot Whistle [07108](http://localhost:5173/tool/tag-browser?tab=card&focus=07108) | `canOnlyBeUsedTo` engage can't be expressed; kohaku `BasicAction` has no Engage | M |
| `play-area-from-investigator` | Bob Jenkins [08016](http://localhost:5173/tool/tag-browser?tab=card&focus=08016) | "play an [[Item]] asset from the hand of an investigator" | H |

---

## E. Wrong members (card-level)

- "Where's the party?" [11053](http://localhost:5173/tool/tag-browser?tab=card&focus=11053): [`enemy-exhaust`](http://localhost:5173/tool/tag-browser?tag=enemy-exhaust) puts an enemy *spawn* into Enemy Nerf / Mitigation. [H]
- Siren Call [07016](http://localhost:5173/tool/tag-browser?tab=card&focus=07016) in [`commit-count-condition`](http://localhost:5173/tool/tag-browser?tag=commit-count-condition): it taxes icons, not the card count, and it's a weakness.
  If it stays, The King in Yellow [03011](http://localhost:5173/tool/tag-browser?tab=card&focus=03011) ("cannot commit exactly 1 or 2 cards") should join. [M]
- Chemistry Set [10040](http://localhost:5173/tool/tag-browser?tab=card&focus=10040) `skill-value-fail-by-exactly{2}` is a penalty, and it lands in Fail By / Fail
  Forward. The same class shows up as `succeed-by-exactly{0}` penalties in Succeed By: Brand of Cthugha ×2,
  Divination ×2, Blur ×2, Earthly Serenity ×2. [M]
- Bianca "Die Katz" [10063](http://localhost:5173/tool/tag-browser?tab=card&focus=10063) [`victory-display-self`](http://localhost:5173/tool/tag-browser?tag=victory-display-self): this is weakness removal. [M]
- The Black Cat [06285](http://localhost:5173/tool/tag-browser?tab=card&focus=06285): the damage/horror goes on the Cat, but it sits in Self Harm. [M]
- Scrying L3 [01690](http://localhost:5173/tool/tag-browser?tab=card&focus=01690) / [03236](http://localhost:5173/tool/tag-browser?tab=card&focus=03236) and Feed the Mind L3 [04267](http://localhost:5173/tool/tag-browser?tab=card&focus=04267): `cost-horror-self` on a conditional drawback. [M]
- "Devil" [10119](http://localhost:5173/tool/tag-browser?tab=card&focus=10119), Wrong Place, Right Time [10115](http://localhost:5173/tool/tag-browser?tab=card&focus=10115): `tank-move{cross-investigator}` moves damage off you. [M]
- Premonition twins disagree: 04199 has `chaos-seal-revealed`, 12064 has `chaos-seal-token-any`.
  The reworded text allows the difference, but a search should find both. [M]
- Weaknesses leak into archetype compounds via generic tags: Baron Samedi (Doom Adding), Dendromorphosis
  (Self Harm), Kleptomania (Cross-Deck), Thrice-Damned Curiosity (Big Hand), Rex's Curse, Glimpse the
  Void and Ectoplasmic Horror (Chaos Token Control), Atychiphobia and three others (Fail Forward). See G9.

---

## F. Doc drift

- [`uses-board-marker`](http://localhost:5173/tool/tag-browser?tag=uses-board-marker) JSDoc (`uses/marker.ts`) and its `rulings.json` entry cite **Occult Reliquary**, a slot
  card that is correctly not tagged. The real second member is Darrell's Kodak.
- [`clue-place-your-location`](http://localhost:5173/tool/tag-browser?tag=clue-place-your-location) JSDoc/RULING say "from the token bank", but 3 of its 4 members place *your own*
  clues. Only Mysteries Remain uses the token bank.
- [`recursion-replay`](http://localhost:5173/tool/tag-browser?tag=recursion-replay) JSDoc still says "/ resolve an ability an extra time", even though the RULING moved
  Abigail Foreman off.
- [`phase-skip`](http://localhost:5173/tool/tag-browser?tag=phase-skip) JSDoc says "an entire phase", but its members skip the mythos draw *step*.
- [`enemy-defeat-on-attack-success`](http://localhost:5173/tool/tag-browser?tag=enemy-defeat-on-attack-success): the JSDoc says "attack/skill test" but the name says attack.
- [`location-move-enemy-control`](http://localhost:5173/tool/tag-browser?tag=location-move-enemy-control) has no JSDoc; one line would prevent drift into `-displace`.
- [`campaign-deck-swap-between-games`](http://localhost:5173/tool/tag-browser?tag=campaign-deck-swap-between-games): the name says "deck swap"; the JSDoc says "campaign benefit".
- Compound descriptions and JSDocs:
  - Agility, Intellect and Combat Boost still say "(or any-skill)".
  - Evasion Package still references the deleted Getaway compound.
  - Search says "or bonded", but its JSDoc says bonded-fetch is deliberately excluded.
  - Efficient Clue's JSDoc cites testless clues and "Look what I found!", neither of which is in it.
  - Efficient Damage still says "or testless damage" and cites Beat Cop.
  - Ally Support says "(incl. Ally-only ally slots)".
  - Protector Tank says "then ready it again".
  - Commit says "add icons (Winifred…)".
  - Weapon Support promises separate trait compounds.
  - `desc_compound_efficient_clue` and `desc_compound_willpower_boost` are empty.
- Where-members that match 0 cards: Conditional Passive Boost `passive-any{evade}` / `{investigate}`, Evade
  Payoff `passive-any{evade}`, Willpower Boost `stats-mod-boost-lasting-willpower` (kept deliberately as a
  slot).

---

## G. Policy calls (need your ruling before a sweep)

1. Does a pre-reveal auto-success count as [`chaos-do-not-reveal`](http://localhost:5173/tool/tag-browser?tag=chaos-do-not-reveal)? Three Aces says so explicitly. Justify
   the Means, Toe to Toe, One-Two Punch, Exploit Weakness and Shed a Light do it implicitly.
2. Do skill cards with "After you commit X" riders get `st2{after}`? By the st8 ruling's logic they would:
   Daredevil, Copycat, Prescient, Promise of Power, Unrelenting, Signum Crucis, Double Down, Out the Door, …
3. Is "cancel the drawing" (Maleson 02302) really distinct from "cancel its effects"? See "Your two examples".
4. Campaign-level benefits: XP gain (Charon's Obol, In the Thick of It, Ascetic, "Let God sort them out…"),
   trauma removal (Spiritual Healing), carry-over resources (Embezzled Treasure). Widen and rename the campaign
   tag (e.g. `campaign-between-games`), add a sibling, or rule them untagged like Myriad.
5. Uses pools with a unique token name: merge into `uses-starting-other{tokenName}` and tag renown, rumors,
   leads, shell, arrow, time and aether? This was already open in §5.
6. Event recursion convention: players-from-discard carry [`recursion-play-from-discard`](http://localhost:5173/tool/tag-browser?tag=recursion-play-from-discard) but not
   [`recursion-event`](http://localhost:5173/tool/tag-browser?tag=recursion-event) (Wendy's Amulet, De Vermis, Agatha, Eidetic Memory). Their asset twins do the opposite
   (Yorick, Salvage and Scavenging carry [`recursion-asset`](http://localhost:5173/tool/tag-browser?tag=recursion-asset) but not `play-from-discard`). Pick one rule.
7. Should Evasion Package include [`action-bold-evade`](http://localhost:5173/tool/tag-browser?tag=action-bold-evade)? Should Bold Action include move and engage?
8. Fail Forward is "payoffs only". How should "If this test fails, ‹benefit›" cards enter it: a new base tag,
   or the after-fail timing, as Rabbit's Foot does?
9. Weaknesses in archetype compounds: exclude them by rule (a card-level flag the compound evaluation
   honors), or accept the leaks? **Resolved 2026-09-26: weaknesses are not tagged at all** (see the
   2026-09-26 report, §5), so nothing leaks.
10. Does [`commit-fetch`](http://localhost:5173/tool/tag-browser?tag=commit-fetch) include picking from *your own* discard pile (Gift of Nodens, Isabelle 12013, Silas)?
11. Engaged-enemy count: [`condition-engaged-alone`](http://localhost:5173/tool/tag-browser?tag=condition-engaged-alone) (= 1) and [`enemy-engage-none`](http://localhost:5173/tool/tag-browser?tag=enemy-engage-none) (= 0) exist, but the
    scalers (Trench Knife, "Not without a fight!") have no tag. A `condition-engaged-count{comparison,value}`
    would unify them.
12. Actions given to a teammate (Guidance, Carson Sinclair, Blood of Thoth) can't be told apart from your
    own for [Support](http://localhost:5173/tool/tag-browser?compound=c-support). Add a `target` argument?

---

## H. Checked and fine (94 of 156)

Nothing else in the game has these effects, so their small counts are real:

action-bold-resign, action-bold-engage, attach-investigator, buff-asset-health, buff-asset-sanity,
buff-investigator-health, cancel-weakness-draw, cancel-failed-test-effects, cancel-discard-from-hand,
cancel-lose-resource, cancel-lose-action, cancel-use-instead, condition-engaged-alone, chaos-bag-replace,
chaos-downside-resource, chaos-ignore-effect, chaos-predict, chaos-seal-token-elder-sign,
chaos-seal-token-auto-fail, chaos-seal-token-curse, defeat-self, cost-free-spend-durability,
cost-reaction-damage-self, cost-reaction-horror-self, cost-reaction-spend-supply, cost-reaction-spend-ammo,
damage-instead-range, damage-instead-fail-range, damage-redirect-attack, damage-redirect-own-attack,
damage-spread, deck-discard-card-random, doom-move, duration-enemy-phase, encounter-offload,
enemy-cannot-move-into-location, enemy-cannot-move, enemy-cannot-attack, enemy-engage-with-another,
enemy-nonweakness, enemy-value-health-reduction, gain-retaliate, gain-aloof, gain-alert,
location-create-connection, location-move-investigator-performer, location-move-enemy-control,
location-move-damage, location-move-enemy-to-you, location-ignore-effects, phase-skip, phase-repeat,
play-area-into-play-from-deck, play-area-into-play-from-discard, recursion-replay, remote-play-event,
skill-value-fail-by-or-less, skill-value-fail-by-or-more, skill-value-fail-by-dynamic,
skill-value-from-resource, slot-additional-accessory, slot-additional-tarot, slot-share,
stats-mod-boost-lasting-intellect, stats-mod-boost-lasting-combat, stats-mod-boost-lasting-agility,
tank-redirect-attack, test-repeat-failed, timing-phase-mythos-ends, timing-phase-mythos-draw-encounter,
timing-phase-investigation-take-action, timing-phase-enemy-ends, timing-phase-enemy-begins,
timing-phase-mythos-check-doom, timing-phase-investigation-ends, timing-skill-st4-apply-chaos-effect,
timing-when-search-deck, victory-display-self, victory-display-add-encounter, trait-support-supply,
trait-support-innate, trait-support-ranged, trait-support-spirit, trait-support-trick,
trait-support-practiced, trait-support-fortune, trait-support-charm, trait-support-armor,
trait-support-melee, trait-support-talent, uses-board-marker, uses-starting-evidence,
uses-starting-inspiration, uses-support-evidence.

(Some OK tags still have a compound gap or doc fix listed above; "OK" here only means "no missed members".)
Tags with ≥ 5 names were not hunted in this pass.
