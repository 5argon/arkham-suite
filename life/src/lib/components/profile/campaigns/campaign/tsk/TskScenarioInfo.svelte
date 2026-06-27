<!--
@component
TSK per-scenario "passport" — a thin TSK-specific wrapper around the shared
`ScenarioInfo` component. It computes TSK's researched reference (the Key at stake and
the Red Coterie member(s) featured — shown as their actual card art — the location, the
time-scaling levels and scenario versions that exist) and the player's record across
their TSK plays (times played, Succeed/Failed, Key won, resolutions reached, victory
display), then hands them to `ScenarioInfo` via props + snippets so every campaign shares
one passport look. The bespoke parts that stay TSK-only are injected through snippets:
the Key/Coterie card art (`headerArt`) and text (`headerMeta`), the "Key won" corner chip
(`cornerExtra`), and the per-version / per-tier breakdown table (`children`).
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getCampaignLog } from '@5argon/arkham-campaign-data';
	import { HoverTooltip } from '@5argon/arkham-life-ui';
	import CardThumb from '$lib/components/profile/_primitives/CardThumb.svelte';
	import * as msg from '$lib/paraglide/messages.js';
	import { difficultyBreakdown, times } from '$lib/campaign/utils/difficulty';
	import {
		resolutionsReachableIn,
		resolutionsReachableInLevel,
		levelHasNoOutcome,
		scenarioCoterie,
		scenarioReference,
		scenarioHasObtainableKey,
		versionTableLabel
	} from '$lib/campaign/campaigns/tsk-solver';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ResolutionTally } from '$lib/campaign/outcomes/resolution-coverage';
	import type { VersionRow } from '$lib/campaign/stats/version-stats';
	import type { CampaignTsk, TskRoute } from '$lib/campaign/campaigns/tsk-profile';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import ScenarioInfo, {
		type CornerStat
	} from '$lib/components/profile/campaigns/campaign/ScenarioInfo.svelte';
	import VersionBreakdown from '$lib/components/profile/campaigns/campaign/VersionBreakdown.svelte';
	import RoutingTrack from '$lib/components/profile/campaigns/campaign/tsk/RoutingTrack.svelte';

	let {
		scenarioId,
		family,
		scenarios,
		tsk,
		achievements,
		hideVariants = false,
		hideAchievements = false,
		logOnly = false,
		extraStats
	}: {
		scenarioId: string;
		family: string | null;
		scenarios: CampaignScenarios | null;
		tsk: CampaignTsk | null;
		achievements: ProfileFamilyAchievement[];
		/** Hide the per-version / per-tier breakdown table (widget config option). */
		hideVariants?: boolean;
		/** Hide the scenario-achievements row (widget config option). */
		hideAchievements?: boolean;
		/** "Log-only mode" — hide the non-log record overlay (forwarded to the shared passport). */
		logOnly?: boolean;
		/** A scenario-specific stats block, rendered in the passport's stat-numbers section. */
		extraStats?: Snippet;
	} = $props();

	const ref = $derived(scenarioReference(scenarioId));

	// Player's generic record for this scenario (across every recorded TSK play).
	const stat = $derived(
		scenarios?.scenarios.find((s) => s.scenario === scenarioId) ?? null
	);
	// "Played" badge: prefer the TSK-authoritative count (plays that recorded the scenario in ANY
	// way — XP, a resolution, or a tier), which the generic XP-only count undershoots whenever a
	// play recorded a resolution but earned no scenario XP (On Thin Ice's "nothing of note in
	// Anchorage" skip). That undershoot let `played` fall below the resolution-derived Failed.
	const tskPlays = $derived(tsk?.scenarioPlays?.[scenarioId] ?? null);
	const plays = $derived(tskPlays?.total ?? stat?.plays ?? 0);
	// Always provided (even at 0) so the passport can show "never played".
	const playsStat = $derived<CornerStat>({
		total: plays,
		byTier: tskPlays?.byTier ?? stat?.playsByTier ?? {}
	});

	// Resolution-derived Succeed vs Failed across plays — shown as corner badges. Only present when
	// at least one play recorded a win/loss resolution (strictly Extra-tab driven).
	const outcome = $derived(tsk?.scenarioOutcomes[scenarioId] ?? null);

	// Scarlet Key won here, resolution-derived (independent of final possession — it can be stolen
	// later). Shown only when this scenario has an obtainable Key AND at least one play recorded a
	// resolution (the evaluator needs it); a player who skipped the Extra tab sees nothing.
	const keyStat = $derived(tsk?.keyObtained[scenarioId] ?? null);
	const showKey = $derived(scenarioHasObtainableKey(scenarioId) && (keyStat?.determinable ?? 0) > 0);
	const keyBreakdown = $derived(difficultyBreakdown(keyStat?.obtained.byTier ?? {}, times));
	const keyTipText = $derived(
		(keyStat?.obtained.total ?? 0) === 0
			? msg.campaign_tsk_info_key_never({ key: ref?.keyName ?? '' })
			: msg.campaign_tsk_info_key_won_tip({
					key: ref?.keyName ?? '',
					count: keyStat?.obtained.total ?? 0
				})
	);
	let keyTipVisible = $state(false);
	let keyTipRef = $state<HTMLElement | null>(null);

	// Available resolutions (campaign-data) + which the player has reached (the scenario stat) —
	// needed here only to seed the per-variant table's reachable-resolution sets.
	const resolutions = $derived.by(() => {
		const log = getCampaignLog(family ?? 'tskc');
		const all = stat?.resolutions.length
			? stat.resolutions
			: (log?.db.scenarioMeta?.find((m) => m.id === scenarioId)?.resolutions ?? []);
		const visited = new Set(stat?.visited ?? []);
		return all.map((r) => ({ id: r, visited: visited.has(r) }));
	});

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
		// Per-variant stats come from the unified `scenarios` record (version rows then tier rows,
		// each carrying its `kind`) — the same shared per-version aggregation every campaign uses.
		// The solver supplies each variant's reachable resolution set + option label; the most-recent
		// matching route is best-effort (only a play that logged this scenario can show one).
		return (stat?.versions ?? []).map((vs): TierRow => {
			const isVersion = vs.kind === 'version';
			const matchKey = isVersion ? 'version' : 'level';
			// Version rows carry a "VERSION" badge, so the label shortens the redundant "Version I" word
			// to the game's "v.I" roman form while keeping its description ("v.I – Deal with Desi …").
			// Tier rows keep their descriptive time-scaling label.
			const label = isVersion
				? (versionTableLabel(scenarioId, vs.value) ?? vs.value)
				: (ref.levels.find((o) => o.id === vs.value)?.label ?? vs.value);
			const matching = byRecent.filter((r) =>
				r.steps.some((s) => s.scenarioId === scenarioId && s[matchKey] === vs.value)
			);
			return {
				kind: isVersion ? 'Version' : 'Tier',
				label,
				runs: vs.plays,
				runsByTier: vs.playsByTier,
				succeed: vs.succeed,
				failed: vs.failed,
				// Versions gate resolutions (e.g. Dogs of War); levels usually don't, except a few
				// final time tiers that force one outcome (e.g. Dead Heat's 25+ tier → R5).
				noOutcome: !isVersion && levelHasNoOutcome(vs.value),
				route: matching[0] ?? null,
				resolutionIds: isVersion
					? resolutionsReachableIn(scenarioId, vs.value, resIds)
					: resolutionsReachableInLevel(vs.value, resIds),
				reached: new Set(Object.keys(vs.tallies)),
				tallies: vs.tallies
			};
		});
	});

	// Render the per-variant table through the shared VersionBreakdown. Each TierRow maps to a
	// VersionRow (kind → badge, runs → plays, the solver's reachable set → resolutionIds); when the
	// scenario has a Succeed/Failed signal those columns show (else Runs). The "Recent Route" column
	// is TSK-only, supplied through the free `extra` snippet keyed by row index.
	const versionRows = $derived<VersionRow[]>(
		tierRows.map((t, i) => ({
			id: String(i),
			label: t.label,
			badge:
				t.kind === 'Version'
					? msg.campaign_tsk_info_kind_version()
					: msg.campaign_tsk_info_kind_tier(),
			plays: { total: t.runs, byTier: t.runsByTier },
			succeed: t.succeed,
			failed: t.failed,
			noOutcome: t.noOutcome,
			resolutionIds: t.resolutionIds,
			reached: t.reached,
			tallies: t.tallies
		}))
	);
	const routeByRow = $derived(new Map(tierRows.map((t, i) => [String(i), t.route])));
</script>

{#if ref}
	<ScenarioInfo
		{scenarioId}
		{family}
		{scenarios}
		{achievements}
		{hideAchievements}
		{logOnly}
		location={ref.location}
		plays={playsStat}
		succeed={outcome?.succeed ?? null}
		failed={outcome?.failed ?? null}
	>
		{#snippet headerArt()}
			<div class="flex shrink-0 gap-2">
				{#if ref?.keyCardCode}
					<CardThumb code={ref.keyCardCode} alt={ref?.keyName ?? ''} />
				{/if}
				{#each coterie as member (member.code)}
					<CardThumb code={member.code} alt={member.name} title={member.name} tone="danger" objectTop />
				{/each}
			</div>
		{/snippet}

		{#snippet headerMeta()}
			{#if ref?.keyName}
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
		{/snippet}

		{#snippet cornerExtra()}
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
		{/snippet}

		{#snippet stats()}
			{@render extraStats?.()}
		{/snippet}

		{#snippet children()}
			<!-- Versions & time tiers the solver knows exist — one row each, with how many of your
			     runs reached this scenario on that tier, the most recent route taken, and the
			     resolutions reachable in that variant. Rendered through the shared VersionBreakdown;
			     the TSK-only "Recent Route" rides its free `extra` column. Hidden by config. -->
			{#snippet routeCell(r: VersionRow)}
				{@const route = routeByRow.get(r.id)}
				{#if route}
					<RoutingTrack steps={route.steps} {family} highlight={scenarioId} size="1.4rem" nowrap />
				{:else}
					<span class="text-primary-400">—</span>
				{/if}
			{/snippet}
			{#if tierRows.length && !hideVariants && !logOnly}
				<div>
					<VersionBreakdown
						rows={versionRows}
						showSucceedFailed={!!outcome}
						showPlays={!outcome}
						versionLabel={msg.campaign_tsk_info_col_variant()}
						playsLabel={msg.campaign_tsk_info_col_runs()}
						extraLabel={msg.campaign_tsk_info_col_recent_route()}
						extra={routeCell}
					/>
				</div>
			{/if}
		{/snippet}
	</ScenarioInfo>

	<HoverTooltip visible={keyTipVisible} referenceElement={keyTipRef}>
		<span class="block max-w-xs py-1 text-xs text-neutral-900 dark:text-neutral-100">
			<span class="font-semibold">{keyTipText}</span>
			{#if keyBreakdown}
				<br />
				<span class="text-neutral-600 dark:text-neutral-300">{keyBreakdown}</span>
			{/if}
		</span>
	</HoverTooltip>
{/if}
