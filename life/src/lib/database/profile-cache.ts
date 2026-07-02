/**
 * profile-cache.ts — the persisted, per-subject precompute cache for profiles.
 * A "subject" is the account (all data), one roster member, or one play group;
 * each is cached in three independently-invalidated SEGMENTS:
 *
 *   - `meta`  — the campaigns list + calendar (cheap; also depends on logs for
 *                each calendar entry's clear `state`).
 *   - `logs`  — achievements / clear grid / win/loss record / endings /
 *                collections / scenario XP (medium).
 *   - `cards` — card usage / investigators / played codes (EXPENSIVE: scans
 *                every deck version).
 *
 * Each segment carries a `sig` (a cheap stable hash of its inputs); a recompute
 * rebuilds a segment only when its `sig` changes, so e.g. a date-only edit
 * rebuilds `meta` for affected subjects and leaves the costly `cards` segment
 * untouched. The whole cache rides inside the `DatabaseDocument` and is persisted
 * to IndexedDB — so everything stored here MUST be JSON-safe (no Date/Set/Map).
 * The payload types are already JSON-pure (campaign dates are ms-numbers, not
 * `Date`), so segments are stored verbatim. The cache is deliberately STRIPPED
 * from exported `.arkhamlife` files (it is derived data; recomputed once on import).
 */

import type { CardCode } from '@5argon/arkham-kohaku';
import type {
	CalendarEntry,
	CustomizableUsage,
	DeckTopEntry,
	EligibilityInsight,
	InsightDeck,
	InvestigatorStat,
	ProfileAchievementsData,
	ProfileCampaign,
} from '$lib/profile/profile-types';
import type { ClearGridRow, WinLossRecord, CampaignEndings } from '$lib/campaign/outcomes/clear-status';
import type { CampaignCollections } from '$lib/campaign/stats/collections';
import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
import type { CampaignStandaloneUsage } from '$lib/campaign/outcomes/standalone-usage';
import type { StandaloneArchiveStat } from '$lib/campaign/outcomes/standalone-archives';
import type { TraumaTally } from '$lib/campaign/outcomes/trauma';
import type { CampaignEoe } from '$lib/campaign/campaigns/eoe';
import type { CampaignTsk } from '$lib/campaign/campaigns/tsk-profile';
import type { CampaignDwl } from '$lib/campaign/campaigns/dwl';
import type { CampaignPtc } from '$lib/campaign/campaigns/ptc';
import type { CampaignTfa } from '$lib/campaign/campaigns/tfa';
import type { CampaignTcu } from '$lib/campaign/campaigns/tcu';
import type { CampaignTdea } from '$lib/campaign/campaigns/tdea';
import type { CampaignTdeb } from '$lib/campaign/campaigns/tdeb';
import type { CampaignTic } from '$lib/campaign/campaigns/tic';
import type { CampaignFhv } from '$lib/campaign/campaigns/fhv';
import type { CampaignTdc } from '$lib/campaign/campaigns/tdc';
import type { CampaignNotz } from '$lib/campaign/campaigns/notz';
import type { SpecialInteractionsPartial } from '$lib/campaign/outcomes/special-interactions';

/** Bump to invalidate EVERY cached segment at once (e.g. when a builder's
 *  output shape or logic changes). Stored alongside the cache; a mismatch
 *  forces a full rebuild. (8: cards segment gained `investigatorsByCampaign` —
 *  derived from existing deck data, so `cardsSig` is unchanged and only this
 *  version bump forces stale segments to rebuild with the new field. 9: logs
 *  segment gained `eoeCrash` — the EotE plane-crash tally. 10: the EotE tally
 *  was folded into one `eoe` blob (also carrying demons / survivors / supplies /
 *  camps), so every EotE widget reads one field. 11: endings gained per-tier reach
 *  counts (`byTier`) + a total `count`, and the `eoe` blob gained Fatal Mirage
 *  `memoriesDiscovered` / `memoriesBanished` + Frost-token `frostMax` / `frostMin`
 *  — old cached segments lack these. 12: the `eoe` blob gained `miasmaPlan` /
 *  `miasmaEludes`, `fatalMiragePlays`, and `iceDeathSkipped2` / `iceDeathSkipped3`.
 *  13: the `eoe` memory tally split into `memoriesBanishedLocations` /
 *  `memoriesBanishedEnemies` (the "discovered" set was dropped). 14: scenario XP
 *  gained per-difficulty `bestByTier`. 15: the `eoe` blob gained `rescued`, Ice and
 *  Death `iceDeathFled`/`iceDeathEscaped`/`iceDeathDefeated` + `shelterMax`/`shelterMin`,
 *  and Fatal Mirage `memBanishedMost`/`memBanishedLeast`. 16: Shelter is now derived
 *  from the camp reached (its log-line number) rather than a manual input. 17: the
 *  `eoe` Frost-token range (`frostMax` / `frostMin`) now counts only WINNING plays,
 *  so old cached values that included losses must rebuild. 18→19: logs segment
 *  gained the `tsk` blob — TSK Trust/Deception act tallies + Red Coterie outcomes.
 *  19→20: the `tsk` blob gained the final-bag Tablet / Elder Thing token range.
 *  20→21: the `tsk` blob gained winning `routes` (the scenario play-sequence), which
 *  also depends on the now order-preserving log payload. 21→22: the `tsk` blob gained
 *  `securedMembers` (Coterie members on your side) + `judgments` (Congress meeting routes).
 *  22→23: `tsk` routes now include complete-but-LOST campaigns (gated on the route
 *  starting at Riddles and Rain and ending at a finale, not on winning) and each route
 *  carries a `won` flag; the `tsk` blob also gained `scenarioVariantTallies` (resolutions
 *  reached per recorded level/version) — so old winning-only caches must rebuild.
 *  23→24: logs segment gained the `specialInteractions` partial (roster-gated flavor
 *  moments — Lola backstage, expedition leader, …; the roster is joined at assembly),
 *  derived from existing log data so `logsSig` is unchanged and only this bump rebuilds.
 *  24→25: the special-interactions catalogue is populated from the campaign-data package
 *  (not part of `logsSig`), so a logs segment cached before the package shipped them keeps
 *  an empty partial — this bump rebuilds it. Bump again whenever the package's special
 *  interactions change, since the cache can't otherwise detect package-data changes.
 *  25→26: the special-interactions partial changed shape (`rosterPlayIds` → `rosterPlays`
 *  carrying finish dates, for the most-recent "via" credit) — old cached partials lack it.
 *  26→27: two TSK route changes in the cached logs segment — (a) campaign-data un-attributed
 *  `cell_was_hollowed` (recorded at BOTH Without a Trace and Congress of the Keys) from any
 *  scenario, so the derived `route` no longer mis-adds a finale step; (b) `tsk.routes` now also
 *  carries abandoned (non-finale) runs plus a `complete` flag, for the per-scenario widgets.
 *  27→28: `tsk` payload gained `scenarioVariantPlays` (per scenario→variant authoritative play
 *  count from the recorded tier), so a per-variant lit resolution always has a matching Runs
 *  count even when that play logged no route.
 *  28→29: `tsk` payload gained `logCounts` (every recorded campaign_notes id → plays), the
 *  general per-log count bespoke per-scenario widgets read (e.g. Dealings' Ece-route stats).
 *  29→30: campaign-data added log/scenarioChoice infers for 4 TSK achievements (What's in a Name,
 *  Who Watches the Watcher, Gift of Gab, Take That Ghulat) + the recorded state now exposes
 *  `scenarioChoiceValues`; cached achievement earned/inferred status recomputes.
 *  30→31: scenarioXp stats gained `playsByTier` (the per-difficulty "played" hover); the `tsk`
 *  payload gained per-scenario `scenarioOutcomes` (log-derived Succeed/Failed tallies).
 *  31→32: the `tsk` payload gained per-route `time` + `achievements` (the "Successful Routes"
 *  widget) and per-key `keys` (Scarlet Keys obtained-vs-borne tallies + bearer art, for the split
 *  Obtained / Bearer widgets).
 *  32→33: `tsk.scenarioVariantPlays` became a per-difficulty tally (Runs hover), and the payload
 *  gained `sanguineWatcher` (secret-boss tally) + `sanguineTargets` (per-count runs + recent route
 *  for the Sanguine Shadows Targets table); its Succeed/Failed is now Chica/Weeping-Lady-bearer
 *  derived, falling back to the recorded R1/R3 resolution when the key was stolen after the run.
 *  33→34: route steps gained `finaleVersion` — Congress of the Keys' finale version (roman),
 *  derived from the trial's judgment (the log), so the route shows a version badge under it.
 *  34→35: Dancing Mad's version is now inferred from the log (deal-with-Desi ⇒ I, ambushed ⇒ II)
 *  and merged into the per-play tiers, so the variant table + route badge populate without Extra.
 *  35→36: the `tsk` payload gained `scenarioVariantOutcomes` (per-variant Succeed/Failed split), so
 *  the per-scenario variant table can show Succeed/Failed columns per tier instead of a Runs count.
 *  36→37: `tsk.judgments` became a per-difficulty tally (Congress "Reached" hover).
 *  37→38→39: the cards segment gained `usedOnceRaw` (per-card deck context for cards used in
 *  exactly one deck), resolved at assembly into the payload's `usedOnce` for the new
 *  "Core Set Cards Used Once" widgets; `specialistUsage` (specialist card → the investigator
 *  codes that used it) for the Specialist widget; and `insightDecks` (per-deck spotlight-card
 *  quantities) for the neutral-card insight widgets (Level 0 Core Set Neutral, Charisma &
 *  Relic Hunter). 39 consolidates these three shape additions into one version: a v38 cache
 *  persisted mid-implementation could hold a cards segment missing the later fields (the sig is
 *  unchanged, so it would otherwise be reused), which crashed `resolveUsedOnce`.
 *  39→40→41: the cards segment gained `charismaTopDecks` / `relicTopDecks` (per-deck best
 *  ally-/accessory-with-slot-card version, for the Charisma & Relic Hunter Top-3 tables) and
 *  `customizableUsage` (per customizable card: level + option tallies parsed from deck meta).
 *  41 supersedes 40: a v40 cache persisted between the version bump and the builder emit could
 *  hold a cards segment missing these fields (sig unchanged → reused), leaving the new tables /
 *  the Customizable widget empty (and so hidden).
 *  41→42: `customizableUsage` now records EVERY customizable card a deck ran (keyed by its
 *  max-ticked level, level 0 when included but un-customized), not only meta-customized ones.
 *  42→43: each customizable option became `{ count, recent }` (its activation count + up to 3
 *  most-recent investigators) instead of a bare count.
 *  43→44: the Desperate skill codes joined the insight-tracked set, so `insightDecks` now records
 *  their per-deck presence (for the Desperate Cards widget).
 *  44→45: precomputed headline aggregates added to the logs segment's blobs (serialize-numbers
 *  principle, see compiled-profile.ts) — `tsk` gained `sanguineWatcher.confronted`, `actsTotal`,
 *  `trustPct`, `fastestWinTime`/`slowestWinTime`, `distinctKeysObtained`/`distinctKeysBorne`; `eoe`
 *  gained `memoriesBanished{Locations,Enemies}Count`, `fatalMiragePlayCounts`, `mementosEarned`
 *  (the last filled at assembly from cardUsage); coverage entries gained `exploredPct`. Old cached
 *  logs segments lack these → rebuild. (The new cross-family `summary` block is assembled from
 *  segments at payload time, not cached, so it needs no segment of its own.)
 *  45→46: `tsk.sanguineTargets` now infers 6 targets from a recruited-La-Chica-Roja run
 *  (`chica_roja_is_on_your_side`), since the secret-boss path leaves the targets box blank — a
 *  builder-logic change with no input-signature change, so old caches must be force-rebuilt.
 *  46→47: Dead Heat now cross-fills its time tier ⇄ resolution at record assembly — the final
 *  tier (`DH.t.late`, 25+ time) and R5 (scenario skipped) imply each other, so a play that
 *  recorded one but not the other now credits both in resolution coverage + the per-tier variant
 *  tallies. Builder-logic change, input signature unchanged → force rebuild.
 *  47→48: the `tsk` blob gained `deadHeat` (Dead Heat civilians: rescued-over-slain stats + the
 *  best run per player count, ranked by net saved and by surplus over twice slain), built from the
 *  rescued/slain Extra counters + the play's resolved player count. Old caches lack it → rebuild.
 *  48→49: `deadHeat` gained the slain-over-rescued mirror stats, and Dead Heat now contributes a
 *  log-derived Succeed/Failed (`scenarioOutcomes.dead_heat`) — R3/R1 notes + a Last Blossom
 *  Key-bearer check, with the recorded resolution as the fallback for the R2/stolen-Key ambiguity.
 *  Builder-logic + payload change → rebuild.
 *  49→50: logs segment gained `soloClearGrid` + `trueSoloClearGrid` (the same per-family×tier
 *  clear grid as `clearGrid`, but folding in only 1-player plays — all solo for the former,
 *  true-solo only for the latter), for the new Solo / True Solo Campaign Clears widgets. The
 *  `logsSig` now also folds in each campaign's player count + multiHanded flag. Old caches lack
 *  the fields → rebuild.
 *  50→51: `deadHeat` gained `loversReunited` (plays that reunited the lovers — Amaranth's R1, from
 *  the `lovers_are_reunited` note), shown in the Dead Heat stat block. Old caches lack it → rebuild.
 *  51→52: the `tsk` blob's final-chaos-bag stats were reshaped for the Tablet vs Elder Thing table —
 *  the range scalars (`tabletMax`/`tabletMin`/`elderThingMax`/`elderThingMin`) and the overflow-XP
 *  aggregates (`tabletOverflowXp`/`elderThingOverflowXp` + `…MostInRun`) were replaced by three
 *  route-aware extremal runs (`mostTabletRun`/`mostElderThingRun`/`leastCombinedRun`), each carrying
 *  the run's Tablet+Elder Thing composition, the bonus XP it earned, and its route. Shape change → rebuild.
 *  52→53: the `tsk` blob's Red Coterie data was reshaped — the hand-picked `securedMembers` ("member on
 *  your side") and the `coterie` finale-outcome tally (which duplicated Congress of the Keys' Meeting
 *  Routes) were replaced by `voteTransitions` (per member → resulting vote → plays that achieved it),
 *  derived from the finale vote table. Shape change → rebuild.
 *  53→54: the `tsk` blob gained `erasedFromExistence` (the 5 most recent unique cards erased from
 *  existence in Dancing Mad / On Thin Ice, each with the finish date of the campaign it happened in),
 *  read from a new per-record `erasedCards` log extraction. Old caches lack it → rebuild.
 *  54→55: the `tsk` blob gained `voteHighs` (the single trial with the biggest Yea-over-Nay /
 *  Nay-over-Yea lead + the most Eerily Silent Coterie votes, each with its route), and On Thin Ice's
 *  log-derived Succeed/Failed became bespoke (R3 'Thorne disappeared' and R2 'haven't seen the last of
 *  Thorne' are wins, the void-chimera No-Resolution loss overrides R2, 'nothing of note' is the R4 loss,
 *  R1 counts only via an explicit resolution input). Builder-logic + payload change → rebuild.
 *  55→56: the `tsk` blob gained `keyObtained` (per scenario → plays that won the Scarlet Key there vs
 *  plays with a recorded resolution), derived from the resolution + logs (`keyObtainedFromScenario`) so
 *  it's independent of who holds the Key at the end. Old caches lack it → rebuild.
 *  56→57: per-scenario Succeed/Failed (`scenarioOutcomes` + `scenarioVariantOutcomes`) is now classified
 *  STRICTLY from the recorded resolution (`scenarioResultFromResolution`) — the log-only inference +
 *  bearer/resolution fallbacks were removed, so plays without an Extra resolution no longer count and a
 *  few borderline outcomes (e.g. On Thin Ice deal) reclassify. Recompute.
 *  57→58: the `tsk` blob gained `shadesOfSuffering` (Shades of Suffering — Tzu San Niang's sway: plays
 *  where she fell under your sway vs has you under hers, each by difficulty). Old caches lack it → rebuild.
 *  58→59: the `tsk` blob gained `baleEngine` and `ruinousChime` — the two no-scenario Key quests (Tuwile
 *  Masai / Dr. Irawan), fully log-derived (obtained by difficulty + quest-beat counts). Lack it → rebuild.
 *  59→60: the `tsk` blob gained `withoutATrace` (Without a Trace's outcome notes — knows the true nature /
 *  Aliki on your side / haven't seen the last of Aliki / cell was hollowed, each by difficulty, all scoped
 *  to the Without a Trace finale via the absence of a Congress vote-outcome). Lack it → rebuild.
 *  60→61: the `tsk` blob gained `sideQuests` — the four optional mini-quests (Special Delivery /
 *  Strange Architecture / Quid Pro Quo / Ruses and Reclamation), all log-derived (recorded notes,
 *  crossed-off completion, and the wrong-leads count). Lack it → rebuild.
 *  61→62: the `tsk` blob gained `finaleAllies` — per Coterie member, the campaigns they voted Nay and so
 *  fought the final battle alongside you (Conspirators), by difficulty; same vote resolution as
 *  `voteTransitions`, gated on reaching the Congress. Lack it → rebuild.
 *  62→63: the `tsk` blob gained `finaleEnemies` (members who voted Yea + the Red-Gloved Man, set aside as
 *  enemies; only those with an enemy card) and `deadAndGone` (the secret-scenario quest funnel to Without
 *  a Trace — whistle / off-mission / entered / true-nature + setbacks), both fully log-derived. Rebuild.
 *  63→64: bugfix — Without a Trace's true-nature / Aliki notes were wrongly gated on "no Congress
 *  judgment", which zeroed them for the normal run that plays the secret scenario and THEN reaches the
 *  Congress. They're now counted straight from the log (only `cell_was_hollowed` keeps that gating). Rebuild.
 *  64→65: the Erased From Existence list cap was raised from the 5 to the 10 most recent — subjects with
 *  more than 5 erased cards stored only 5, so they must rebuild to surface up to 10.
 *  65→66: the `tsk` blob gained `scenarioPlays` — the authoritative per-scenario "played" count
 *  (plays that recorded the scenario in ANY way: XP, a resolution, or a tier; deduped + by
 *  difficulty). The passport badge had used the XP-only generic count, which UNDERSHOOTS a play
 *  that recorded a resolution but earned no scenario XP (On Thin Ice's "nothing of note in
 *  Anchorage" skip), so `played` could read BELOW the resolution-derived Failed. Rebuild.
 *  66→67: Desi's Congress vote now reads the real/impostor Extra from `congress_of_the_keys.desi_identity`
 *  (it moved there from `dancing_mad.desi_identity` in campaign-data — the stored copy is flipped at the
 *  Trial, not Dancing Mad, where you're forbidden to look). Legacy `dancing_mad` recordings still resolve
 *  via a fallback read, but the vote tallies recompute. Rebuild.
 *  67→68: Tracked Tiers + Tracked Campaign Groups now filter the meta+logs segments — records outside
 *  a tracked difficulty/group are dropped before every aggregate (totals AND per-difficulty
 *  breakdowns), so untracked plays no longer pollute any stat. Both are now logs/meta cache inputs;
 *  changing either rebuilds those segments (cards are untouched). Rebuild.
 *  68→69: the Innate skill spotlights (Circle Undone) joined the insight-tracked code set, so
 *  the cards segment now records per-deck Innate quantities for the new "Innate Skills" widget's
 *  insight table. Existing caches lack those slots. Rebuild.
 *  69→70: the five starter-deck Lv.2 core-skill upgrades joined the insight-tracked code set for
 *  the new "Starter Core Skill Upgrades" widget's insight table. Existing caches lack those slots.
 *  Rebuild.
 *  70→71: every Vicious Blow / Deduction reprint (Lv.0 + Lv.2) joined the insight-tracked code set
 *  for the new "Vicious Blow & Deduction" + "Level 0 Core Set Cantrip Skills" widgets' insight
 *  tables. Existing caches lack those slots. Rebuild.
 *  71→72: the cards segment now runs every deck through the Vicious Blow / Deduction eligibility
 *  questions (canUse + did-it-run) into `eligibilityInsights`. New segment output. Rebuild.
 *  72→73: the cards segment now also counts `totalDecks` (the "% of decks" denominator for the
 *  Charisma & Relic Hunter / Core Neutral insight percentages). New segment output. Rebuild.
 *  73→74: the Vicious Blow / Deduction eligibility now tracks used + removed-not-upgraded (final
 *  version dropped every printing) instead of not-used; `eligibilityInsights` shape changed and
 *  the precompute scans each deck's final upgrade version. Rebuild.
 *  74→75: `eligibilityInsights` now also keeps the not-used count + investigators (the "can use
 *  but didn't" lens) alongside used / removed. Rebuild.
 *  75→76: `eligibilityInsights` now also keeps the never-removed investigators (used decks that
 *  kept a printing in the final version — the complement of removed). Rebuild.
 *  76→77: each `InsightDeck` now carries `cantripMax` (most distinct core cantrips in a SINGLE
 *  deck version) so the cantrip-diversity rows count per-version, not across the upgrade-chain
 *  union. Rebuild. */
/*  77→78: added the `dwl` blob — The Dunwich Legacy bespoke per-scenario tallies (openers
 *  order, kidnapped scholars, sacrifices, Necronomicon, broods, Ascending the Hill, finale). */
/*  78→79: added the `ptc` blob — The Path to Carcosa bespoke per-scenario tallies. */
/*  79→80: added the `tfa` blob — The Forgotten Age bespoke per-scenario tallies. */
/*  80→81: added the `tcu` blob — The Circle Undone bespoke per-scenario tallies. */
/*  81→82: added the `tdea` + `tdeb` blobs — The Dream-Eaters (The Dream-Quest + The Web of
 *  Dreams) bespoke per-scenario tallies, each carrying the shared interconnected view
 *  (play mode, the Black Cat, the Silver Key, Randolph, the epilogue matrix). */
/*  82→83: added the `tic` blob — The Innsmouth Conspiracy bespoke per-scenario tallies
 *  (memories, the seven-key finale gate, equipment, Harper, per-scenario, finale). */
/*  83→84: added the `fhv` blob — The Feast of Hemlock Vale bespoke per-scenario tallies
 *  (areas/schedule, 8 villager relationships, Fate of the Vale, the Hemlock curse). */
/*  84→85: added the `tdc` blob — The Drowned City bespoke per-scenario tallies
 *  (the Fold, 26 glyphs by scenario, 6 artifacts, side tasks, the Sepulchre better
 *  ending, per-scenario forks, the Doom of Arkham finale). */
/*  85→86: Return-to campaigns are now FIRST-CLASS families (keyed by their own code,
 *  no longer folded into the base via `originalId`) — family values across the payload
 *  change (rtdwl/rtptc/rttfa/rttcu/rtnotz become their own families). */
/*  86→87: added the `notz` blob — The Night of the Zealot bespoke per-scenario tallies
 *  (The Gathering / The Midnight Masks / The Devourer Below). */
/*  87→88: PtC blob extended (Unspeakable Oath insanity, Echoes per-player-count table,
 *  Last King slain-at-party VIPs) + Dim Carcosa `possessed` removed from win endings. */
/*  88→89: resolutionCoverage scenarios gained per-scenario `succeed`/`failed` tallies
 *  (generic, from campaign-data `resolutionOutcomes`) — feeds the scenario passport. */
/*  89→90: added the unified `scenarios` structure (one per-scenario record per campaign) — the
 *  single per-scenario source superseding scenarioXp + resolutionCoverage. */
/*  90→91: removed the now-redundant scenarioXp + resolutionCoverage structures — `scenarios` is
 *  the sole per-scenario source. */
/*  91→92: PtC runs gained tokenRoute / outcome / difficulty; added dcSources +
 *  tokenScenarioMixes (Doubt/Conviction per-change + chaos-token per-scenario coverage). */
/*  94→95: PtC Act-version serialization (runs' phantomVersion/oathVersion, per-version tallies on
 *  Phantom + Unspeakable Oath) and `vipHelp` (per home scenario: interview-bonus + slain-here). */
/*  95→96: `ScenarioStat` gained the unified `versions` per-version breakdown (the shared version table source). */
/*  96→97: retired the bespoke per-version blobs (eoeCity matrix, PtC phantom/oath versions, DWL
 *  ascendingHill) — all superseded by `ScenarioStat.versions`. */
/*  97→98: PtC `vipHelp` bonus / slainHere are now `{ total, byTier }` (per-difficulty hover on the
 *  VIP header counts). */
/*  98→99: retired TSK's `scenarioVariant{Tallies,Plays,Outcomes}` — its version + tier rows now ride
 *  the unified `ScenarioStat.versions` (multi-axis registry entry). */
/*  99→100: PtC `randomizedWeaknesses` is now `{ weakness, bearer, count }[]` (grouped by weakness +
 *  drawing investigator) instead of a `code→count` map. */
/*  100→101: PtC chaos-token route ends at the terminal scenario (Carcosa merged ⇒ Black Stars Rise);
 *  coverage counts only completed (win/loss) runs and no longer lists a receiver "base" mix. */
/*  101→102: PtC random-weakness draws are scoped to the viewed subject's investigators (a teammate's
 *  attributed weakness no longer shows on a single-player profile). */
/*  102→103: PtC Echoes `byPlayerCount` carries resolution-derived `{ succeed, failed, tallies }` per
 *  player count (Succeed / Failed via the shared version breakdown) instead of `{ plays, resolutions }`. */
/*  103→104: PtC Doubt/Conviction runs dropped the chain-vs-meter consistency fields (`consistent` /
 *  `recordedConviction` / `recordedDoubt`) — the mismatch warning is gone from the profile UI. */
/*  104→105: logs segment gained `standalones` — per-scenario aggregation of the first-class
 *  Standalone Archives (the separate `doc.standalones` array): plays, Standalone-Mode win/loss,
 *  resolution coverage, best score, and the deck XP-range distribution. `logsSig` now also folds in
 *  the standalone records. Old caches lack the field → rebuild. */
/*  105→106: PtC Curtain Call's Stranger-defeat highscore is derived from the warn-police resolution
 *  (no longer a manual Extra counter), so the `ptc` blob's `strangerByScenario` recomputes. */
/*  106→107: PtC investigator codes (insane / possessed / weakness bearer) canonicalized to the base
 *  printing — parallel / promo investigators match the roster instead of falling through. */
/*  107→108: PtC chaos-token route carries the bag forward (a no-token transition keeps the previous
 *  mix), so the `ptc` blob's tokenRoute + tokenScenarioMixes recompute. */
/*  108→109: PtC Dim Carcosa blob gained `strangerArrivalDoom` (plays per agenda-1a doom tier from the
 *  Chasing-the-Stranger tally at arrival), so the `ptc` blob recomputes. */
/*  109→110: PtC `ptc` blob reshaped — Curtain Call `didntReachAct2b` (was `strangerOnToYou`),
 *  `strangerByScenario` lists every scenario (0 defeats included), and Pallid Mask / Black Stars Rise
 *  `randomizedWeaknesses` are per-draw dated entries (newest first) — so the blob recomputes. */
/*  110→111: PtC Dim Carcosa `strangerArrivalDoom` reshaped to per-doom-tier `{ succeed, failed, tallies }`
 *  (Succeed / Failed / Resolutions per-version breakdown, doom tier as the axis), so the blob recomputes. */
/*  111→112: campaign-data fix — PtC Dim Carcosa R2 verdict corrected `neutral` → `win` (it records
 *  prevented_hasturs_escape + ends on a `win` step; "you take the stage" is still a campaign win). The
 *  resolution verdict feeds the doom table + Hastur version table Succeed/Failed, so the blob recomputes. */
/*  112→113: PtC A Phantom of Truth version values corrected to match the game's check_doubt_and_conviction
 *  branch — Doubt/tie lean → v.I (was mislabeled v.II), Conviction lean → v.II — so the `scenarios`
 *  version buckets flip and recompute. (The per-version resolution filtering itself is render-time.) */
/*  113→114: PtC possessed investigators move to the log (the repeatable `possessed` #name# picks) +
 *  reshape to a dated `{ code, finishDate }[]`; the record gained `possessedInvestigators`, so recompute. */
/*  114→115: PtC VIP tallies widened to `TierCount` (per-difficulty hover) + `lastKing.mostSlainInRun`
 *  added, so the `ptc` blob recomputes. */
/*  115→116: PtC blob trimmed/reshaped — Curtain Call didntReachAct2b + Pallid knowSiteOfGate removed,
 *  Oath insane list dated, BSR/Dim Carcosa carcosa_merged discriminated by resolution — so it recomputes. */
/*  116→117: TCU blob rebuilt to PtC parity (allegiance spine runs/sources, missing-persons Union
 *  survival, heretics distribution, Inner Circle + Union faction states, four-ending finale, Twist-of-
 *  Fate pathWinds table, derived Union Cosmos version) — so the `tcu` blob + `scenarios` recompute. */
/*  117→118: The Dream-Eaters `tdea`/`tdeb` blobs gained a precomputed Evidence/Steps `avg` — recompute. */
/*  118→119: The Forgotten Age `tfa` blob rebuilt (per-play runs, Poison/Venom, Harbinger trajectory,
 *  supplies-empty runs, Yithian aftermath, hidden-log facts re-sourced via Extra inputs) — recompute. */
/*  119→120: The Innsmouth Conspiracy `tic` blob widened to per-difficulty `ResolutionTally` on every
 *  field (+ suspect/hideout/equipment card codes) for the difficulty hovers — so the blob recomputes. */
/*  120→121: NotZ blob rebuilt (per-difficulty tallies everywhere, per-cultist manhunt + best-haul
 *  highscore, Lita recruited / Ghoul Priest slain-vs-survived, and the deck-derived Core-Set purist
 *  feat via `CampaignRecord.coreOnly`) — the subject cache must rebuild. */
/*  121→122: The Drowned City `tdc` blob rebuilt (per-scenario `scenarios` note tallies, artifacts
 *  `kept`, tasks `picked`/`obligations`/`assignments`, doom `flooded`) — the subject cache must rebuild. */
/*  122→123: The Feast of Hemlock Vale `fhv` blob rebuilt for the full widget suite (villager arc,
 *  dance / hemlockHouse / longestNight / finalEvening / bertie blobs, `scenarios` re-keyed by full
 *  `section.id`, + the Argument / Rachel-stance / captives-damage Extras) — the subject cache must rebuild. */
/*  123→124: TCU `union.survivors` (missing-persons alive/dead) summed at precompute instead of hot in
 *  the Union and Disillusion widget — the subject cache must rebuild. */
export const CACHE_VERSION = 124;

/** The cache key for the account-wide profile. */
export const ACCOUNT_SUBJECT = '__account__';

export interface MetaSegmentData {
	campaigns: ProfileCampaign[];
	calendar: CalendarEntry[];
}

export interface LogsSegmentData {
	achievements: ProfileAchievementsData;
	clearGrid: ClearGridRow[];
	/** Clear grid folding in only 1-player plays (true solo + solo X-handed). */
	soloClearGrid: ClearGridRow[];
	/** Clear grid folding in only true-solo (1-player, not multi-handed) plays. */
	trueSoloClearGrid: ClearGridRow[];
	winLossRecord: WinLossRecord[];
	endings: CampaignEndings[];
	collections: CampaignCollections[];
	scenarios: CampaignScenarios[];
	standaloneUsage: CampaignStandaloneUsage[];
	/** First-class Standalone Archive aggregates (the separate `doc.standalones` array). */
	standalones: StandaloneArchiveStat[];
	traumaTally: TraumaTally;
	eoe: CampaignEoe[];
	tsk: CampaignTsk[];
	dwl: CampaignDwl[];
	ptc: CampaignPtc[];
	tfa: CampaignTfa[];
	tcu: CampaignTcu[];
	tdea: CampaignTdea[];
	tdeb: CampaignTdeb[];
	tic: CampaignTic[];
	fhv: CampaignFhv[];
	tdc: CampaignTdc[];
	notz: CampaignNotz[];
	/** Roster-free special-interactions partials; roster joined at assembly. */
	specialInteractions: SpecialInteractionsPartial[];
}

export interface CardsSegmentData {
	cardUsage: Record<CardCode, number>;
	investigators: InvestigatorStat[];
	playedCardCodes: CardCode[];
	/** Per-campaign investigator codes (doc campaign id → codes), the join target
	 *  for per-investigator trauma attribution at assembly time. */
	investigatorsByCampaign: Record<string, CardCode[]>;
	/** Raw per-card deck context for cards present in exactly ONE deck (by raw code,
	 *  pre-canon-fold). Resolved at assembly (canon-folded + joined with campaigns for
	 *  difficulty/date/title) into the payload's `usedOnce`. */
	usedOnceRaw: Record<CardCode, { investigator: CardCode; campaignId: string }>;
	/** Specialist card code → the distinct investigator codes whose decks used it
	 *  (deck-derived; passed through at assembly for the Specialist widget). */
	specialistUsage: Record<CardCode, CardCode[]>;
	/** Per-deck tracked spotlight-card quantities (investigator + code→copies) for the
	 *  bespoke neutral-card insight widgets. Only decks using ≥1 tracked card. */
	insightDecks: InsightDeck[];
	/** "Eligible but unused" insights keyed by target id, computed over EVERY deck (the
	 *  denominator spans all decks, not just tracked ones). */
	eligibilityInsights: Record<string, EligibilityInsight>;
	/** Count of all the subject's decks (the "% of decks" denominator). */
	totalDecks: number;
	/** Per-deck best ally-with-Charisma version (ranked into the Top-3 allies table). */
	charismaTopDecks: DeckTopEntry[];
	/** Per-deck best accessory-with-Relic-Hunter version (ranked into the Top-3 table). */
	relicTopDecks: DeckTopEntry[];
	/** Per customizable card: level + option usage tallies (deck-derived, meta-parsed). */
	customizableUsage: CustomizableUsage;
}

/** A cached segment: its input signature + the built data. */
export interface CachedSegment<T> {
	sig: string;
	data: T;
}

/** One subject's three cached segments. */
export interface SubjectCache {
	meta: CachedSegment<MetaSegmentData>;
	logs: CachedSegment<LogsSegmentData>;
	cards: CachedSegment<CardsSegmentData>;
}

/** The whole precompute cache, keyed by subject (account sentinel / player uid /
 *  play-group uid). Lives on `DatabaseDocument.profileCache`. */
export interface ProfileCache {
	/** {@link CACHE_VERSION} at build time; mismatch ⇒ full rebuild. */
	version: number;
	subjects: Record<string, SubjectCache>;
}
