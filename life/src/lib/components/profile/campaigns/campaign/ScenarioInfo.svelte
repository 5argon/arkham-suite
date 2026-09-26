<!--
@component
A scenario passport: plays and Succeed/Failed in the corner, resolutions reached and the reward
highscore, the caller's `stats`, the scenario's achievements, then `children`. The scenario's name
and icon are on the widget frame.
-->
<script lang="ts" module>
	export interface HeaderCard {
		code?: string;
		src?: string;
		/** Defaults to the card's name. */
		label?: string;
		tone?: 'primary' | 'danger';
		objectTop?: boolean;
	}
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getCampaignLog } from '@5argon/arkham-campaign-data';
	import { FaIcon, FaIconType } from '@5argon/arkham-life-ui';
	import {
		difficultyBreakdown,
		difficultyLabel,
		nTimes,
		orderedDifficulties
	} from '$lib/campaign/utils/difficulty';
	import { resolutionShort } from '$lib/campaign/utils/resolutions';
	import { scenarioMeta } from '$lib/campaign/utils/scenario-meta';
	import {
		isVictoryDisplay,
		rewardBreakdownEntry,
		rewardHighscoreLabel,
		rewardUnit
	} from '$lib/campaign/utils/scenario-reward';
	import type { Tally } from '$lib/campaign/utils/tally';
	import type { WidgetContext } from '$lib/components/profile/_framework/widget-context';
	import CardThumb from '$lib/components/profile/_primitives/CardThumb.svelte';
	import HoverTip from '$lib/components/profile/_primitives/HoverTip.svelte';
	import { HoverTipState } from '$lib/components/profile/_primitives/hover-tip.svelte';
	import SectionLabel from '$lib/components/profile/_primitives/SectionLabel.svelte';
	import WidgetEmpty from '$lib/components/profile/_primitives/WidgetEmpty.svelte';
	import ResolutionChips from './ResolutionChips.svelte';
	import * as msg from '$lib/paraglide/messages.js';

	let {
		ctx,
		location = null,
		plays = null,
		showPlays = false,
		succeed: succeedProp = null,
		failed: failedProp = null,
		hideResolutions = false,
		hideVp = false,
		empty = null,
		headerCards = [],
		headerArt,
		headerMeta,
		cornerExtra,
		stats,
		children
	}: {
		ctx: WidgetContext;
		/** A line under the header art. */
		location?: string | null;
		/** Overrides the corner counts; otherwise Succeed/Failed come from the scenario record and
		 *  `showPlays` adds its play count. */
		plays?: Tally | null;
		showPlays?: boolean;
		succeed?: Tally | null;
		failed?: Tally | null;
		hideResolutions?: boolean;
		hideVp?: boolean;
		/** Shown instead of `stats` when set. */
		empty?: string | null;
		headerCards?: HeaderCard[];
		headerArt?: Snippet;
		headerMeta?: Snippet;
		cornerExtra?: Snippet;
		stats?: Snippet;
		children?: Snippet;
	} = $props();

	const scenarioId = $derived(ctx.scenario ?? '');
	const family = $derived(ctx.family);
	const logOnly = $derived(ctx.logOnly);

	const stat = $derived(ctx.scenarios?.scenarios.find((s) => s.scenario === scenarioId) ?? null);

	const scenarioAch = $derived.by(() => {
		if (ctx.config.hideAchievements === true) return [];
		const log = family ? getCampaignLog(family) : undefined;
		const tagged = new Set(
			(log?.db.achievements ?? []).filter((a) => a.scenario === scenarioId).map((a) => a.id)
		);
		return ctx.achievements.filter((a) => tagged.has(a.id));
	});

	const resolutionIds = $derived(stat?.resolutions ?? []);
	const verdicts = $derived(stat?.verdicts ?? {});
	const showResolutions = $derived(!logOnly && !hideResolutions && resolutionIds.length > 0);
	const resolutionsWith = (verdict: string) =>
		Object.keys(verdicts)
			.filter((r) => verdicts[r] === verdict)
			.map(resolutionShort)
			.join(' · ');

	const vd = $derived(isVictoryDisplay(family, scenarioId));
	/** A curated 0 means the scenario keeps no highscore. */
	const scenarioMax = $derived(scenarioMeta(family, scenarioId)?.maxXp);
	const vpBest = $derived(stat?.best ?? 0);
	const showVp = $derived(!logOnly && !hideVp && vpBest > 0 && scenarioMax !== 0);
	const vpBreakdown = $derived.by(() => {
		const b = stat?.bestByTier ?? {};
		return orderedDifficulties(b)
			.filter((t) => b[t] != null)
			.map((t) => rewardBreakdownEntry(vd, difficultyLabel(t), b[t]))
			.join(' · ');
	});

	const playsStat = $derived<Tally | null>(
		plays ?? (showPlays ? { total: stat?.plays ?? 0, byTier: stat?.playsByTier ?? {} } : null)
	);
	const succeed = $derived(succeedProp ?? stat?.succeed ?? null);
	const failed = $derived(failedProp ?? stat?.failed ?? null);
	const neverPlayed = $derived(
		!!playsStat && !playsStat.total && !succeed?.total && !failed?.total
	);
	const showCorner = $derived(
		!logOnly &&
			(!!playsStat?.total || !!succeed?.total || !!failed?.total || neverPlayed || !!cornerExtra)
	);
	const hasHeaderLead = $derived(
		!!headerArt || !!headerMeta || !!location || headerCards.length > 0
	);

	const tip = new HoverTipState();
</script>

{#snippet corner(
	t: Tally | null,
	label: string,
	tipTitle: string,
	resolutions: string,
	muted: boolean
)}
	{#if t?.total}
		{@const breakdown = difficultyBreakdown(t.byTier)}
		<div
			role="img"
			aria-label="{tipTitle}{breakdown ? ` — ${breakdown}` : ''}"
			class="cursor-default"
			onmouseenter={(e) => tip.show(tipTitle, [breakdown, resolutions], e)}
			onmouseleave={tip.hide}
		>
			<p
				class="text-lg font-bold tabular-nums {muted
					? 'text-primary-700 dark:text-primary-300'
					: 'text-secondary-600 dark:text-secondary-400'}"
			>
				×{t.total}
			</p>
			<p class="text-primary-500 text-[0.65rem]">{label}</p>
		</div>
	{/if}
{/snippet}

{#snippet cornerStats()}
	<div class="flex shrink-0 flex-wrap items-start justify-end gap-x-4 gap-y-1 text-right">
		{@render corner(
			playsStat,
			msg.campaign_scenario_played(),
			msg.campaign_scenario_played_tip({ count: nTimes(playsStat?.total ?? 0) }),
			'',
			false
		)}
		{@render corner(
			succeed,
			msg.campaign_scenario_succeed(),
			`${msg.campaign_scenario_succeed()} ${nTimes(succeed?.total ?? 0)}`,
			resolutionsWith('win'),
			false
		)}
		{@render corner(
			failed,
			msg.campaign_scenario_failed(),
			`${msg.campaign_scenario_failed()} ${nTimes(failed?.total ?? 0)}`,
			resolutionsWith('loss'),
			true
		)}
		{@render cornerExtra?.()}
		{#if neverPlayed}
			<p class="text-primary-400 text-xs italic">{msg.campaign_scenario_never_played()}</p>
		{/if}
	</div>
{/snippet}

{#snippet coverageBlock()}
	<div class="flex flex-wrap items-start gap-x-6 gap-y-2">
		{#if showResolutions}
			<div>
				<SectionLabel>{msg.campaign_scenario_resolutions()}</SectionLabel>
				<ResolutionChips
					ids={resolutionIds}
					visited={new Set(stat?.visited ?? [])}
					tallies={stat?.tallies ?? null}
					{verdicts}
				/>
			</div>
		{/if}
		{#if showVp}
			{@const label = `${rewardHighscoreLabel(vd)} ${rewardUnit(vd, vpBest)}`}
			<div
				role="img"
				aria-label="{label}{vpBreakdown ? ` — ${vpBreakdown}` : ''}"
				class="cursor-default"
				onmouseenter={(e) => tip.show(label, vpBreakdown, e)}
				onmouseleave={tip.hide}
			>
				<SectionLabel>{rewardHighscoreLabel(vd)}</SectionLabel>
				<span
					class="text-secondary-600 dark:text-secondary-400 text-lg leading-none font-bold tabular-nums"
					>{rewardUnit(vd, vpBest)}{#if scenarioMax}<span
							class="text-primary-400 ml-0.5 text-xs font-normal"
							>/ {rewardUnit(vd, scenarioMax)}</span
						>{/if}</span
				>
			</div>
		{/if}
	</div>
{/snippet}

<div class="flex flex-col gap-3">
	{#if hasHeaderLead}
		<div class="flex items-start gap-3">
			{#each headerCards as card, i (i)}
				<CardThumb
					code={card.code}
					src={card.src}
					alt={card.label}
					tone={card.tone}
					objectTop={card.objectTop}
				/>
			{/each}
			{@render headerArt?.()}
			<div class="min-w-0 flex-1">
				{#if location}
					<div class="text-primary-500 text-xs">{location}</div>
				{/if}
				{@render headerMeta?.()}
			</div>
			{#if showCorner}{@render cornerStats()}{/if}
		</div>
		{#if showResolutions || showVp}{@render coverageBlock()}{/if}
	{:else if showResolutions || showVp}
		<div class="flex items-start justify-between gap-3">
			<div class="min-w-0">{@render coverageBlock()}</div>
			{#if showCorner}{@render cornerStats()}{/if}
		</div>
	{:else if showCorner}
		<div class="flex justify-end">{@render cornerStats()}</div>
	{/if}

	{#if empty}
		<WidgetEmpty>{empty}</WidgetEmpty>
	{:else}
		{@render stats?.()}
	{/if}

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
						onmouseenter={(e) => tip.showText(a.text ?? '', e)}
						onmouseleave={tip.hide}
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

	{@render children?.()}
</div>

<HoverTip {tip} markup />
