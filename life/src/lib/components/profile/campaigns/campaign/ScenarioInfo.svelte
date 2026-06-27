<!--
@component
The shared per-scenario "passport" — the common look every per-scenario widget renders,
reading ONE unified `ScenarioStat` (sliced from the campaign's `scenarios` record). It shows,
top→bottom: an optional header row (campaign reference via `headerArt`/`location`/`headerMeta`
snippets + corner stats — played / Succeed / Failed + a `cornerExtra` slot), the resolutions
reached (+ each one's win/loss verdict) and the victory-display highscore, a `stats` snippet (the
standardised big-number section), the achievements earned only in this scenario, and a final
`children` snippet. The scenario NAME and encounter icon live on the widget's title tab, not here.

All per-scenario stats are precomputed (campaign `scenarios` record); this component only displays
them. Succeed/Failed come from the stat (campaign-data `resolutionOutcomes`); `plays`/`succeed`/
`failed` props are optional overrides (TSK passes its authoritative tallies), and `showPlays` opts a
scenario into the generic played count (its `stat.plays`) for campaigns with selectable scenarios.
-->
<script lang="ts" module>
	export interface CornerStat {
		total: number;
		/** Optional per-difficulty breakdown; enables the difficulty hover on this number. */
		byTier?: Record<string, number>;
	}
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getCampaignLog } from '@5argon/arkham-campaign-data';
	import { FaIcon, FaIconType, HoverTooltip, parseArkhamMarkup } from '@5argon/arkham-life-ui';
	import * as msg from '$lib/paraglide/messages.js';
	import {
		difficultyBreakdown,
		difficultyLabel,
		orderedDifficulties,
		times
	} from '$lib/campaign/utils/difficulty';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import { resolutionShort } from '$lib/campaign/utils/resolutions';
	import { scenarioMeta } from '$lib/campaign/utils/scenario-meta';
	import {
		isVictoryDisplay,
		rewardUnit,
		rewardBreakdownEntry,
		rewardHighscoreLabel
	} from '$lib/campaign/utils/scenario-reward';
	import ResolutionChips from '$lib/components/profile/campaigns/campaign/ResolutionChips.svelte';
	import SectionLabel from '$lib/components/profile/_primitives/SectionLabel.svelte';

	let {
		scenarioId,
		family,
		scenarios = null,
		achievements = [],
		hideAchievements = false,
		location = null,
		plays = null,
		showPlays = false,
		succeed: succeedProp = null,
		failed: failedProp = null,
		hideResolutions = false,
		hideVp = false,
		logOnly = false,
		headerArt,
		headerMeta,
		cornerExtra,
		stats,
		children
	}: {
		scenarioId: string;
		family: string | null;
		/** The campaign's unified per-scenario records; this passport slices it to `scenarioId`. */
		scenarios?: CampaignScenarios | null;
		/** The family's official achievements (with earned state) — filtered to this scenario. */
		achievements?: ProfileFamilyAchievement[];
		hideAchievements?: boolean;
		/** Optional location line under the header art (TSK passes its solver location; others omit). */
		location?: string | null;
		/** Corner stats. `plays`/`succeed`/`failed` are explicit OVERRIDES (TSK passes authoritative
		 *  tallies); otherwise Succeed/Failed come from the stat and `showPlays` opts into the generic
		 *  played count (the stat's `plays`). Each shown only when total > 0 and not `logOnly`. */
		plays?: CornerStat | null;
		showPlays?: boolean;
		succeed?: CornerStat | null;
		failed?: CornerStat | null;
		/** Suppress the auto resolution / VP rows where a campaign surfaces them elsewhere. */
		hideResolutions?: boolean;
		hideVp?: boolean;
		/** "Log-only mode" — hide every Extra-derived overlay (corner stats, resolutions, VP). */
		logOnly?: boolean;
		/** Campaign reference art, rendered to the LEFT of the reference block (TSK card images). */
		headerArt?: Snippet;
		/** Campaign reference text, rendered below the location (TSK Key / Coterie lines). */
		headerMeta?: Snippet;
		/** Extra corner chip(s) after played / Succeed / Failed (TSK Key won). */
		cornerExtra?: Snippet;
		/** The standardised stat-numbers section (callers render `<StatNumbers>`). */
		stats?: Snippet;
		/** Final bespoke content below the passport. */
		children?: Snippet;
	} = $props();

	// The unified per-scenario record (null when this scenario has no recorded data yet).
	const stat = $derived(scenarios?.scenarios.find((s) => s.scenario === scenarioId) ?? null);

	// ── Achievements tagged with THIS scenario (campaign-data `achievement.scenario`) ──
	const scenarioAch = $derived.by(() => {
		if (hideAchievements) return [];
		const log = family ? getCampaignLog(family) : undefined;
		const tagged = new Set(
			(log?.db.achievements ?? []).filter((a) => a.scenario === scenarioId).map((a) => a.id)
		);
		return achievements.filter((a) => tagged.has(a.id));
	});

	// ── Resolutions reached + their win/loss verdicts (from the stat) ────────────────
	const resolutionIds = $derived(stat?.resolutions ?? []);
	const visitedAll = $derived(new Set(stat?.visited ?? []));
	const resolutionVerdicts = $derived(stat?.verdicts ?? {});
	const showResolutions = $derived(!logOnly && !hideResolutions && resolutionIds.length > 0);
	// Which resolutions count as Success / Failure — surfaced in the corner-stat hovers (the
	// qualifying list) and on the chips, so the player sees how each ending is scored.
	const winResList = $derived(
		Object.keys(resolutionVerdicts)
			.filter((r) => resolutionVerdicts[r] === 'win')
			.map(resolutionShort)
			.join(' · ')
	);
	const lossResList = $derived(
		Object.keys(resolutionVerdicts)
			.filter((r) => resolutionVerdicts[r] === 'loss')
			.map(resolutionShort)
			.join(' · ')
	);

	// ── End-of-scenario reward highscore (from the stat) ─────────────────────────────
	// Worded as the app shows it: Victory display (VP) or flat Experience (XP) per scenario.
	const vd = $derived(isVictoryDisplay(family, scenarioId));
	// The scenario's reward ceiling (campaign-data `maxXp`): `undefined` = not curated; a curated `0`
	// means the scenario officially awards nothing, so we keep NO highscore for it (hide the section
	// even if a card forced some into the victory display); `> 0` shows a dimmed "/ N VP" reference.
	const scenarioMax = $derived(scenarioMeta(family, scenarioId)?.maxXp);
	const showMax = $derived(scenarioMax != null && scenarioMax > 0);
	const vpBest = $derived(stat?.best ?? 0);
	const vpBestByTier = $derived(stat?.bestByTier ?? {});
	const showVp = $derived(!logOnly && !hideVp && vpBest > 0 && scenarioMax !== 0);
	const vpBreakdown = $derived.by(() => {
		const b = vpBestByTier;
		return orderedDifficulties(b)
			.filter((t) => b[t] != null)
			.map((t) => rewardBreakdownEntry(vd, difficultyLabel(t), b[t]))
			.join(' · ');
	});
	let vpTipVisible = $state(false);
	let vpTipRef = $state<HTMLElement | null>(null);

	// ── Corner stats ────────────────────────────────────────────────────────────────
	// Played: an explicit override (TSK's authoritative count) wins; else, when `showPlays`, the
	// stat's generic played count (records that recorded the scenario via XP or a resolution).
	const playsStat = $derived<CornerStat | null>(
		plays ?? (showPlays ? { total: stat?.plays ?? 0, byTier: stat?.playsByTier ?? {} } : null)
	);
	const succeed = $derived(succeedProp ?? stat?.succeed ?? null);
	const failed = $derived(failedProp ?? stat?.failed ?? null);
	const showPlayed = $derived(!logOnly && (playsStat?.total ?? 0) > 0);
	const showSucceed = $derived(!logOnly && (succeed?.total ?? 0) > 0);
	const showFailed = $derived(!logOnly && (failed?.total ?? 0) > 0);
	const showNeverPlayed = $derived(
		!logOnly &&
			!!playsStat &&
			playsStat.total === 0 &&
			(succeed?.total ?? 0) === 0 &&
			(failed?.total ?? 0) === 0
	);
	const showCorner = $derived(
		showPlayed || showSucceed || showFailed || showNeverPlayed || (!logOnly && !!cornerExtra)
	);
	// "Header lead" = campaign reference content (art / location / meta). When ABSENT (most campaigns
	// — the name + icon live on the title tab), there's NO dedicated header row; the corner stats
	// instead share the resolutions/VP row, so no empty top-left space is reserved above them.
	const hasHeaderLead = $derived(!!headerArt || !!headerMeta || !!location);
	// Resolutions + VP highscore share one block (VP inline right after the chips).
	const showCoverageBlock = $derived(showResolutions || showVp);

	const playsBreakdown = $derived(difficultyBreakdown(playsStat?.byTier ?? {}, times));
	const succeedBreakdown = $derived(difficultyBreakdown(succeed?.byTier ?? {}, times));
	const failedBreakdown = $derived(difficultyBreakdown(failed?.byTier ?? {}, times));
	let playsTipVisible = $state(false);
	let playsTipRef = $state<HTMLElement | null>(null);
	let succeedTipVisible = $state(false);
	let succeedTipRef = $state<HTMLElement | null>(null);
	let failedTipVisible = $state(false);
	let failedTipRef = $state<HTMLElement | null>(null);

	// ── One shared tooltip for the achievement row ────────────────────────────────
	let achTipVisible = $state(false);
	let achTipRef = $state<HTMLElement | null>(null);
	let achTipText = $state('');
	function showAchTip(text: string, e: MouseEvent) {
		achTipText = text;
		achTipRef = e.currentTarget as HTMLElement;
		achTipVisible = true;
	}
	const hideAchTip = () => (achTipVisible = false);
</script>

{#snippet cornerStats()}
	<!-- Corner stats: played + Succeed/Failed + cornerExtra (each hovers to its breakdown). -->
	<div class="flex shrink-0 flex-wrap items-start justify-end gap-x-4 gap-y-1 text-right">
		{#if showPlayed}
			<div
				role="img"
				aria-label="{msg.campaign_scenario_played_tip({
					count: times(playsStat?.total ?? 0)
				})}{playsBreakdown ? ` — ${playsBreakdown}` : ''}"
				class="cursor-default"
				onmouseenter={(e) => {
					playsTipRef = e.currentTarget as HTMLElement;
					playsTipVisible = true;
				}}
				onmouseleave={() => (playsTipVisible = false)}
			>
				<p class="text-secondary-600 dark:text-secondary-400 text-lg font-bold tabular-nums">
					×{playsStat?.total ?? 0}
				</p>
				<p class="text-primary-500 text-[0.65rem]">{msg.campaign_scenario_played()}</p>
			</div>
		{/if}
		{#if showSucceed}
			<div
				role="img"
				aria-label="{msg.campaign_scenario_succeed()} ×{succeed?.total ?? 0}{succeedBreakdown ? ` — ${succeedBreakdown}` : ''}{winResList ? ` — ${winResList}` : ''}"
				class="cursor-default"
				onmouseenter={(e) => {
					succeedTipRef = e.currentTarget as HTMLElement;
					succeedTipVisible = true;
				}}
				onmouseleave={() => (succeedTipVisible = false)}
			>
				<p class="text-secondary-600 dark:text-secondary-400 text-lg font-bold tabular-nums">
					×{succeed?.total ?? 0}
				</p>
				<p class="text-primary-500 text-[0.65rem]">{msg.campaign_scenario_succeed()}</p>
			</div>
		{/if}
		{#if showFailed}
			<div
				role="img"
				aria-label="{msg.campaign_scenario_failed()} ×{failed?.total ?? 0}{failedBreakdown ? ` — ${failedBreakdown}` : ''}{lossResList ? ` — ${lossResList}` : ''}"
				class="cursor-default"
				onmouseenter={(e) => {
					failedTipRef = e.currentTarget as HTMLElement;
					failedTipVisible = true;
				}}
				onmouseleave={() => (failedTipVisible = false)}
			>
				<p class="text-primary-700 dark:text-primary-300 text-lg font-bold tabular-nums">
					×{failed?.total ?? 0}
				</p>
				<p class="text-primary-500 text-[0.65rem]">{msg.campaign_scenario_failed()}</p>
			</div>
		{/if}
		{#if !logOnly}
			{@render cornerExtra?.()}
		{/if}
		{#if showNeverPlayed}
			<p class="text-primary-400 text-xs italic">{msg.campaign_scenario_never_played()}</p>
		{/if}
	</div>
{/snippet}

{#snippet coverageBlock()}
	<!-- Resolutions reached + victory-display highscore. Two aligned columns: labels on top, chips +
	     XP below. The VP highscore sits inline right after the resolution chips. -->
	<div class="flex flex-wrap items-start gap-x-6 gap-y-2">
		{#if showResolutions}
			<div>
				<SectionLabel>{msg.campaign_scenario_resolutions()}</SectionLabel>
				<ResolutionChips
					ids={resolutionIds}
					visited={visitedAll}
					tallies={stat?.tallies ?? null}
					verdicts={resolutionVerdicts}
				/>
			</div>
		{/if}
		{#if showVp}
			<div
				role="img"
				aria-label="{rewardHighscoreLabel(vd)}: {rewardUnit(vd, vpBest)}{showMax
					? ` / ${rewardUnit(vd, scenarioMax!)}`
					: ''}{vpBreakdown ? ` — ${vpBreakdown}` : ''}"
				class="cursor-default"
				onmouseenter={(e) => {
					vpTipRef = e.currentTarget as HTMLElement;
					vpTipVisible = true;
				}}
				onmouseleave={() => (vpTipVisible = false)}
			>
				<SectionLabel>{rewardHighscoreLabel(vd)}</SectionLabel>
				<span class="text-secondary-600 dark:text-secondary-400 text-lg leading-none font-bold tabular-nums"
					>{rewardUnit(vd, vpBest)}{#if showMax}<span
							class="text-primary-400 ml-0.5 text-xs font-normal"
							>/ {rewardUnit(vd, scenarioMax!)}</span
						>{/if}</span
				>
			</div>
		{/if}
	</div>
{/snippet}

<div class="flex flex-col gap-3">
	{#if hasHeaderLead}
		<!-- Header: campaign reference (headerArt / location / headerMeta) on the left, corner stats on
		     the right. The scenario NAME and encounter icon live on the widget's title tab; for TSK the
		     location (e.g. "Marrakesh") is the line shown here. -->
		<div class="flex items-start gap-3">
			{@render headerArt?.()}
			<div class="min-w-0 flex-1">
				{#if location}
					<div class="text-primary-500 text-xs">{location}</div>
				{/if}
				{@render headerMeta?.()}
			</div>
			{#if showCorner}{@render cornerStats()}{/if}
		</div>
		{#if showCoverageBlock}{@render coverageBlock()}{/if}
	{:else if showCoverageBlock}
		<!-- No header lead (most campaigns): the corner stats share the resolutions/VP row, so no empty
		     top-left space is reserved above them. -->
		<div class="flex items-start justify-between gap-3">
			<div class="min-w-0">{@render coverageBlock()}</div>
			{#if showCorner}{@render cornerStats()}{/if}
		</div>
	{:else if showCorner}
		<div class="flex justify-end">{@render cornerStats()}</div>
	{/if}

	<!-- The standardised stat-numbers section (callers render <StatNumbers>). -->
	{@render stats?.()}

	<!-- Official achievements tagged with this scenario (lit when earned). -->
	{#if scenarioAch.length}
		<div>
			<SectionLabel>{msg.campaign_scenario_achievements()}</SectionLabel>
			<ul class="flex flex-wrap gap-x-4 gap-y-1">
				{#each scenarioAch as a (a.id)}
					<li
						role="note"
						aria-label="{a.title}{a.text ? ` — ${a.text}` : ''}"
						class="flex cursor-default items-center gap-1.5 text-xs"
						class:opacity-45={!a.earned}
						onmouseenter={(e) => a.text && showAchTip(a.text, e)}
						onmouseleave={hideAchTip}
					>
						<span
							class={a.earned
								? 'text-yellow-500 dark:text-yellow-400'
								: 'text-primary-300 dark:text-primary-600'}
						>
							<FaIcon icon={FaIconType.Achievement} />
						</span>
						<span class="font-medium text-black dark:text-white">{a.title}</span>
						{#if a.earnCount > 1}
							<span
								class="text-secondary-600 dark:text-secondary-400 text-[0.65rem] font-semibold tabular-nums"
								>×{a.earnCount}</span
							>
						{/if}
					</li>
				{/each}
			</ul>
		</div>
	{/if}

	<!-- Final bespoke content. -->
	{@render children?.()}
</div>

<HoverTooltip visible={playsTipVisible} referenceElement={playsTipRef}>
	<span class="block py-1 text-xs text-neutral-900 dark:text-neutral-100">
		<span class="font-semibold"
			>{msg.campaign_scenario_played_tip({ count: times(playsStat?.total ?? 0) })}</span
		>
		{#if playsBreakdown}
			<br />
			<span class="text-neutral-600 dark:text-neutral-300">{playsBreakdown}</span>
		{/if}
	</span>
</HoverTooltip>

<HoverTooltip visible={succeedTipVisible} referenceElement={succeedTipRef}>
	<span class="block py-1 text-xs text-neutral-900 dark:text-neutral-100">
		<span class="font-semibold">{msg.campaign_scenario_succeed()} {times(succeed?.total ?? 0)}</span>
		{#if succeedBreakdown}
			<br />
			<span class="text-neutral-600 dark:text-neutral-300">{succeedBreakdown}</span>
		{/if}
		{#if winResList}
			<br />
			<span class="text-neutral-500 dark:text-neutral-400">{winResList}</span>
		{/if}
	</span>
</HoverTooltip>

<HoverTooltip visible={failedTipVisible} referenceElement={failedTipRef}>
	<span class="block py-1 text-xs text-neutral-900 dark:text-neutral-100">
		<span class="font-semibold">{msg.campaign_scenario_failed()} {times(failed?.total ?? 0)}</span>
		{#if failedBreakdown}
			<br />
			<span class="text-neutral-600 dark:text-neutral-300">{failedBreakdown}</span>
		{/if}
		{#if lossResList}
			<br />
			<span class="text-neutral-500 dark:text-neutral-400">{lossResList}</span>
		{/if}
	</span>
</HoverTooltip>

<HoverTooltip visible={vpTipVisible} referenceElement={vpTipRef}>
	<span class="block py-1 text-xs text-neutral-900 dark:text-neutral-100">
		<span class="font-semibold">{rewardHighscoreLabel(vd)} {rewardUnit(vd, vpBest)}</span>
		{#if vpBreakdown}
			<br />
			<span class="text-neutral-600 dark:text-neutral-300">{vpBreakdown}</span>
		{/if}
	</span>
</HoverTooltip>

<HoverTooltip visible={achTipVisible} referenceElement={achTipRef}>
	<span class="block max-w-xs py-1 text-xs text-neutral-700 dark:text-neutral-200"
		>{@html parseArkhamMarkup(achTipText)}</span
	>
</HoverTooltip>
