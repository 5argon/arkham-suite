# Scenario-tag audit (the `full_build` class)

> **STATUS (resolved):** §1 RT base→return (structural translation in apply.mjs),
> §2 four campaign-wide reclasses, §5 do_you_get_it_now correction — all applied.
> §3 chaos_chaos + clutches resolved by collapsing the kohaku version enums
> (City of the Elder Things 1/2/3 → one scenario; Return-to In the Clutches of Chaos
> 1/2 → one). §4 = no change.
>
> **No `scenario: string[]` array support** (decided 2026-06-20). The two genuinely
> cross-scenario achievements are made campaign-wide instead:
> - `tic/dont_wake_daddy` — AND across Lair of Dagon + Into the Maelstrom; treat as
>   campaign-wide (checked at the finale anyway).
> - `rtdwl/remind_me_not_to_piss_her_off` — "defeat either version of Seth Bishop while
>   Naomi O'Bannion is under your control." The controllable Naomi ally is RT-only
>   (card 51052, pack rtdwl), so it is NOT earnable in base Dunwich: un-shared (removed
>   from dwl) and campaign-wide in rtdwl (spans both Seth Bishop scenarios).


Triggered by: TIC `full_build` was tagged to `into_the_maelstrom` only, but its three
relics are acquired across Devil Reef / A Light in the Fog / Hidden Truths and can be
equipped together in many later scenarios → **fixed to campaign-wide** (already applied).

A 17-campaign sweep (one judge per campaign vs. AC source + card data) checked all
**132** scenario-tagged achievements. **123 confirmed correctly tagged.** The rest below.

The per-scenario UI filter is a literal `def.scenario === kohakuScenario` compare, so a
tag must equal the **kohaku enum string** the campaign actually surfaces — not the AC
campaign-log id. That distinction overturns two of the judges' findings (see §4).

---

## 1. SYSTEMIC — Return-to campaigns: base codes never match (biggest find)

Every Return-to campaign surfaces `return_to_*` scenario codes (e.g.
`returnToTheNightOfTheZealotCampaign` → `return_to_the_gathering`), but **all 37**
scenario-tagged achievements across rtnotz/rtdwl/rtptc/rttfa/rttcu are tagged with
**base** codes (`the_gathering`). So `achievementsForScenario` returns empty for every
RT scenario — the per-scenario "Achievements you can earn here" card never appears in
any Return-to campaign. (The campaign-wide Achievements tab is unaffected; it doesn't
filter by scenario.)

**Fix:** re-tag base → `return_to_` + base. Deterministic for all but one:
`in_the_clutches_of_chaos` → `return_to_in_the_clutches_of_chaos_1` (has versions _1/_2,
see §3).

| campaign | base tags in use → return target |
|---|---|
| rtnotz | the_gathering, the_midnight_masks, the_devourer_below → `return_to_*` |
| rtdwl | extracurricular_activity, the_miskatonic_museum, the_essex_county_express, undimensioned_and_unseen, where_doom_awaits, lost_in_time_and_space → `return_to_*` |
| rtptc | curtain_call, the_last_king, echoes_of_the_past, the_unspeakable_oath, the_pallid_mask, black_stars_rise, dim_carcosa → `return_to_*` |
| rttfa | threads_of_fate, the_boundary_beyond, heart_of_the_elders_part_1, the_city_of_archives, the_depths_of_yoth, shattered_aeons → `return_to_*` |
| rttcu | at_deaths_doorstep, union_and_disillusion → `return_to_*`; in_the_clutches_of_chaos → `return_to_in_the_clutches_of_chaos_1` |

---

## 2. Reclassify → campaign-wide (same defect as `full_build`)

#### `dwl/beyond_what_veil` — Beyond What Veil?  (currently `lost_in_time_and_space`)
Text names no scenario. "Beyond the Veil" is in the shared **sorcery** encounter set,
gathered in 4 DWL scenarios (extracurricular_activity, the_miskatonic_museum,
where_doom_awaits, lost_in_time_and_space). Earnable in any of them. → **campaign-wide**

#### `rtdwl/beyond_what_veil` — same as above (RT version). → **campaign-wide**

#### `notz/zealots_revent` — The Zealot's Revenge  (currently `the_gathering`)
"Have Lita Chantler's reaction deal the killing blow to the Ghoul Priest." You only gain
the Lita Chantler **ally** at The Gathering's *resolution* — she is not a controllable
asset *during* The Gathering — so this is not even earnable there. A surviving Ghoul
Priest is shuffled into The Midnight Masks and The Devourer Below, where Lita can land the
blow. Tag was pattern-matched off its neighbors. → **campaign-wide**

#### `rtnotz/zealots_revent` — same (RT version). → **campaign-wide**

---

## 3. Multi-scenario — needs a model decision (single `scenario` string can't hold two)

#### `tic/dont_wake_daddy` — Don't Wake Daddy  (currently `into_the_maelstrom`)
Text: "Complete **both** The Lair of Dagon **and** Into the Maelstrom without waking Dagon
or Hydra." Genuinely spans two scenarios. Single-string tag drops the Lair-of-Dagon half.
(Defensible as-is if we treat the tag as "the finale where it's finally checked.")

#### `rtdwl/remind_me_not_to_piss_her_off` — (currently `where_doom_awaits`)
"Defeat **either version** of Seth Bishop." Two enemies: Sorcerer of Dunwich
(where_doom_awaits) and Thrall of Yog-Sothoth (return_to_lost_in_time_and_space). Naomi is
a persistent ally → earnable in both. → `return_to_where_doom_awaits` + `return_to_lost_in_time_and_space`

#### `eoe/chaos_chaos` — Chaos Chaos  (currently `city_of_the_elder_things_1`)
"Collect and spend ten or more keys in City of the Elder Things." The campaign surfaces
all three versions (v. I/II/III = `city_of_the_elder_things_1/2/3`) as separate setup
cards; you play exactly one. Tag `_1` only shows on v. I — invisible if you played v. II/III.

#### `rttcu/in_the_clutches_of_chaos` (§1) — has versions `_1/_2`, same shape as chaos_chaos.

**Options:** (a) extend model to `scenario?: string | string[]` and tag all relevant
codes; (b) keep single-string — tag the finale/primary one and accept the others won't
surface; (c) make them campaign-wide.

---

## 4. Judge false-positives (verified — NO change)

#### `dwl/all_aboard` — judge said `the_essex_county_express` is an invalid code → should be `essex_county_express`.
Wrong: `the_essex_county_express` **is** the kohaku enum value (Scenario.TheEssexCountyExpress);
`essex_county_express` is only the AC log id. Current tag is correct. ✅

#### `eoe/chaos_chaos` — judge said `city_of_the_elder_things_1` is invalid → should be `city_of_the_elder_things`.
Wrong as stated: `_1` **is** a real kohaku enum (CityOfTheElderThings1); bare
`city_of_the_elder_things` matches no enum and would break the filter. The real issue is
the version-coverage gap, handled in §3.

---

## 5. Re-tag to the correct single scenario

#### `rtnotz/do_you_get_it_now` — Do You Get It Now?  (currently `the_gathering`)
Requires triggering Billy Cooper's Forced ability by defeating the Ghoul Priest at his
location. Billy Cooper exists only as the **Cultist deck** in The Midnight Masks. Mechanic
is locked to Midnight Masks, not The Gathering. → `return_to_the_midnight_masks` (RT code per §1).
