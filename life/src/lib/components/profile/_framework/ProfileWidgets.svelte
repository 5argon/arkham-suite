<!--
@component
The shared widget renderer for the hierarchical profile. Given an ordered list of
layout ROWS + the full profile payload, it renders each row: a `full` row spans
the width; a `split` row renders its two slots side by side on desktop — bleeding a
little wider than a full row so each half stays roomy — and stacks full-width below
that (see the layout note + `<style>` lower down). The per-widget body is a single `widgetBody`
snippet (one switch), reused by every slot. Per-campaign widgets are sliced to
`family` when provided (a campaign detail page); aggregate widgets ignore it.
-->
<script lang="ts">
	import { type CardItem, FlexibleCardDisplay, HelpParagraph } from '@5argon/arkham-life-ui';
	import { u as stringUtils } from '@5argon/arkham-string';
	import { card as cardUtils, Campaign, Product, type Card } from '@5argon/arkham-kohaku';
	import { getAllCards } from '$lib/card-data';
	import type { ProfileRow, WidgetSlot } from '$lib/campaign/profile/profile-settings';
	import {
		WIDGET_BY_ID,
		widgetLabel,
		widgetNoteDoc,
		isDeckCategoryWidget
	} from '$lib/campaign/profile/profile-widgets';
	import { mergeStandaloneUsage } from '$lib/campaign/outcomes/standalone-usage';
	import type { ProfileWidgetData } from '$lib/components/profile/_framework/profile-widget-data';

	import WidgetFrame from '$lib/components/profile/_primitives/WidgetFrame.svelte';
	import NonLogPlaceholder from '$lib/components/profile/_primitives/NonLogPlaceholder.svelte';
	import CampaignClearGrid from '$lib/components/profile/home/CampaignClearGrid.svelte';
	import SingleCampaignSummary from '$lib/components/profile/campaigns/campaign/SingleCampaignSummary.svelte';
	import ResolutionCoverage from '$lib/components/profile/campaigns/campaign/ResolutionCoverage.svelte';
	import WinLossRecordView from '$lib/components/profile/campaigns/WinLossRecordView.svelte';
	import CalendarTimeline from '$lib/components/profile/home/CalendarTimeline.svelte';
	import ProfileAchievements from '$lib/components/profile/campaigns/campaign/ProfileAchievements.svelte';
	import AllAchievements from '$lib/components/profile/campaigns/AllAchievements.svelte';
	import MostUsedInvestigatorsView from '$lib/components/profile/investigators/MostUsedInvestigatorsView.svelte';
	import InvestigatorInsightsView from '$lib/components/profile/investigators/InvestigatorInsightsView.svelte';
	import CardInsightsView from '$lib/components/profile/cards/CardInsightsView.svelte';
	import MostUsedNonCoreView from '$lib/components/profile/cards/MostUsedNonCoreView.svelte';
	import CardUtilizationView from '$lib/components/profile/cards/CardUtilizationView.svelte';
	import CoreSetUsedOnceView from '$lib/components/profile/cards/core/CoreSetUsedOnceView.svelte';
	import SpecialistCardsView from '$lib/components/profile/cards/class/SpecialistCardsView.svelte';
	import CoreNeutralL0View from '$lib/components/profile/cards/core/CoreNeutralL0View.svelte';
	import CharismaRelicView from '$lib/components/profile/cards/core/CharismaRelicView.svelte';
	import CustomizableCardsView from '$lib/components/profile/cards/keywords/CustomizableCardsView.svelte';
	import DesperateCardsView from '$lib/components/profile/cards/skill/DesperateCardsView.svelte';
	import InnateCardsView from '$lib/components/profile/cards/skill/InnateCardsView.svelte';
	import CoreNeutralSkillUpgradesView from '$lib/components/profile/cards/skill/CoreNeutralSkillUpgradesView.svelte';
	import ViciousBlowDeductionView from '$lib/components/profile/cards/skill/ViciousBlowDeductionView.svelte';
	import CoreSetNeutralSkillsView from '$lib/components/profile/cards/skill/CoreSetNeutralSkillsView.svelte';
	import SkillCardsView from '$lib/components/profile/cards/skill/SkillCardsView.svelte';
	import {
		isExceptional,
		isLevel5,
		isPermanent,
		isResearched
	} from '$lib/campaign/utils/card-filters';
	import ScenarioXpView from '$lib/components/profile/campaigns/campaign/ScenarioXpView.svelte';
	import SpecialInteractionsView from '$lib/components/profile/campaigns/campaign/SpecialInteractions.svelte';
	import StandaloneUsageView from '$lib/components/profile/home/StandaloneUsageView.svelte';
	import TraumaTallyView from '$lib/components/profile/campaigns/TraumaTallyView.svelte';
	import TskRiddlesAndRain from '$lib/components/profile/campaigns/campaign/tsk/TskRiddlesAndRain.svelte';
	import TskDeadHeat from '$lib/components/profile/campaigns/campaign/tsk/TskDeadHeat.svelte';
	import TskSanguineShadows from '$lib/components/profile/campaigns/campaign/tsk/TskSanguineShadows.svelte';
	import TskDealingsInTheDark from '$lib/components/profile/campaigns/campaign/tsk/TskDealingsInTheDark.svelte';
	import TskDancingMad from '$lib/components/profile/campaigns/campaign/tsk/TskDancingMad.svelte';
	import TskOnThinIce from '$lib/components/profile/campaigns/campaign/tsk/TskOnThinIce.svelte';
	import TskDogsOfWar from '$lib/components/profile/campaigns/campaign/tsk/TskDogsOfWar.svelte';
	import TskShadesOfSuffering from '$lib/components/profile/campaigns/campaign/tsk/TskShadesOfSuffering.svelte';
	import TskWithoutATrace from '$lib/components/profile/campaigns/campaign/tsk/TskWithoutATrace.svelte';
	import TskCongressOfTheKeys from '$lib/components/profile/campaigns/campaign/tsk/TskCongressOfTheKeys.svelte';
	import TskKeysWall from '$lib/components/profile/campaigns/campaign/tsk/TskKeysWall.svelte';
	import TskRoutings from '$lib/components/profile/campaigns/campaign/tsk/TskRoutings.svelte';
	import TskTrustDeception from '$lib/components/profile/campaigns/campaign/tsk/TskTrustDeception.svelte';
	import TskTokenBalance from '$lib/components/profile/campaigns/campaign/tsk/TskTokenBalance.svelte';
	import TskTheTrial from '$lib/components/profile/campaigns/campaign/tsk/TskTheTrial.svelte';
	import TskErasedFromExistence from '$lib/components/profile/campaigns/campaign/tsk/TskErasedFromExistence.svelte';
	import TskBaleEngine from '$lib/components/profile/campaigns/campaign/tsk/TskBaleEngine.svelte';
	import TskRuinousChime from '$lib/components/profile/campaigns/campaign/tsk/TskRuinousChime.svelte';
	import TskSideQuests from '$lib/components/profile/campaigns/campaign/tsk/TskSideQuests.svelte';
	import TdcGlyphWall from '$lib/components/profile/campaigns/campaign/tdc/TdcGlyphWall.svelte';
	import PtcDoubtConviction from '$lib/components/profile/campaigns/campaign/ptc/PtcDoubtConviction.svelte';
	import PtcVips from '$lib/components/profile/campaigns/campaign/ptc/PtcVips.svelte';
	import PtcStranger from '$lib/components/profile/campaigns/campaign/ptc/PtcStranger.svelte';
	import PtcChaosTokens from '$lib/components/profile/campaigns/campaign/ptc/PtcChaosTokens.svelte';
	import PtcCurtainCall from '$lib/components/profile/campaigns/campaign/ptc/PtcCurtainCall.svelte';
	import PtcLastKing from '$lib/components/profile/campaigns/campaign/ptc/PtcLastKing.svelte';
	import PtcEchoes from '$lib/components/profile/campaigns/campaign/ptc/PtcEchoes.svelte';
	import PtcUnspeakableOath from '$lib/components/profile/campaigns/campaign/ptc/PtcUnspeakableOath.svelte';
	import PtcLostSoul from '$lib/components/profile/campaigns/campaign/ptc/PtcLostSoul.svelte';
	import PtcPhantom from '$lib/components/profile/campaigns/campaign/ptc/PtcPhantom.svelte';
	import PtcPallidMask from '$lib/components/profile/campaigns/campaign/ptc/PtcPallidMask.svelte';
	import PtcBlackStarsRise from '$lib/components/profile/campaigns/campaign/ptc/PtcBlackStarsRise.svelte';
	import PtcDimCarcosa from '$lib/components/profile/campaigns/campaign/ptc/PtcDimCarcosa.svelte';
	import TcuAllegiance from '$lib/components/profile/campaigns/campaign/tcu/TcuAllegiance.svelte';
	import TcuMissingPersons from '$lib/components/profile/campaigns/campaign/tcu/TcuMissingPersons.svelte';
	import TcuMementos from '$lib/components/profile/campaigns/campaign/tcu/TcuMementos.svelte';
	import TcuWitchingHour from '$lib/components/profile/campaigns/campaign/tcu/TcuWitchingHour.svelte';
	import TcuAtDeathsDoorstep from '$lib/components/profile/campaigns/campaign/tcu/TcuAtDeathsDoorstep.svelte';
	import TcuSecretName from '$lib/components/profile/campaigns/campaign/tcu/TcuSecretName.svelte';
	import TcuWagesOfSin from '$lib/components/profile/campaigns/campaign/tcu/TcuWagesOfSin.svelte';
	import TcuForTheGreaterGood from '$lib/components/profile/campaigns/campaign/tcu/TcuForTheGreaterGood.svelte';
	import TcuUnionAndDisillusion from '$lib/components/profile/campaigns/campaign/tcu/TcuUnionAndDisillusion.svelte';
	import TcuClutchesOfChaos from '$lib/components/profile/campaigns/campaign/tcu/TcuClutchesOfChaos.svelte';
	import TcuEndings from '$lib/components/profile/campaigns/campaign/tcu/TcuEndings.svelte';
	import TdePlayMode from '$lib/components/profile/campaigns/campaign/tde/TdePlayMode.svelte';
	import TdeBlackCat from '$lib/components/profile/campaigns/campaign/tde/TdeBlackCat.svelte';
	import TdeSilverKey from '$lib/components/profile/campaigns/campaign/tde/TdeSilverKey.svelte';
	import TdeRandolph from '$lib/components/profile/campaigns/campaign/tde/TdeRandolph.svelte';
	import TdeEpilogueMatrix from '$lib/components/profile/campaigns/campaign/tde/TdeEpilogueMatrix.svelte';
	import TdeaEvidenceOfKadath from '$lib/components/profile/campaigns/campaign/tdea/TdeaEvidenceOfKadath.svelte';
	import TdeaBeyondTheGates from '$lib/components/profile/campaigns/campaign/tdea/TdeaBeyondTheGates.svelte';
	import TdeaSearchForKadath from '$lib/components/profile/campaigns/campaign/tdea/TdeaSearchForKadath.svelte';
	import TdeaDarkSideOfTheMoon from '$lib/components/profile/campaigns/campaign/tdea/TdeaDarkSideOfTheMoon.svelte';
	import TdeaWhereTheGodsDwell from '$lib/components/profile/campaigns/campaign/tdea/TdeaWhereTheGodsDwell.svelte';
	import TdebStepsOfTheBridge from '$lib/components/profile/campaigns/campaign/tdeb/TdebStepsOfTheBridge.svelte';
	import TdebWakingNightmare from '$lib/components/profile/campaigns/campaign/tdeb/TdebWakingNightmare.svelte';
	import TdebAThousandShapes from '$lib/components/profile/campaigns/campaign/tdeb/TdebAThousandShapes.svelte';
	import TdebPointOfNoReturn from '$lib/components/profile/campaigns/campaign/tdeb/TdebPointOfNoReturn.svelte';
	import TdebWeaverOfTheCosmos from '$lib/components/profile/campaigns/campaign/tdeb/TdebWeaverOfTheCosmos.svelte';
	import TicMemories from '$lib/components/profile/campaigns/campaign/tic/TicMemories.svelte';
	import TicSevenKeys from '$lib/components/profile/campaigns/campaign/tic/TicSevenKeys.svelte';
	import TicPit from '$lib/components/profile/campaigns/campaign/tic/TicPit.svelte';
	import TicHarper from '$lib/components/profile/campaigns/campaign/tic/TicHarper.svelte';
	import TicInTooDeep from '$lib/components/profile/campaigns/campaign/tic/TicInTooDeep.svelte';
	import TicDevilReef from '$lib/components/profile/campaigns/campaign/tic/TicDevilReef.svelte';
	import TicHorrorInHighGear from '$lib/components/profile/campaigns/campaign/tic/TicHorrorInHighGear.svelte';
	import TicLightInTheFog from '$lib/components/profile/campaigns/campaign/tic/TicLightInTheFog.svelte';
	import TicLairOfDagon from '$lib/components/profile/campaigns/campaign/tic/TicLairOfDagon.svelte';
	import TicIntoTheMaelstrom from '$lib/components/profile/campaigns/campaign/tic/TicIntoTheMaelstrom.svelte';
	import FhvVale from '$lib/components/profile/campaigns/campaign/fhv/FhvVale.svelte';
	import FhvSchedule from '$lib/components/profile/campaigns/campaign/fhv/FhvSchedule.svelte';
	import FhvVillager from '$lib/components/profile/campaigns/campaign/fhv/FhvVillager.svelte';
	import FhvFate from '$lib/components/profile/campaigns/campaign/fhv/FhvFate.svelte';
	import FhvCurse from '$lib/components/profile/campaigns/campaign/fhv/FhvCurse.svelte';
	import FhvDance from '$lib/components/profile/campaigns/campaign/fhv/FhvDance.svelte';
	import FhvFinalEvening from '$lib/components/profile/campaigns/campaign/fhv/FhvFinalEvening.svelte';
	import FhvWrittenInRock from '$lib/components/profile/campaigns/campaign/fhv/FhvWrittenInRock.svelte';
	import FhvHemlockHouse from '$lib/components/profile/campaigns/campaign/fhv/FhvHemlockHouse.svelte';
	import FhvSilentHeath from '$lib/components/profile/campaigns/campaign/fhv/FhvSilentHeath.svelte';
	import FhvLostSister from '$lib/components/profile/campaigns/campaign/fhv/FhvLostSister.svelte';
	import FhvThingDepths from '$lib/components/profile/campaigns/campaign/fhv/FhvThingDepths.svelte';
	import FhvTwistedHollow from '$lib/components/profile/campaigns/campaign/fhv/FhvTwistedHollow.svelte';
	import FhvLongestNight from '$lib/components/profile/campaigns/campaign/fhv/FhvLongestNight.svelte';
	import TdcFold from '$lib/components/profile/campaigns/campaign/tdc/TdcFold.svelte';
	import TdcArtifacts from '$lib/components/profile/campaigns/campaign/tdc/TdcArtifacts.svelte';
	import TdcTasks from '$lib/components/profile/campaigns/campaign/tdc/TdcTasks.svelte';
	import TdcSepulchre from '$lib/components/profile/campaigns/campaign/tdc/TdcSepulchre.svelte';
	import TdcScenario from '$lib/components/profile/campaigns/campaign/tdc/TdcScenario.svelte';
	import NotzThreatsBelow from '$lib/components/profile/campaigns/campaign/notz/NotzThreatsBelow.svelte';
	import NotzGathering from '$lib/components/profile/campaigns/campaign/notz/NotzGathering.svelte';
	import NotzMidnightMasks from '$lib/components/profile/campaigns/campaign/notz/NotzMidnightMasks.svelte';
	import NotzDevourerBelow from '$lib/components/profile/campaigns/campaign/notz/NotzDevourerBelow.svelte';
	import NotzCoreOnly from '$lib/components/profile/campaigns/campaign/notz/NotzCoreOnly.svelte';
	import TdcDoom from '$lib/components/profile/campaigns/campaign/tdc/TdcDoom.svelte';
	import TfaVengeance from '$lib/components/profile/campaigns/campaign/tfa/TfaVengeance.svelte';
	import TfaSupplies from '$lib/components/profile/campaigns/campaign/tfa/TfaSupplies.svelte';
	import TfaCompanions from '$lib/components/profile/campaigns/campaign/tfa/TfaCompanions.svelte';
	import TfaHarbinger from '$lib/components/profile/campaigns/campaign/tfa/TfaHarbinger.svelte';
	import TfaPoison from '$lib/components/profile/campaigns/campaign/tfa/TfaPoison.svelte';
	import TfaUntamedWilds from '$lib/components/profile/campaigns/campaign/tfa/TfaUntamedWilds.svelte';
	import TfaDoomOfEztli from '$lib/components/profile/campaigns/campaign/tfa/TfaDoomOfEztli.svelte';
	import TfaThreadsOfFate from '$lib/components/profile/campaigns/campaign/tfa/TfaThreadsOfFate.svelte';
	import TfaBoundaryBeyond from '$lib/components/profile/campaigns/campaign/tfa/TfaBoundaryBeyond.svelte';
	import TfaHeartOfElders from '$lib/components/profile/campaigns/campaign/tfa/TfaHeartOfElders.svelte';
	import TfaCityOfArchives from '$lib/components/profile/campaigns/campaign/tfa/TfaCityOfArchives.svelte';
	import TfaDepthsOfYoth from '$lib/components/profile/campaigns/campaign/tfa/TfaDepthsOfYoth.svelte';
	import TfaShatteredAeons from '$lib/components/profile/campaigns/campaign/tfa/TfaShatteredAeons.svelte';
	import TfaTurnBackTime from '$lib/components/profile/campaigns/campaign/tfa/TfaTurnBackTime.svelte';
	import EoeCityMatrix from '$lib/components/profile/campaigns/campaign/eote/EoeCityMatrix.svelte';
	import EoeMemberRoster from '$lib/components/profile/campaigns/campaign/eote/EoeMemberRoster.svelte';
	import EoeItemTally from '$lib/components/profile/campaigns/campaign/eote/EoeItemTally.svelte';
	import EoeMementos from '$lib/components/profile/campaigns/campaign/eote/EoeMementos.svelte';
	import EoeMemoryWall from '$lib/components/profile/campaigns/campaign/eote/EoeMemoryWall.svelte';
	import EoeFrostTokens from '$lib/components/profile/campaigns/campaign/eote/EoeFrostTokens.svelte';
	import EoeMiasma from '$lib/components/profile/campaigns/campaign/eote/EoeMiasma.svelte';
	import EoeFatalMirage from '$lib/components/profile/campaigns/campaign/eote/EoeFatalMirage.svelte';
	import EoeIceAndDeath from '$lib/components/profile/campaigns/campaign/eote/EoeIceAndDeath.svelte';
	import DwlOpening from '$lib/components/profile/campaigns/campaign/dwl/DwlOpening.svelte';
	import DwlMissingPersons from '$lib/components/profile/campaigns/campaign/dwl/DwlMissingPersons.svelte';
	import DwlMiskatonicMuseum from '$lib/components/profile/campaigns/campaign/dwl/DwlMiskatonicMuseum.svelte';
	import DwlEssex from '$lib/components/profile/campaigns/campaign/dwl/DwlEssex.svelte';
	import DwlSilas from '$lib/components/profile/campaigns/campaign/dwl/DwlSilas.svelte';
	import DwlSacrifices from '$lib/components/profile/campaigns/campaign/dwl/DwlSacrifices.svelte';
	import DwlUndimensioned from '$lib/components/profile/campaigns/campaign/dwl/DwlUndimensioned.svelte';
	import DwlAscendingHill from '$lib/components/profile/campaigns/campaign/dwl/DwlAscendingHill.svelte';
	import DwlFinale from '$lib/components/profile/campaigns/campaign/dwl/DwlFinale.svelte';
	import DwlEpilogue from '$lib/components/profile/campaigns/campaign/dwl/DwlEpilogue.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let {
		rows,
		data,
		family = null,
		classFilter = null
	}: {
		rows: ProfileRow[];
		data: ProfileWidgetData;
		/** When set (campaign detail page), per-campaign widgets are sliced to it. */
		family?: string | null;
		/** When set (class detail page), card/investigator widgets narrow to it. */
		classFilter?: string | null;
	} = $props();

	// Per-campaign slicing helpers (aggregate pages pass family=null → identity).
	const slice = <T extends { family: string }>(arr: T[]): T[] =>
		family ? arr.filter((x) => x.family === family) : arr;

	// Per-class "Most Used" variant widgets encode their class in the id suffix
	// (e.g. `favoriteCard_guardian`); the base id has none → falls back to the route.
	const variantClass = (id: string): string | null => {
		const i = id.indexOf('_');
		return i === -1 ? null : id.slice(i + 1);
	};
	// Per-widget configurable item count (5 / 10 / 15), else the widget's default.
	const cfgCount = (widget: WidgetSlot, fallback: number): number =>
		typeof widget.config?.count === 'number' ? widget.config.count : fallback;

	// ── "Log-only mode" + "campaign categories only" (accessibility / log-only players) ──
	// This campaign's per-campaign Log-only override (campaign detail page only).
	const campaignLogOnlyActive = $derived(family ? (data.campaignLogOnly[family] ?? false) : false);
	// A widget instance is "log-only" when the global switch, this campaign's switch, or the
	// widget's own "ignore non-log data" config is on. Drives the placeholder (a `full` widget)
	// or the `logOnly` prop (a `partial` widget gates its non-log sections).
	const slotLogOnly = (widget: WidgetSlot): boolean =>
		data.logOnly || campaignLogOnlyActive || widget.config?.ignoreNonLog === true;
	// "Show only campaign categories": drop deck-derived (Cards/Investigators) widgets wherever
	// they sit — e.g. `favoriteCard` placed on the home pane — collapsing rows that empty out.
	const visibleRows = $derived.by((): ProfileRow[] => {
		if (!data.campaignCategoriesOnly) return rows;
		const keep = (slot: WidgetSlot | null): WidgetSlot | null =>
			slot && !isDeckCategoryWidget(slot.id) ? slot : null;
		const out: ProfileRow[] = [];
		for (const row of rows) {
			if (row.kind === 'full') {
				const slot = keep(row.slot);
				if (slot) out.push({ kind: 'full', slot });
			} else {
				const left = keep(row.left);
				const right = keep(row.right);
				if (left || right) out.push({ kind: 'split', left, right });
			}
		}
		return out;
	});

	const endings = $derived(slice(data.endings));
	const winLossRecord = $derived(slice(data.winLossRecord));
	const collections = $derived(slice(data.collections));
	const scenariosList = $derived(slice(data.scenarios));
	const clearGrid = $derived(slice(data.clearGrid));
	const soloClearGrid = $derived(slice(data.soloClearGrid));
	const trueSoloClearGrid = $derived(slice(data.trueSoloClearGrid));
	const calendar = $derived(
		family ? data.calendar.filter((c) => c.family === family) : data.calendar
	);
	const achievementFamilies = $derived(
		family
			? data.achievements.families.filter((f) => f.family === family)
			: data.achievements.families
	);
	// The family's achievements (with earned state) handed to each TSK per-scenario passport,
	// which filters them to the ones tagged with its scenario. Only meaningful on a campaign
	// detail page (family set → one family).
	const tskScenarioAch = $derived(achievementFamilies[0]?.achievements ?? []);
	const familyRecord = $derived(
		family ? (data.winLossRecord.find((r) => r.family === family) ?? null) : null
	);
	const familyClear = $derived(
		family ? (data.clearGrid.find((r) => r.family === family) ?? null) : null
	);
	const familyEndings = $derived(
		family ? (data.endings.find((e) => e.family === family) ?? null) : null
	);
	const familyEoe = $derived(family ? (data.eoe.find((c) => c.family === family) ?? null) : null);
	const familyTsk = $derived(family ? (data.tsk.find((t) => t.family === family) ?? null) : null);
	const familyDwl = $derived(family ? (data.dwl.find((d) => d.family === family) ?? null) : null);
	const familyPtc = $derived(family ? (data.ptc.find((p) => p.family === family) ?? null) : null);
	const familyTfa = $derived(family ? (data.tfa.find((t) => t.family === family) ?? null) : null);
	const familyTcu = $derived(family ? (data.tcu.find((t) => t.family === family) ?? null) : null);
	const familyTdea = $derived(family ? (data.tdea.find((t) => t.family === family) ?? null) : null);
	const familyTdeb = $derived(family ? (data.tdeb.find((t) => t.family === family) ?? null) : null);
	const familyTic = $derived(family ? (data.tic.find((t) => t.family === family) ?? null) : null);
	const familyFhv = $derived(family ? (data.fhv.find((t) => t.family === family) ?? null) : null);
	const familyTdc = $derived(family ? (data.tdc.find((t) => t.family === family) ?? null) : null);
	const familyNotz = $derived(family ? (data.notz.find((t) => t.family === family) ?? null) : null);
	// The family's unified per-scenario records (the consolidated `scenarios` structure) handed to
	// each per-scenario passport, which slices it to its own scenario.
	const familyScenarios = $derived(
		family ? (data.scenarios.find((s) => s.family === family) ?? null) : null
	);
	const familySpecial = $derived(
		family ? ((data.specialInteractions ?? []).find((s) => s.family === family) ?? null) : null
	);
	// Standalone usage: this family's tally on a campaign page; a merged global tally
	// (across every family) on the aggregate profile home.
	const standaloneRows = $derived(
		family
			? (data.standaloneUsage.find((u) => u.family === family)?.standalones ?? [])
			: mergeStandaloneUsage(data.standaloneUsage)
	);

	const difficultyLabel: Record<string, string> = {
		easy: m.shared_difficulty({ tier: 'easy' }),
		standard: m.shared_difficulty({ tier: 'standard' }),
		hard: m.shared_difficulty({ tier: 'hard' }),
		expert: m.shared_difficulty({ tier: 'expert' })
	};
	function safeCampaignName(code: string): string {
		return (Object.values(Campaign) as string[]).includes(code)
			? stringUtils.campaignName(code as Campaign)
			: code;
	}

	// Core-set card history: which leveled player cards from a given core product
	// you've ever put in a deck, with each card's lifetime use count. Old Core Set
	// plays fold into their Revised Core Set twins (kohaku coreToRcore), so the
	// Revised Core Set is treated as a true superset of the original Core Set.
	const allCards = getAllCards();
	const canonUsage = $derived.by((): Record<string, number> => {
		const m: Record<string, number> = {};
		for (const [code, n] of Object.entries(data.cardUsage)) {
			const key = cardUtils.coreToRcore(code);
			m[key] = (m[key] ?? 0) + n;
		}
		return m;
	});
	function coreSetItems(product: Product): CardItem[] {
		return allCards
			.filter((c) => c.product === product && cardUtils.deckbuildingPlayerCardsFilter(c))
			.map((card) => {
				const count = canonUsage[card.code] ?? 0;
				return {
					card,
					quantity: card.quantity,
					id: card.code,
					greyedOutQuantity: count > 0 ? 0 : card.quantity,
					iconCount: count
				};
			});
	}
	const rcoreItems = $derived(coreSetItems(Product.RevisedCoreSet));
	const core2026Items = $derived(coreSetItems(Product.CoreSet2026));
	const playedCount = (items: CardItem[]): number =>
		items.filter((i) => (i.iconCount ?? 0) > 0).length;

	// The card header (tab) is owned by the frame for EVERY widget — each widget's
	// title (incl. its dynamic count) is resolved here, so the widget components
	// render body-only. Returns null only for an unknown id (frame shows no tab).
	const classLabel: Record<string, string> = {
		guardian: m.shared_class({ class: 'guardian' }),
		seeker: m.shared_class({ class: 'seeker' }),
		rogue: m.shared_class({ class: 'rogue' }),
		mystic: m.shared_class({ class: 'mystic' }),
		survivor: m.shared_class({ class: 'survivor' }),
		neutral: m.shared_class({ class: 'neutral' })
	};
	// Base + per-class label getters for the property-filter card widgets.
	const cardFilterLabel: Record<string, { base: () => string; cls: (a: { cls: string }) => string }> =
		{
			permanentCards: {
				base: m.framework_label_permanent_cards,
				cls: m.framework_label_permanent_cards_class
			},
			exceptionalCards: {
				base: m.framework_label_exceptional_cards,
				cls: m.framework_label_exceptional_cards_class
			},
			level5Cards: { base: m.framework_label_level5_cards, cls: m.framework_label_level5_cards_class },
			skillCards: { base: m.framework_label_skill_cards, cls: m.framework_label_skill_cards_class },
			researchedCards: {
				base: m.framework_label_researched_cards,
				cls: m.framework_label_researched_cards_class
			},
			customizableCards: {
				base: m.framework_label_customizable_cards,
				cls: m.framework_label_customizable_cards_class
			}
		};
	function widgetTitle(id: string): string | null {
		if (id === 'favoriteCard' || id.startsWith('favoriteCard_')) {
			const cls = variantClass(id) ?? classFilter;
			return cls
				? m.framework_label_favorite_card_class({ cls: classLabel[cls] ?? cls })
				: m.framework_label_favorite_card();
		}
		if (id === 'deckStats' || id.startsWith('deckStats_')) {
			const cls = variantClass(id) ?? classFilter;
			return cls
				? m.framework_label_deck_stats_class({ cls: classLabel[cls] ?? cls })
				: m.framework_label_deck_stats();
		}
		// Property-filter card widgets: interpolate the class on a class-detail page.
		if (cardFilterLabel[id]) {
			const f = cardFilterLabel[id];
			return classFilter ? f.cls({ cls: classLabel[classFilter] ?? classFilter }) : f.base();
		}
		// Dynamic, count-bearing titles; every other widget uses its catalogue label
		// (localized by widgetLabel — TSK per-scenario widgets keep their scenario name).
		switch (id) {
			case 'clearGrid': {
				const tiers = data.trackedTiers.length ? data.trackedTiers : ['standard', 'hard'];
				const rows = clearGrid.filter((r) => r.owned);
				const cleared = rows.filter((r) => tiers.some((t) => r.byTier[t] === 'cleared')).length;
				return m.framework_title_clear_grid({ cleared, total: rows.length });
			}
			case 'soloClearGrid': {
				const tiers = data.trackedTiers.length ? data.trackedTiers : ['standard', 'hard'];
				const rows = soloClearGrid.filter((r) => r.owned);
				const cleared = rows.filter((r) => tiers.some((t) => r.byTier[t] === 'cleared')).length;
				return m.framework_title_solo_clear_grid({ cleared, total: rows.length });
			}
			case 'trueSoloClearGrid': {
				const tiers = data.trackedTiers.length ? data.trackedTiers : ['standard', 'hard'];
				const rows = trueSoloClearGrid.filter((r) => r.owned);
				const cleared = rows.filter((r) => tiers.some((t) => r.byTier[t] === 'cleared')).length;
				return m.framework_title_true_solo_clear_grid({ cleared, total: rows.length });
			}
			case 'winLossRecord': {
				// Lifetime totals are precomputed on the summary block (see compiled-profile.ts).
				return m.framework_title_win_loss({
					wins: data.summary.totalWins,
					plays: data.summary.totalPlays,
				});
			}
			case 'achievements': {
				const earned = achievementFamilies.reduce((n, f) => n + f.earned, 0);
				const total = achievementFamilies.reduce((n, f) => n + f.total, 0);
				return m.framework_title_achievements({ earned, total });
			}
			case 'allAchievements': {
				// Whole-record earned/total is precomputed on the summary block.
				return m.framework_title_all_achievements({
					earned: data.summary.achievementsEarned,
					total: data.summary.achievementsTotal,
				});
			}
			case 'tdcGlyphWall': {
				const g = collections
					.flatMap((c) => c.collections)
					.find((col) => col.sectionId === 'glyphs' || /glyph/i.test(col.title));
				return g
					? m.framework_title_tdc_glyph_wall_count({
							collected: g.collectedCount,
							total: g.items.length
						})
					: widgetLabel('tdcGlyphWall');
			}
			default:
				return WIDGET_BY_ID[id] ? widgetLabel(id) : null;
		}
	}
</script>

{#snippet widgetBody(widget: WidgetSlot)}
	{@const lo = slotLogOnly(widget)}
	<WidgetFrame
		title={widgetTitle(widget.id)}
		image={WIDGET_BY_ID[widget.id]?.image ?? null}
		noteDoc={widgetNoteDoc(widget.id)}
		scenario={WIDGET_BY_ID[widget.id]?.scenario ?? null}
	>
		{#if WIDGET_BY_ID[widget.id]?.nonLog === 'full' && lo}
			<NonLogPlaceholder />
		{:else if widget.id === 'overview'}
			{#if family}
				<SingleCampaignSummary
					record={familyRecord}
					clear={familyClear}
					endings={familyEndings}
					trackedTiers={data.trackedTiers}
					logOnly={lo}
				/>
			{/if}
		{:else if widget.id === 'resolutionCoverage'}
			{#if familyScenarios}
				<ResolutionCoverage scenarios={familyScenarios} />
			{/if}
		{:else if widget.id === 'campaignsPlayed'}
			{@const recentCampaigns = [...data.campaigns]
				.sort((a, b) => (b.finishDate ?? 0) - (a.finishDate ?? 0))
				.slice(0, 5)}
			{#if recentCampaigns.length === 0}
				<HelpParagraph>{m.profile_campaigns_played_empty()}</HelpParagraph>
			{:else}
				<div
					class="border-primary-200 dark:border-primary-700 divide-primary-200 dark:divide-primary-700 divide-y rounded border"
				>
					{#each recentCampaigns as campaign (campaign.id)}
						<div class="flex items-center justify-between gap-4 px-4 py-3">
							<div class="min-w-0">
								<p class="text-primary-900 dark:text-primary-100 truncate font-medium">
									{campaign.title}
								</p>
								<p class="text-primary-500 dark:text-primary-400 truncate text-xs">
									{safeCampaignName(campaign.campaignCode)}
									{#if campaign.draft}
										<span
											class="bg-primary-200 dark:bg-primary-700 text-primary-700 dark:text-primary-200 ml-1 rounded px-1 py-0.5 text-xs"
										>
											{m.profile_campaigns_played_draft_badge()}
										</span>
									{/if}
								</p>
							</div>
							<div class="flex shrink-0 items-center gap-1.5">
								{#if campaign.playerCount}
									<span
										title="{campaign.playerCount}-player campaign"
										class="bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-primary-300 rounded px-2 py-1 text-xs font-semibold"
									>
										{campaign.playerCount}P
									</span>
								{/if}
								<span
									class="bg-primary-100 dark:bg-primary-800 text-primary-800 dark:text-primary-200 rounded px-2 py-1 text-xs font-semibold capitalize"
								>
									{difficultyLabel[campaign.difficulty] ?? campaign.difficulty}
								</span>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		{:else if widget.id === 'clearGrid'}
			<CampaignClearGrid grid={clearGrid} trackedTiers={data.trackedTiers} {endings} />
		{:else if widget.id === 'soloClearGrid'}
			<CampaignClearGrid grid={soloClearGrid} trackedTiers={data.trackedTiers} {endings} />
		{:else if widget.id === 'trueSoloClearGrid'}
			<CampaignClearGrid grid={trueSoloClearGrid} trackedTiers={data.trackedTiers} {endings} />
		{:else if widget.id === 'calendar'}
			<CalendarTimeline {calendar} />
		{:else if widget.id === 'winLossRecord'}
			<WinLossRecordView records={winLossRecord} showFamilyName={!family} />
		{:else if widget.id === 'achievements'}
			<ProfileAchievements families={achievementFamilies} showFamilyName={!family} />
		{:else if widget.id === 'allAchievements'}
			<AllAchievements families={data.achievements.families} />
		{:else if widget.id === 'scenarioXp'}
			<ScenarioXpView scenarios={scenariosList} showFamilyName={!family} />
		{:else if widget.id === 'specialInteractions'}
			<SpecialInteractionsView special={familySpecial} />
		{:else if widget.id === 'standaloneUsage'}
			<StandaloneUsageView rows={standaloneRows} {family} />
		{:else if widget.id === 'traumaTally'}
			<TraumaTallyView tally={data.traumaTally} {family} />
		{:else if widget.id === 'cardInsights'}
			<CardInsightsView
				cardUsage={data.cardUsage}
				ownedProducts={data.ownedProducts}
				{classFilter}
			/>
		{:else if widget.id === 'favoriteCard' || widget.id.startsWith('favoriteCard_')}
			<MostUsedNonCoreView
				cardUsage={data.cardUsage}
				ownedProducts={data.ownedProducts}
				classFilter={variantClass(widget.id) ?? classFilter}
				count={cfgCount(widget, 10)}
			/>
		{:else if widget.id === 'cardHistory'}
			<p class="text-primary-600 dark:text-primary-400 mb-3 text-sm">
				Core Set Utilization : {Math.round((playedCount(rcoreItems) / rcoreItems.length) * 100)}% ({playedCount(
					rcoreItems
				)}/{rcoreItems.length})
			</p>
			<FlexibleCardDisplay
				cards={rcoreItems}
				defaultSettings={{ grouping: ['class'], sortingOrder: ['level'] }}
				defaultViewMode="icons"
				hideChecklistMode
				hideViewMode
				hideGroupingSorting
				showIconCount
			/>
		{:else if widget.id === 'cardHistory2026'}
			<p class="text-primary-600 dark:text-primary-400 mb-3 text-sm">
				Core Set (2026) Utilization : {Math.round(
					(playedCount(core2026Items) / core2026Items.length) * 100
				)}% ({playedCount(core2026Items)}/{core2026Items.length})
			</p>
			<FlexibleCardDisplay
				cards={core2026Items}
				defaultSettings={{ grouping: ['class'], sortingOrder: ['level'] }}
				defaultViewMode="icons"
				hideChecklistMode
				hideViewMode
				hideGroupingSorting
				showIconCount
			/>
		{:else if widget.id === 'cardHistoryOnce'}
			<CoreSetUsedOnceView product={Product.RevisedCoreSet} usedOnce={data.usedOnce} />
		{:else if widget.id === 'cardHistoryOnce2026'}
			<CoreSetUsedOnceView product={Product.CoreSet2026} usedOnce={data.usedOnce} />
		{:else if widget.id === 'permanentCards'}
			<CardUtilizationView
				predicate={isPermanent}
				cardUsage={data.cardUsage}
				ownedProducts={data.ownedProducts}
				{classFilter}
			/>
		{:else if widget.id === 'exceptionalCards'}
			<CardUtilizationView
				predicate={isExceptional}
				cardUsage={data.cardUsage}
				ownedProducts={data.ownedProducts}
				{classFilter}
			/>
		{:else if widget.id === 'level5Cards'}
			<CardUtilizationView
				predicate={isLevel5}
				cardUsage={data.cardUsage}
				ownedProducts={data.ownedProducts}
				{classFilter}
			/>
		{:else if widget.id === 'skillCards'}
			<SkillCardsView
				cardUsage={data.cardUsage}
				ownedProducts={data.ownedProducts}
				{classFilter}
			/>
		{:else if widget.id === 'researchedCards'}
			<CardUtilizationView
				predicate={isResearched}
				cardUsage={data.cardUsage}
				ownedProducts={data.ownedProducts}
				{classFilter}
			/>
		{:else if widget.id === 'customizableCards'}
			<CustomizableCardsView customizableUsage={data.customizableUsage} {classFilter} />
		{:else if widget.id === 'specialistCards'}
			<SpecialistCardsView specialistUsage={data.specialistUsage} />
		{:else if widget.id === 'coreNeutralL0'}
			<CoreNeutralL0View
				cardUsage={data.cardUsage}
				insightDecks={data.insightDecks}
				totalDecks={data.totalDecks}
			/>
		{:else if widget.id === 'charismaRelic'}
			<CharismaRelicView
				cardUsage={data.cardUsage}
				insightDecks={data.insightDecks}
				totalDecks={data.totalDecks}
				charismaTopDecks={data.charismaTopDecks}
				relicTopDecks={data.relicTopDecks}
			/>
		{:else if widget.id === 'desperateCards'}
			<DesperateCardsView
				cardUsage={data.cardUsage}
				insightDecks={data.insightDecks}
				totalDecks={data.totalDecks}
			/>
		{:else if widget.id === 'innateCards'}
			<InnateCardsView
				cardUsage={data.cardUsage}
				insightDecks={data.insightDecks}
				totalDecks={data.totalDecks}
			/>
		{:else if widget.id === 'coreNeutralSkillUpgrades'}
			<CoreNeutralSkillUpgradesView
				cardUsage={data.cardUsage}
				insightDecks={data.insightDecks}
				totalDecks={data.totalDecks}
			/>
		{:else if widget.id === 'viciousBlowDeduction'}
			<ViciousBlowDeductionView
				cardUsage={data.cardUsage}
				insightDecks={data.insightDecks}
				eligibilityInsights={data.eligibilityInsights}
			/>
		{:else if widget.id === 'coreSetNeutralSkills'}
			<CoreSetNeutralSkillsView
				cardUsage={data.cardUsage}
				insightDecks={data.insightDecks}
				totalDecks={data.totalDecks}
			/>
		{:else if widget.id === 'deckStats' || widget.id.startsWith('deckStats_')}
			<MostUsedInvestigatorsView
				investigators={data.investigators}
				classFilter={variantClass(widget.id) ?? classFilter}
				count={cfgCount(widget, 5)}
			/>
		{:else if widget.id === 'investigatorInsights'}
			<InvestigatorInsightsView
				investigators={data.investigators}
				ownedProducts={data.ownedProducts}
				{classFilter}
				config={widget.config}
			/>
		{:else if widget.id === 'tskKeysObtained'}
			<TskKeysWall
				mode="obtained"
				{collections}
				tsk={familyTsk}
				hideWellspring={widget.config?.hideWellspring === true}
			/>
		{:else if widget.id === 'tskKeysBearer'}
			<TskKeysWall
				mode="bearer"
				{collections}
				tsk={familyTsk}
				hideWellspring={widget.config?.hideWellspring === true}
			/>
		{:else if widget.id === 'tskRoutes'}
			<TskRoutings
				tsk={familyTsk}
				{family}
				hideAchievements={widget.config?.hideAchievements === true}
			/>
		{:else if widget.id === 'tskTrustDeception'}
			<TskTrustDeception tsk={familyTsk} />
		{:else if widget.id === 'tskTokenBalance'}
			<TskTokenBalance tsk={familyTsk} />
		{:else if widget.id === 'tskTrial'}
			<TskTheTrial tsk={familyTsk} logOnly={lo} />
		{:else if widget.id === 'tskErased'}
			<TskErasedFromExistence tsk={familyTsk} />
		{:else if widget.id === 'tskBaleEngine'}
			<TskBaleEngine tsk={familyTsk} />
		{:else if widget.id === 'tskRuinousChime'}
			<TskRuinousChime tsk={familyTsk} />
		{:else if widget.id === 'tskSideQuests'}
			<TskSideQuests tsk={familyTsk} />
		{:else if widget.id === 'tskScenario_riddles_and_rain'}
			<TskRiddlesAndRain
				logOnly={lo}
				{family}
				scenarios={familyScenarios}
				tsk={familyTsk}
				achievements={tskScenarioAch}
				hideVariants={widget.config?.hideVariants === true}
				hideAchievements={widget.config?.hideAchievements === true}
			/>
		{:else if widget.id === 'tskScenario_dead_heat'}
			<TskDeadHeat
				logOnly={lo}
				{family}
				scenarios={familyScenarios}
				tsk={familyTsk}
				achievements={tskScenarioAch}
				hideVariants={widget.config?.hideVariants === true}
				hideAchievements={widget.config?.hideAchievements === true}
			/>
		{:else if widget.id === 'tskScenario_sanguine_shadows'}
			<TskSanguineShadows
				logOnly={lo}
				{family}
				scenarios={familyScenarios}
				tsk={familyTsk}
				achievements={tskScenarioAch}
				hideVariants={widget.config?.hideVariants === true}
				hideAchievements={widget.config?.hideAchievements === true}
			/>
		{:else if widget.id === 'tskScenario_dealings_in_the_dark'}
			<TskDealingsInTheDark
				logOnly={lo}
				{family}
				scenarios={familyScenarios}
				tsk={familyTsk}
				achievements={tskScenarioAch}
				hideVariants={widget.config?.hideVariants === true}
				hideAchievements={widget.config?.hideAchievements === true}
			/>
		{:else if widget.id === 'tskScenario_dancing_mad'}
			<TskDancingMad
				logOnly={lo}
				{family}
				scenarios={familyScenarios}
				tsk={familyTsk}
				achievements={tskScenarioAch}
				hideVariants={widget.config?.hideVariants === true}
				hideAchievements={widget.config?.hideAchievements === true}
			/>
		{:else if widget.id === 'tskScenario_on_thin_ice'}
			<TskOnThinIce
				logOnly={lo}
				{family}
				scenarios={familyScenarios}
				tsk={familyTsk}
				achievements={tskScenarioAch}
				hideVariants={widget.config?.hideVariants === true}
				hideAchievements={widget.config?.hideAchievements === true}
			/>
		{:else if widget.id === 'tskScenario_dogs_of_war'}
			<TskDogsOfWar
				logOnly={lo}
				{family}
				scenarios={familyScenarios}
				tsk={familyTsk}
				achievements={tskScenarioAch}
				hideVariants={widget.config?.hideVariants === true}
				hideAchievements={widget.config?.hideAchievements === true}
			/>
		{:else if widget.id === 'tskScenario_shades_of_suffering'}
			<TskShadesOfSuffering
				logOnly={lo}
				{family}
				scenarios={familyScenarios}
				tsk={familyTsk}
				achievements={tskScenarioAch}
				hideVariants={widget.config?.hideVariants === true}
				hideAchievements={widget.config?.hideAchievements === true}
			/>
		{:else if widget.id === 'tskScenario_without_a_trace'}
			<TskWithoutATrace
				logOnly={lo}
				{family}
				scenarios={familyScenarios}
				tsk={familyTsk}
				achievements={tskScenarioAch}
				hideVariants={widget.config?.hideVariants === true}
				hideAchievements={widget.config?.hideAchievements === true}
			/>
		{:else if widget.id === 'tskScenario_congress_of_the_keys'}
			<TskCongressOfTheKeys
				logOnly={lo}
				{family}
				scenarios={familyScenarios}
				tsk={familyTsk}
				achievements={tskScenarioAch}
				hideVariants={widget.config?.hideVariants === true}
				hideAchievements={widget.config?.hideAchievements === true}
			/>
		{:else if widget.id === 'tdcGlyphWall'}
			<TdcGlyphWall tdc={familyTdc} />
		{:else if widget.id === 'ptcDoubtConviction'}
			<PtcDoubtConviction ptc={familyPtc} />
		{:else if widget.id === 'ptcVips'}
			<PtcVips ptc={familyPtc} />
		{:else if widget.id === 'ptcStranger'}
			<PtcStranger ptc={familyPtc} />
		{:else if widget.id === 'ptcChaosTokens'}
			<PtcChaosTokens ptc={familyPtc} />
		{:else if widget.id === 'ptcCurtainCall'}
			<PtcCurtainCall ptc={familyPtc} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'ptcLastKing'}
			<PtcLastKing ptc={familyPtc} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'ptcEchoes'}
			<PtcEchoes ptc={familyPtc} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'ptcUnspeakableOath'}
			<PtcUnspeakableOath ptc={familyPtc} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'ptcLostSoul'}
			<PtcLostSoul ptc={familyPtc} logOnly={lo} />
		{:else if widget.id === 'ptcPhantom'}
			<PtcPhantom ptc={familyPtc} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'ptcPallidMask'}
			<PtcPallidMask ptc={familyPtc} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'ptcBlackStarsRise'}
			<PtcBlackStarsRise ptc={familyPtc} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'ptcDimCarcosa'}
			<PtcDimCarcosa ptc={familyPtc} scenarios={familyScenarios} code={family ?? 'ptc'} {family} achievements={tskScenarioAch} logOnly={lo} />
		{:else if widget.id === 'tcuAllegiance'}
			<TcuAllegiance tcu={familyTcu} />
		{:else if widget.id === 'tcuMissingPersons'}
			<TcuMissingPersons tcu={familyTcu} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'tcuMementos'}
			<TcuMementos tcu={familyTcu} />
		{:else if widget.id === 'tcuWitchingHour'}
			<TcuWitchingHour tcu={familyTcu} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'tcuDoorstep'}
			<TcuAtDeathsDoorstep tcu={familyTcu} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'tcuSecretName'}
			<TcuSecretName tcu={familyTcu} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'tcuWagesOfSin'}
			<TcuWagesOfSin tcu={familyTcu} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'tcuGreaterGood'}
			<TcuForTheGreaterGood tcu={familyTcu} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'tcuUnion'}
			<TcuUnionAndDisillusion tcu={familyTcu} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'tcuClutches'}
			<TcuClutchesOfChaos tcu={familyTcu} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'tcuEndings'}
			<TcuEndings tcu={familyTcu} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'tdeaPlayMode'}
			<TdePlayMode shared={familyTdea?.shared ?? null} />
		{:else if widget.id === 'tdeaEvidence'}
			<TdeaEvidenceOfKadath tdea={familyTdea} />
		{:else if widget.id === 'tdeaBeyondGates'}
			<TdeaBeyondTheGates tdea={familyTdea} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'tdeaSearchForKadath'}
			<TdeaSearchForKadath tdea={familyTdea} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'tdeaDarkSide'}
			<TdeaDarkSideOfTheMoon tdea={familyTdea} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'tdeaGodsDwell'}
			<TdeaWhereTheGodsDwell tdea={familyTdea} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'tdeaBlackCat'}
			<TdeBlackCat shared={familyTdea?.shared ?? null} />
		{:else if widget.id === 'tdeaSilverKey'}
			<TdeSilverKey shared={familyTdea?.shared ?? null} />
		{:else if widget.id === 'tdeaRandolph'}
			<TdeRandolph shared={familyTdea?.shared ?? null} />
		{:else if widget.id === 'tdeaMatrix'}
			<TdeEpilogueMatrix shared={familyTdea?.shared ?? null} />
		{:else if widget.id === 'tdebPlayMode'}
			<TdePlayMode shared={familyTdeb?.shared ?? null} />
		{:else if widget.id === 'tdebSteps'}
			<TdebStepsOfTheBridge tdeb={familyTdeb} />
		{:else if widget.id === 'tdebWakingNightmare'}
			<TdebWakingNightmare tdeb={familyTdeb} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'tdebThousandShapes'}
			<TdebAThousandShapes tdeb={familyTdeb} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'tdebPointOfNoReturn'}
			<TdebPointOfNoReturn tdeb={familyTdeb} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'tdebWeaver'}
			<TdebWeaverOfTheCosmos tdeb={familyTdeb} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'tdebBlackCat'}
			<TdeBlackCat shared={familyTdeb?.shared ?? null} />
		{:else if widget.id === 'tdebSilverKey'}
			<TdeSilverKey shared={familyTdeb?.shared ?? null} />
		{:else if widget.id === 'tdebRandolph'}
			<TdeRandolph shared={familyTdeb?.shared ?? null} />
		{:else if widget.id === 'tdebMatrix'}
			<TdeEpilogueMatrix shared={familyTdeb?.shared ?? null} />
		{:else if widget.id === 'ticMemories'}
			<TicMemories tic={familyTic} />
		{:else if widget.id === 'ticKeys'}
			<TicSevenKeys tic={familyTic} />
		{:else if widget.id === 'ticPit'}
			<TicPit tic={familyTic} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'ticHarper'}
			<TicHarper tic={familyTic} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'ticInTooDeep'}
			<TicInTooDeep tic={familyTic} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'ticDevilReef'}
			<TicDevilReef tic={familyTic} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'ticHorror'}
			<TicHorrorInHighGear tic={familyTic} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'ticLightInTheFog'}
			<TicLightInTheFog tic={familyTic} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'ticDagon'}
			<TicLairOfDagon tic={familyTic} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'ticMaelstrom'}
			<TicIntoTheMaelstrom tic={familyTic} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'fhvVale'}
			<FhvVale fhv={familyFhv} />
		{:else if widget.id === 'fhvSchedule'}
			<FhvSchedule fhv={familyFhv} logOnly={lo} />
		{:else if widget.id === 'fhvRachel'}
			<FhvVillager villager="rachel" fhv={familyFhv} />
		{:else if widget.id === 'fhvLeah'}
			<FhvVillager villager="leah" fhv={familyFhv} />
		{:else if widget.id === 'fhvSimeon'}
			<FhvVillager villager="simeon" fhv={familyFhv} />
		{:else if widget.id === 'fhvWilliam'}
			<FhvVillager villager="william" fhv={familyFhv} />
		{:else if widget.id === 'fhvRiver'}
			<FhvVillager villager="river" fhv={familyFhv} />
		{:else if widget.id === 'fhvGideon'}
			<FhvVillager villager="gideon" fhv={familyFhv} />
		{:else if widget.id === 'fhvJudith'}
			<FhvVillager villager="judith" fhv={familyFhv} />
		{:else if widget.id === 'fhvTheo'}
			<FhvVillager villager="theo" fhv={familyFhv} />
		{:else if widget.id === 'fhvFate'}
			<FhvFate fhv={familyFhv} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'fhvCurse'}
			<FhvCurse fhv={familyFhv} />
		{:else if widget.id === 'fhvDance'}
			<FhvDance fhv={familyFhv} />
		{:else if widget.id === 'fhvFinalEvening'}
			<FhvFinalEvening fhv={familyFhv} />
		{:else if widget.id === 'fhvScWrittenInRock'}
			<FhvWrittenInRock fhv={familyFhv} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'fhvScHemlockHouse'}
			<FhvHemlockHouse fhv={familyFhv} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'fhvScSilentHeath'}
			<FhvSilentHeath fhv={familyFhv} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'fhvScLostSister'}
			<FhvLostSister fhv={familyFhv} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'fhvScThingDepths'}
			<FhvThingDepths fhv={familyFhv} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'fhvScTwistedHollow'}
			<FhvTwistedHollow fhv={familyFhv} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'fhvScLongestNight'}
			<FhvLongestNight fhv={familyFhv} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'tdcFold'}
			<TdcFold tdc={familyTdc} />
		{:else if widget.id === 'tdcArtifacts'}
			<TdcArtifacts tdc={familyTdc} />
		{:else if widget.id === 'tdcTasks'}
			<TdcTasks tdc={familyTdc} logOnly={lo} />
		{:else if widget.id === 'tdcOneLastJob'}
			<TdcScenario scenario="one_last_job" tdc={familyTdc} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'tdcWesternWall'}
			<TdcScenario scenario="the_western_wall" tdc={familyTdc} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'tdcDrownedQuarter'}
			<TdcScenario scenario="the_drowned_quarter" tdc={familyTdc} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'tdcApiary'}
			<TdcScenario scenario="the_apiary" tdc={familyTdc} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'tdcGrandVault'}
			<TdcScenario scenario="the_grand_vault" tdc={familyTdc} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'tdcCourtOfAncients'}
			<TdcScenario scenario="court_of_the_ancients" tdc={familyTdc} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'tdcObsidianCanyons'}
			<TdcScenario scenario="obsidian_canyons" tdc={familyTdc} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'tdcSepulchre'}
			<TdcSepulchre tdc={familyTdc} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'tdcDoom'}
			<TdcDoom tdc={familyTdc} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'notzThreatsBelow'}
			<NotzThreatsBelow notz={familyNotz} />
		{:else if widget.id === 'notzGathering'}
			<NotzGathering notz={familyNotz} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'notzMidnightMasks'}
			<NotzMidnightMasks notz={familyNotz} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'notzDevourerBelow'}
			<NotzDevourerBelow notz={familyNotz} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'notzCoreOnly'}
			<NotzCoreOnly notz={familyNotz} />
		{:else if widget.id === 'eoeCity'}
			<EoeCityMatrix {family} achievements={tskScenarioAch} scenarios={familyScenarios} />
		{:else if widget.id === 'eoeCrash'}
			<EoeMemberRoster eoe={familyEoe} metric="killed" />
		{:else if widget.id === 'eoeDemons'}
			<EoeMemberRoster eoe={familyEoe} metric="demons" />
		{:else if widget.id === 'eoeSurvivors'}
			<EoeMemberRoster eoe={familyEoe} metric="survived" />
		{:else if widget.id === 'eoeRescued'}
			<EoeMemberRoster eoe={familyEoe} metric="rescued" />
		{:else if widget.id === 'eoeMementos'}
			<EoeMementos cardUsage={data.cardUsage} />
		{:else if widget.id === 'eoeSupplies'}
			<EoeItemTally eoe={familyEoe} kind="supplies" />
		{:else if widget.id === 'eoeCamped'}
			<EoeItemTally eoe={familyEoe} kind="camped" />
		{:else if widget.id === 'eoeMemories'}
			<EoeMemoryWall eoe={familyEoe} />
		{:else if widget.id === 'eoeFrost'}
			<EoeFrostTokens eoe={familyEoe} />
		{:else if widget.id === 'eoeMiasma'}
			<EoeMiasma eoe={familyEoe} />
		{:else if widget.id === 'eoeFatalMirage'}
			<EoeFatalMirage
				eoe={familyEoe}
				{family}
				achievements={tskScenarioAch}
				scenarios={familyScenarios}
			/>
		{:else if widget.id === 'eoeIceDeath'}
			<EoeIceAndDeath eoe={familyEoe} logOnly={lo} />
		{:else if widget.id === 'tfaVengeance'}
			<TfaVengeance tfa={familyTfa} />
		{:else if widget.id === 'tfaSupplies'}
			<TfaSupplies tfa={familyTfa} />
		{:else if widget.id === 'tfaCompanions'}
			<TfaCompanions tfa={familyTfa} />
		{:else if widget.id === 'tfaHarbinger'}
			<TfaHarbinger tfa={familyTfa} logOnly={lo} />
		{:else if widget.id === 'tfaPoison'}
			<TfaPoison tfa={familyTfa} />
		{:else if widget.id === 'tfaWilds'}
			<TfaUntamedWilds tfa={familyTfa} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'tfaEztli'}
			<TfaDoomOfEztli tfa={familyTfa} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'tfaThreads'}
			<TfaThreadsOfFate tfa={familyTfa} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'tfaBoundary'}
			<TfaBoundaryBeyond tfa={familyTfa} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'tfaHote'}
			<TfaHeartOfElders tfa={familyTfa} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'tfaArchives'}
			<TfaCityOfArchives tfa={familyTfa} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'tfaYoth'}
			<TfaDepthsOfYoth tfa={familyTfa} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'tfaAeons'}
			<TfaShatteredAeons tfa={familyTfa} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'tfaTurnBackTime'}
			<TfaTurnBackTime tfa={familyTfa} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'dwlOpening'}
			<DwlOpening dwl={familyDwl} />
		{:else if widget.id === 'dwlMissingPersons'}
			<DwlMissingPersons dwl={familyDwl} />
		{:else if widget.id === 'dwlMiskatonic'}
			<DwlMiskatonicMuseum dwl={familyDwl} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'dwlEssex'}
			<DwlEssex dwl={familyDwl} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'dwlSilas'}
			<DwlSilas dwl={familyDwl} />
		{:else if widget.id === 'dwlSacrifices'}
			<DwlSacrifices dwl={familyDwl} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'dwlUndimensioned'}
			<DwlUndimensioned dwl={familyDwl} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'dwlAscendingHill'}
			<DwlAscendingHill dwl={familyDwl} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'dwlFinale'}
			<DwlFinale dwl={familyDwl} {family} achievements={tskScenarioAch} scenarios={familyScenarios} logOnly={lo} />
		{:else if widget.id === 'dwlEpilogue'}
			<DwlEpilogue dwl={familyDwl} />
		{/if}
	</WidgetFrame>
{/snippet}

<!--
  A `split` row is FIXED-width. Above a breakpoint its two slots are each exactly
  `--widget-half-width` (sized for a 4-card row), CENTRED as a pair, and the row bleeds a
  little past the page gutter so two fixed slots fit from a normal desktop width. The slot
  width never changes with the screen — so each half-width widget can be designed for
  exactly one width and its card count never reflows. Below the breakpoint a split relaxes
  to one full-width column (the roomy, easy case). Full-width rows keep the page gutter, so
  a 2-up split can sit a touch WIDER than a full row — fine, the eye only scans half of it.
-->
<div class="widget-rows mt-6 space-y-6">
	{#each visibleRows as row, i (i)}
		{#if row.kind === 'full'}
			{#if row.slot}
				<div>{@render widgetBody(row.slot)}</div>
			{/if}
		{:else}
			<div class="widget-split">
				<div>
					{#if row.left}{@render widgetBody(row.left)}{/if}
				</div>
				<div>
					{#if row.right}{@render widgetBody(row.right)}{/if}
				</div>
			</div>
		{/if}
	{/each}
</div>

<style>
	.widget-rows {
		/* Query the CONTENT width (not the viewport), so the breakpoint below is independent
		   of the page gutter / any sidebar. */
		container-type: inline-size;
	}
	.widget-split {
		/* THE design knob: the FIXED width of one half-width slot. 34rem → ~512px of body
		   after the frame's ~32px padding = exactly a 4-wide card row (4×120px + gaps ≈ 504px)
		   and TskKeysWall's 5+3+3 keys. Bump it for more cards per half — and raise the floor
		   below to (2 × width + 1.5rem gap − 6rem bleed). */
		--widget-half-width: 34rem;
		display: grid;
		gap: 1.5rem; /* = gap-6; also the vertical gap between the two slots when stacked */
		grid-template-columns: minmax(0, 1fr); /* stacked → full width (the easy case) */
	}
	/* 64rem floor = 2 × 34rem + 1.5rem gap − 6rem bleed (with slack). Above it the two slots
	   are FIXED and CENTRED, and the row bleeds -3rem past the gutter each side (MarginFull's
	   gutter here is 4rem → ~1rem edge) so they fit from ~1152px and may sit wider than a
	   full row. Fixed width = zero content reflow as the screen grows; a very wide screen
	   just centres the pair with more empty margin, by design. */
	@container (min-width: 64rem) {
		.widget-split {
			grid-template-columns: var(--widget-half-width) var(--widget-half-width);
			justify-content: center;
			margin-inline: -3rem;
		}
	}
</style>
