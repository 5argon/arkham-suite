<!-- @component A TSK scenario passport: the Key at stake and the Coterie cast, Keys won, and a per-variant table with each variant's most recent route. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { CampaignTsk } from '$lib/campaign/campaigns/tsk/profile';
	import { levelHasNoOutcome, resolutionsReachableInLevel } from '$lib/campaign/campaigns/tsk/rules';
	import {
		resolutionsReachableIn,
		scenarioCoterie,
		scenarioReference,
		versionTableLabel
	} from '$lib/campaign/campaigns/tsk/solver';
	import { toVersionRow, type VersionRow } from '$lib/campaign/stats/version-stats';
	import { difficultyBreakdown } from '$lib/campaign/utils/difficulty';
	import { scenarioMeta } from '$lib/campaign/utils/scenario-meta';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { HoverTip, HoverTipState } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioInfo, { type HeaderCard } from '../ScenarioInfo.svelte';
	import VersionBreakdown from '../VersionBreakdown.svelte';
	import RoutingTrack from './RoutingTrack.svelte';

	let {
		blob: tsk,
		ctx,
		stats,
		children: below
	}: CampaignWidgetProps<CampaignTsk> & { stats?: Snippet; children?: Snippet } = $props();

	const scenarioId = $derived(ctx.scenario ?? '');
	const ref = $derived(scenarioReference(scenarioId));
	const stat = $derived(ctx.scenarios?.scenarios.find((s) => s.scenario === scenarioId) ?? null);
	const hasOutcome = $derived(!!(stat?.succeed || stat?.failed));
	const coterie = $derived(scenarioCoterie(scenarioId, tsk?.recentVersion[scenarioId]));
	const headerCards = $derived<HeaderCard[]>([
		...(ref?.keyCardCode ? [{ code: ref.keyCardCode, label: ref.keyName }] : []),
		...coterie.map((c): HeaderCard => ({ code: c.code, tone: 'danger', objectTop: true }))
	]);

	const keyStat = $derived(tsk?.keyObtained[scenarioId] ?? null);
	const keyTip = $derived(
		keyStat?.obtained.total
			? m.campaign_tsk_info_key_won_tip({ key: ref?.keyName ?? '', count: keyStat.obtained.total })
			: m.campaign_tsk_info_key_never({ key: ref?.keyName ?? '' })
	);
	const tip = new HoverTipState();

	const variantRows = $derived.by((): VersionRow[] => {
		if (!ref) return [];
		const resolutionIds = stat?.resolutions.length
			? stat.resolutions
			: (scenarioMeta(ctx.family, scenarioId)?.resolutions ?? []);
		return (stat?.versions ?? []).map((vs) => {
			const isVersion = vs.kind === 'version';
			return {
				...toVersionRow(vs, {
					label: isVersion
						? (versionTableLabel(scenarioId, vs.value) ?? vs.value)
						: (ref.levels.find((o) => o.id === vs.value)?.label ?? vs.value),
					badge: isVersion ? m.campaign_tsk_info_kind_version() : m.campaign_tsk_info_kind_tier(),
					resolutionIds: isVersion
						? resolutionsReachableIn(scenarioId, vs.value, resolutionIds)
						: resolutionsReachableInLevel(vs.value, resolutionIds)
				}),
				noOutcome: !isVersion && levelHasNoOutcome(vs.value)
			};
		});
	});
	const showVariants = $derived(variantRows.length > 0 && ctx.config.hideVariants !== true && !ctx.logOnly);
</script>

{#snippet routeCell(r: VersionRow)}
	<RoutingTrack route={tsk?.variantRoutes[scenarioId]?.[r.id] ?? null} highlight={scenarioId} nowrap />
{/snippet}

{#if ref}
	<ScenarioInfo {ctx} location={ref.location} {headerCards} showPlays {stats}>
		{#snippet headerMeta()}
			{#if ref.keyName}
				<p class="text-primary-600 dark:text-primary-300 mt-0.5 text-xs">
					{m.campaign_tsk_info_key()} <span class="font-semibold">{ref.keyName}</span>
				</p>
			{/if}
			{#if coterie.length}
				<p class="text-primary-600 dark:text-primary-300 mt-0.5 text-xs">
					{m.campaign_tsk_info_red_coterie()}
					<span class="font-semibold">{coterie.map((c) => c.name).join(' · ')}</span>
				</p>
			{/if}
		{/snippet}

		{#snippet cornerExtra()}
			{#if keyStat}
				{@const breakdown = difficultyBreakdown(keyStat.obtained.byTier)}
				<div
					role="img"
					aria-label="{keyTip}{breakdown ? ` — ${breakdown}` : ''}"
					class="cursor-default"
					onmouseenter={(e) => tip.show(keyTip, breakdown, e)}
					onmouseleave={tip.hide}
				>
					<p class="text-lg font-bold text-black tabular-nums dark:text-white">
						<i class="fa-solid fa-key text-secondary-500"></i> ×{keyStat.obtained.total}
					</p>
					<p class="text-primary-500 text-[0.65rem]">{m.campaign_tsk_info_key_won()}</p>
				</div>
			{/if}
		{/snippet}

		{#if showVariants}
			<VersionBreakdown
				rows={variantRows}
				showSucceedFailed={hasOutcome}
				showPlays={!hasOutcome}
				versionLabel={m.campaign_tsk_info_col_variant()}
				playsLabel={m.campaign_tsk_info_col_runs()}
				extraLabel={m.campaign_tsk_info_col_recent_route()}
				extra={routeCell}
			/>
		{/if}
		{@render below?.()}
	</ScenarioInfo>
	<HoverTip {tip} />
{/if}
