<!--
@component
TSK per-scenario "passport" — the SHARED common area every per-scenario widget
(TskOnThinIce, TskDogsOfWar, …) renders, then layers its own bespoke content
below. Combines the solver's researched reference (the Key at stake and the Red
Coterie member(s) featured — shown as their actual card art — the location, the
time-scaling levels and scenario versions that exist) with the player's record
across their TSK plays (times played, best victory display, resolutions reached,
and — where the cast varies by version, e.g. Dogs of War — the members from the
version they actually recorded). Designed for planning the NEXT run: see what
you've done here and what variety is still unexplored.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getCampaignLog } from '@5argon/arkham-campaign-data';
	import {
		EncounterSetIcon,
		FaIcon,
		FaIconType,
		getCardImagePath,
		HoverTooltip,
		parseArkhamMarkup
	} from '@5argon/arkham-life-ui';
	import { getScenarioData, Scenario } from '@5argon/arkham-kohaku';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievement-aggregate';
	import * as msg from '$lib/paraglide/messages.js';
	import { difficultyBreakdown, times } from '$lib/campaign/difficulty';
	import {
		resolutionsReachableIn,
		resolutionsReachableInLevel,
		levelHasNoOutcome,
		scenarioCoterie,
		scenarioReference,
		scenarioHasObtainableKey
	} from '$lib/campaign/tsk-solver';
	import type { CampaignScenarioXp } from '$lib/campaign/extra-imports';
	import type {
		CampaignResolutionCoverage,
		ResolutionTally
	} from '$lib/campaign/resolution-coverage';
	import type { CampaignTsk, TskRoute } from '$lib/campaign/tsk-profile';
	import ResolutionChips from '$lib/components/profile/campaigns/campaign/ResolutionChips.svelte';
	import CountWithBreakdown from '$lib/components/profile/_primitives/CountWithBreakdown.svelte';
	import WidgetTable, { widgetTableCell } from '$lib/components/profile/_primitives/WidgetTable.svelte';
	import RoutingTrack from '$lib/components/profile/campaigns/campaign/tsk/RoutingTrack.svelte';

	let {
		scenarioId,
		family,
		scenarioXp,
		coverage,
		tsk,
		achievements,
		hideVariants = false,
		hideAchievements = false,
		logOnly = false,
		extraStats
	}: {
		scenarioId: string;
		family: string | null;
		scenarioXp: CampaignScenarioXp[];
		coverage: CampaignResolutionCoverage | null;
		tsk: CampaignTsk | null;
		achievements: ProfileFamilyAchievement[];
		/** Hide the per-version / per-tier breakdown table (widget config option). */
		hideVariants?: boolean;
		/** Hide the scenario-achievements row (widget config option). */
		hideAchievements?: boolean;
		/** "Log-only mode" — hide the non-log record overlay: the corner stats (plays / Succeed /
		 *  Failed / Key won), the resolutions-reached chips, and the per-variant breakdown table. */
		logOnly?: boolean;
		/** A scenario-specific stats block, rendered right after the Succeed/Failed row so a
		 *  bespoke widget (e.g. Dealings' Ece-route counts) groups its numbers with it. */
		extraStats?: Snippet;
	} = $props();

	// Official achievements tagged with THIS scenario (campaign-data `achievement.scenario`),
	// matched to the family's earned state — shown as a row in the passport.
	const scenarioAch = $derived.by(() => {
		if (hideAchievements) return [];
		const log = getCampaignLog(family ?? 'tskc');
		const tagged = new Set(
			(log?.db.achievements ?? []).filter((a) => a.scenario === scenarioId).map((a) => a.id)
		);
		return achievements.filter((a) => tagged.has(a.id));
	});

	const ref = $derived(scenarioReference(scenarioId));

	const KOHAKU = new Set<string>(Object.values(Scenario));
	const iconSet = $derived.by(() => {
		if (!KOHAKU.has(scenarioId)) return null;
		try {
			return getScenarioData(scenarioId as Scenario)?.representativeSet ?? null;
		} catch {
			return null;
		}
	});

	// Player's record for this scenario (across every recorded TSK play).
	const stat = $derived(
		scenarioXp.flatMap((c) => c.scenarios).find((s) => s.scenario === scenarioId) ?? null
	);
	// "Played" badge: prefer the TSK-authoritative count (plays that recorded the scenario in ANY
	// way — XP, a resolution, or a tier), which the generic XP-only count undershoots whenever a
	// play recorded a resolution but earned no scenario XP (On Thin Ice's "nothing of note in
	// Anchorage" skip). That undershoot let `played` fall below the resolution-derived Failed.
	const tskPlays = $derived(tsk?.scenarioPlays?.[scenarioId] ?? null);
	const plays = $derived(tskPlays?.total ?? stat?.plays ?? 0);

	// Scarlet Key won here, resolution-derived (independent of final possession — it can be stolen
	// later). Shown only when this scenario has an obtainable Key AND at least one play recorded a
	// resolution (the evaluator needs it); a player who skipped the Extra tab sees nothing.
	const keyStat = $derived(tsk?.keyObtained[scenarioId] ?? null);
	const showKey = $derived(scenarioHasObtainableKey(scenarioId) && (keyStat?.determinable ?? 0) > 0);
	const keyBreakdown = $derived(difficultyBreakdown(keyStat?.obtained.byTier ?? {}, times));
	const keyTipText = $derived(
		(keyStat?.obtained.total ?? 0) === 0
			? msg.campaign_tsk_info_key_never({ key: ref?.keyName ?? '' })
			: msg.campaign_tsk_info_key_won_tip({ key: ref?.keyName ?? '', count: keyStat?.obtained.total ?? 0 })
	);
	let keyTipVisible = $state(false);
	let keyTipRef = $state<HTMLElement | null>(null);
	// Per-difficulty play breakdown for the "played" badge hover (shared "see by
	// difficulty" feature — same idea as the resolution-chip tooltip).
	const playsBreakdown = $derived(
		difficultyBreakdown(tskPlays?.byTier ?? stat?.playsByTier ?? {}, times)
	);
	let playsTipVisible = $state(false);
	let playsTipRef = $state<HTMLElement | null>(null);

	// One shared tooltip for the achievement row — hovering an achievement shows its description.
	let achTipVisible = $state(false);
	let achTipRef = $state<HTMLElement | null>(null);
	let achTipText = $state('');
	function showAchTip(text: string, e: MouseEvent) {
		achTipText = text;
		achTipRef = e.currentTarget as HTMLElement;
		achTipVisible = true;
	}
	const hideAchTip = () => (achTipVisible = false);

	// Available resolutions (campaign-data) + which the player has reached (coverage).
	const cov = $derived(coverage?.scenarios.find((s) => s.scenario === scenarioId) ?? null);
	const resolutions = $derived.by(() => {
		const log = getCampaignLog(family ?? 'tskc');
		const all =
			cov?.all ?? log?.db.scenarioMeta?.find((m) => m.id === scenarioId)?.resolutions ?? [];
		const visited = new Set(cov?.visited ?? []);
		// Keep `no_resolution` ("None") — every TSK scenario can end without a
		// resolution, and that chip belongs in the set (lit if the player reached it).
		return all.map((r) => ({ id: r, visited: visited.has(r) }));
	});
	const reachedCount = $derived(resolutions.filter((r) => r.visited).length);

	// Resolution-derived Succeed vs Failed across plays — shown as corner badges (not a body
	// StatNumbers row). Each hovers to its per-difficulty breakdown. Only present when at least one
	// play recorded a win/loss resolution (it's strictly Extra-tab driven now).
	const outcome = $derived(tsk?.scenarioOutcomes[scenarioId] ?? null);
	const showOutcome = $derived(!!outcome && outcome.succeed.total + outcome.failed.total > 0);
	const succeedBreakdown = $derived(difficultyBreakdown(outcome?.succeed.byTier ?? {}, times));
	const failedBreakdown = $derived(difficultyBreakdown(outcome?.failed.byTier ?? {}, times));
	let succeedTipVisible = $state(false);
	let succeedTipRef = $state<HTMLElement | null>(null);
	let failedTipVisible = $state(false);
	let failedTipRef = $state<HTMLElement | null>(null);
	/** Every resolution the player has reached across ALL plays (the catch-all set). */
	const visitedAll = $derived(new Set(resolutions.filter((r) => r.visited).map((r) => r.id)));

	// Recorded Extra-tab choices (Dealings' Act 2 Setup, Sanguine Shadows' Targets) are
	// NOT rendered here — each is surfaced by its own per-scenario component, where the
	// campaign-specific moment gets a bespoke (e.g. token-bag art) treatment.

	const keyImg = $derived(ref?.keyCardCode ? getCardImagePath(ref.keyCardCode, 'square') : null);

	// The scenario's Red Coterie member(s), personalized to the version the player
	// recorded (Dogs of War's cast changes with the version; elsewhere it's fixed).
	const recordedVersion = $derived.by(() => {
		const byRecent = [...(tsk?.routes ?? [])].sort(
			(a, b) => (b.finishDate ?? 0) - (a.finishDate ?? 0)
		);
		for (const r of byRecent) {
			const step = r.steps.find((s) => s.scenarioId === scenarioId && s.version);
			if (step?.version) return step.version;
		}
		return null;
	});
	const coterie = $derived(scenarioCoterie(scenarioId, recordedVersion));
	const coterieArt = $derived(
		coterie.map((m) => ({ ...m, img: getCardImagePath(m.code, 'square') }))
	);

	// One row per version / time-tier this scenario offers: how many of your runs
	// (won or lost) reached it on that tier, the most recent such route (this
	// scenario highlighted — so you see what you did before and after), and the
	// resolutions reachable in that variant (lit when you've reached them). Only a
	// version-gating scenario (Dogs of War) actually narrows the resolution set;
	// elsewhere every variant lists the scenario's full resolution set.
	interface TierRow {
		kind: 'Version' | 'Tier';
		label: string;
		runs: number;
		/** Per-difficulty run counts for this variant — drives the Runs hover. */
		runsByTier: Record<string, number>;
		/** This variant's Succeed/Failed split (null when the scenario has no outcome signal) —
		 *  shown instead of Runs when present; succeed + failed ≤ runs (some plays indeterminate). */
		succeed: ResolutionTally | null;
		failed: ResolutionTally | null;
		/** This tier SKIPS the scenario (no win/loss applies) — its Succeed/Failed cells stay blank
		 *  rather than showing "—" (e.g. Dead Heat's 25+ time tier). */
		noOutcome: boolean;
		route: TskRoute | null;
		/** Resolutions reachable in this variant (the dim base set). */
		resolutionIds: string[];
		/** Of those, the ones reached on a play that recorded THIS variant (lit). */
		reached: ReadonlySet<string>;
		/** Per-resolution reach tally for this variant — drives the hover breakdown. */
		tallies: Record<string, ResolutionTally>;
	}
	const tierRows = $derived.by((): TierRow[] => {
		if (!ref) return [];
		const resIds = resolutions.map((r) => r.id);
		const byRecent = [...(tsk?.routes ?? [])].sort(
			(a, b) => (b.finishDate ?? 0) - (a.finishDate ?? 0)
		);
		const variants = tsk?.scenarioVariantTallies[scenarioId] ?? {};
		const variantPlays = tsk?.scenarioVariantPlays[scenarioId] ?? {};
		const variantOutcomes = tsk?.scenarioVariantOutcomes[scenarioId] ?? {};
		const build = (
			opts: { id: string; label: string }[],
			kind: 'Version' | 'Tier',
			matchKey: 'version' | 'level'
		): TierRow[] =>
			opts.map((o) => {
				const matching = byRecent.filter((r) =>
					r.steps.some((s) => s.scenarioId === scenarioId && s[matchKey] === o.id)
				);
				// Versions gate resolutions (e.g. Dogs of War); levels usually don't, except a
				// few final time tiers that force one outcome (e.g. Dead Heat's 25+ tier → R5).
				const reachable =
					matchKey === 'version'
						? resolutionsReachableIn(scenarioId, o.id, resIds)
						: resolutionsReachableInLevel(o.id, resIds);
				// Light/credit only resolutions reached on a play that recorded this variant.
				const tallies = variants[o.id] ?? {};
				return {
					kind,
					label: o.label,
					// Runs = plays that recorded this tier (authoritative), so a lit resolution
					// always has a matching count even when that play logged no route. The route
					// itself is best-effort: only a play that logged this scenario can show one.
					runs: variantPlays[o.id]?.total ?? matching.length,
					runsByTier: variantPlays[o.id]?.byTier ?? {},
					succeed: variantOutcomes[o.id]?.succeed ?? null,
					failed: variantOutcomes[o.id]?.failed ?? null,
					noOutcome: matchKey === 'level' && levelHasNoOutcome(o.id),
					route: matching[0] ?? null,
					resolutionIds: reachable,
					reached: new Set(Object.keys(tallies)),
					tallies
				};
			});
		return [...build(ref.versions, 'Version', 'version'), ...build(ref.levels, 'Tier', 'level')];
	});

	// When the scenario has a log-derived Succeed/Failed signal, the per-variant table swaps its
	// single Runs column for Succeed + Failed (which sum to that row's runs, minus indeterminate
	// plays); otherwise it keeps Runs.
	const tierColumns = $derived(
		outcome
			? [
					{ label: msg.campaign_tsk_info_col_variant() },
					{ label: msg.campaign_tsk_info_outcome_succeed() },
					{ label: msg.campaign_tsk_info_outcome_failed() },
					{ label: msg.campaign_tsk_info_col_recent_route() },
					{ label: msg.campaign_tsk_info_col_resolutions() }
				]
			: [
					{ label: msg.campaign_tsk_info_col_variant() },
					{ label: msg.campaign_tsk_info_col_runs() },
					{ label: msg.campaign_tsk_info_col_recent_route() },
					{ label: msg.campaign_tsk_info_col_resolutions() }
				]
	);
</script>

{#if ref}
	<div class="flex flex-col gap-3">
		<!-- Header: Key art + Red Coterie member art + scenario identity -->
		<div class="flex items-start gap-3">
			<div class="flex shrink-0 gap-2">
				{#if keyImg}
					<img
						src={keyImg}
						alt={ref.keyName}
						class="border-primary-300 dark:border-primary-600 h-16 w-16 rounded border object-cover shadow"
						loading="lazy"
					/>
				{/if}
				{#each coterieArt as m (m.code)}
					<img
						src={m.img}
						alt={m.name}
						title={m.name}
						class="border-error-300 dark:border-error-700 h-16 w-16 rounded border object-cover object-top shadow"
						loading="lazy"
					/>
				{/each}
			</div>
			<div class="min-w-0 flex-1">
				<div class="flex items-center gap-2">
					{#if iconSet}
						<span class="text-primary-700 dark:text-primary-300 text-lg leading-none">
							<EncounterSetIcon encounterSet={iconSet} />
						</span>
					{/if}
					<span class="text-base font-bold text-black dark:text-white">{ref.title}</span>
					{#if ref.location}
						<span class="text-primary-500 text-xs">· {ref.location}</span>
					{/if}
				</div>
				{#if ref.keyName}
					<p class="text-primary-600 dark:text-primary-300 mt-0.5 text-xs">
						{msg.campaign_tsk_info_key()} <span class="font-semibold">{ref.keyName}</span>
					</p>
				{/if}
				{#if coterie.length}
					<p class="text-primary-600 dark:text-primary-300 mt-0.5 text-xs">
						{msg.campaign_tsk_info_red_coterie()}
						<span class="font-semibold">{coterie.map((m) => m.name).join(' · ')}</span>
					</p>
				{/if}
			</div>
			<!-- Corner stats: plays + Succeed/Failed + Key won (each hovers to its difficulty breakdown). -->
			<div class="flex shrink-0 flex-wrap items-start justify-end gap-x-4 gap-y-1 text-right">
				{#if !logOnly && plays > 0}
					<div
						role="img"
						aria-label="{msg.campaign_tsk_info_played_tip({
							count: times(plays)
						})}{playsBreakdown ? ` — ${playsBreakdown}` : ''}"
						class="cursor-default"
						onmouseenter={(e) => {
							playsTipRef = e.currentTarget as HTMLElement;
							playsTipVisible = true;
						}}
						onmouseleave={() => (playsTipVisible = false)}
					>
						<p class="text-secondary-600 dark:text-secondary-400 text-lg font-bold tabular-nums">
							×{plays}
						</p>
						<p class="text-primary-500 text-[0.65rem]">{msg.campaign_tsk_info_played()}</p>
					</div>
					{#if showOutcome}
						<div
							role="img"
							aria-label="{msg.campaign_tsk_info_outcome_succeed()} ×{outcome?.succeed.total ?? 0}{succeedBreakdown ? ` — ${succeedBreakdown}` : ''}"
							class="cursor-default"
							onmouseenter={(e) => {
								succeedTipRef = e.currentTarget as HTMLElement;
								succeedTipVisible = true;
							}}
							onmouseleave={() => (succeedTipVisible = false)}
						>
							<p class="text-secondary-600 dark:text-secondary-400 text-lg font-bold tabular-nums">
								×{outcome?.succeed.total ?? 0}
							</p>
							<p class="text-primary-500 text-[0.65rem]">{msg.campaign_tsk_info_outcome_succeed()}</p>
						</div>
						<div
							role="img"
							aria-label="{msg.campaign_tsk_info_outcome_failed()} ×{outcome?.failed.total ?? 0}{failedBreakdown ? ` — ${failedBreakdown}` : ''}"
							class="cursor-default"
							onmouseenter={(e) => {
								failedTipRef = e.currentTarget as HTMLElement;
								failedTipVisible = true;
							}}
							onmouseleave={() => (failedTipVisible = false)}
						>
							<p class="text-primary-700 dark:text-primary-300 text-lg font-bold tabular-nums">
								×{outcome?.failed.total ?? 0}
							</p>
							<p class="text-primary-500 text-[0.65rem]">{msg.campaign_tsk_info_outcome_failed()}</p>
						</div>
					{/if}
					{#if showKey}
						<div
							role="img"
							aria-label="{keyTipText}{keyBreakdown ? ` — ${keyBreakdown}` : ''}"
							class="cursor-default"
							onmouseenter={(e) => {
								keyTipRef = e.currentTarget as HTMLElement;
								keyTipVisible = true;
							}}
							onmouseleave={() => (keyTipVisible = false)}
						>
							<p class="text-lg font-bold tabular-nums text-black dark:text-white">
								<i class="fa-solid fa-key text-secondary-500"></i> ×{keyStat?.obtained.total ?? 0}
							</p>
							<p class="text-primary-500 text-[0.65rem]">{msg.campaign_tsk_info_key_won()}</p>
						</div>
					{/if}
				{:else if !logOnly}
					<p class="text-primary-400 text-xs italic">{msg.campaign_tsk_info_never_played()}</p>
				{/if}
			</div>
		</div>

		<!-- Resolutions reached across ALL plays (the catch-all — shown whether or not a
		     specific variant was recorded in the Extra tab). Hidden under Log-only (which
		     resolutions a player REACHED is resolution-derived = Extra). -->
		{#if resolutions.length && !logOnly}
			<div>
				<p class="text-primary-500 mb-1 text-xs font-medium">{msg.campaign_tsk_info_resolutions()}</p>
				<ResolutionChips
					ids={resolutions.map((r) => r.id)}
					visited={visitedAll}
					tallies={cov?.tallies ?? null}
				/>
			</div>
		{/if}


		<!-- A bespoke widget's own stats, grouped with the Succeed/Failed numbers above. -->
		{@render extraStats?.()}

		<!-- Official achievements tagged with this scenario (lit when earned). May duplicate the
		     Achievements widget by design; hidden via the widget's config. -->
		{#if scenarioAch.length}
			<div>
				<p class="text-primary-500 mb-1 text-xs font-medium">{msg.campaign_tsk_info_achievements()}</p>
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

		<!-- Versions & time tiers the solver knows exist — one row each, with how many
		     of your runs reached this scenario on that tier, the most recent route
		     taken, and the resolutions reachable in that variant. Hidden by config. -->
		{#if tierRows.length && !hideVariants && !logOnly}
			<div>
				<WidgetTable
					columns={tierColumns}
					rows={tierRows}
					key={(_, i) => i}
				>
					{#snippet row(r)}
						<td class="{widgetTableCell} text-black dark:text-white">
							<span class="text-primary-400 mr-1 text-[0.6rem] tracking-wide uppercase"
								>{r.kind === 'Version' ? msg.campaign_tsk_info_kind_version() : msg.campaign_tsk_info_kind_tier()}</span
							>
							{r.label}
						</td>
						{#if outcome}
							<td class="{widgetTableCell} tabular-nums">
								{#if r.noOutcome}<!-- skip tier: no win/loss applies -->
								{:else if r.succeed && r.succeed.total > 0}
									<CountWithBreakdown
										value="×{r.succeed.total}"
										byTier={r.succeed.byTier}
										class="text-secondary-700 dark:text-secondary-300 font-semibold"
									/>
								{:else}
									<span class="text-primary-400">—</span>
								{/if}
							</td>
							<td class="{widgetTableCell} tabular-nums">
								{#if r.noOutcome}<!-- skip tier: no win/loss applies -->
								{:else if r.failed && r.failed.total > 0}
									<CountWithBreakdown
										value="×{r.failed.total}"
										byTier={r.failed.byTier}
										class="text-primary-700 dark:text-primary-300 font-semibold"
									/>
								{:else}
									<span class="text-primary-400">—</span>
								{/if}
							</td>
						{:else}
							<td class="{widgetTableCell} tabular-nums">
								{#if r.runs > 0}
									<CountWithBreakdown
										value="×{r.runs}"
										byTier={r.runsByTier}
										class="text-secondary-700 dark:text-secondary-300 font-semibold"
									/>
								{:else}
									<span class="text-primary-400">—</span>
								{/if}
							</td>
						{/if}
						<td class="{widgetTableCell} whitespace-nowrap">
							{#if r.route}
								<RoutingTrack steps={r.route.steps} {family} highlight={scenarioId} size="1.4rem" nowrap />
							{:else}
								<span class="text-primary-400">—</span>
							{/if}
						</td>
						<td class="{widgetTableCell} whitespace-nowrap">
							{#if r.resolutionIds.length}
								<ResolutionChips ids={r.resolutionIds} visited={r.reached} tallies={r.tallies} nowrap />
							{:else}
								<span class="text-primary-400">—</span>
							{/if}
						</td>
					{/snippet}
				</WidgetTable>
			</div>
		{/if}
	</div>

	<HoverTooltip visible={playsTipVisible} referenceElement={playsTipRef}>
		<span class="block py-1 text-xs text-neutral-900 dark:text-neutral-100">
			<span class="font-semibold">{msg.campaign_tsk_info_played_tip({ count: times(plays) })}</span>
			{#if playsBreakdown}
				<br />
				<span class="text-neutral-600 dark:text-neutral-300">{playsBreakdown}</span>
			{/if}
		</span>
	</HoverTooltip>

	<HoverTooltip visible={keyTipVisible} referenceElement={keyTipRef}>
		<span class="block max-w-xs py-1 text-xs text-neutral-900 dark:text-neutral-100">
			<span class="font-semibold">{keyTipText}</span>
			{#if keyBreakdown}
				<br />
				<span class="text-neutral-600 dark:text-neutral-300">{keyBreakdown}</span>
			{/if}
		</span>
	</HoverTooltip>

	<HoverTooltip visible={succeedTipVisible} referenceElement={succeedTipRef}>
		<span class="block py-1 text-xs text-neutral-900 dark:text-neutral-100">
			<span class="font-semibold">{msg.campaign_tsk_info_outcome_succeed()} {times(outcome?.succeed.total ?? 0)}</span>
			{#if succeedBreakdown}
				<br />
				<span class="text-neutral-600 dark:text-neutral-300">{succeedBreakdown}</span>
			{/if}
		</span>
	</HoverTooltip>

	<HoverTooltip visible={failedTipVisible} referenceElement={failedTipRef}>
		<span class="block py-1 text-xs text-neutral-900 dark:text-neutral-100">
			<span class="font-semibold">{msg.campaign_tsk_info_outcome_failed()} {times(outcome?.failed.total ?? 0)}</span>
			{#if failedBreakdown}
				<br />
				<span class="text-neutral-600 dark:text-neutral-300">{failedBreakdown}</span>
			{/if}
		</span>
	</HoverTooltip>

	<HoverTooltip visible={achTipVisible} referenceElement={achTipRef}>
		<span class="block max-w-xs py-1 text-xs text-neutral-700 dark:text-neutral-200"
			>{@html parseArkhamMarkup(achTipText)}</span
		>
	</HoverTooltip>
{/if}
