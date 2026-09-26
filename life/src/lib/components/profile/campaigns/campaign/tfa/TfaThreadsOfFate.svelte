<!-- @component Threads of Fate: each decision node in book order, lit to the side chosen most; forging your own path opens Turn Back Time. -->
<script lang="ts">
	import type { CampaignTfa } from '$lib/campaign/campaigns/tfa';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { IconTrack, SectionLabel, type IconTrackItem } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioInfo from '../ScenarioInfo.svelte';
	import { TFA_CARD } from './tfa-shared';

	let { blob: tfa, ctx }: CampaignWidgetProps<CampaignTfa> = $props();

	interface BranchCell extends IconTrackItem {
		glyph: string;
		sub: string;
	}

	const NEUTRAL = 'text-primary-300 dark:text-primary-600';
	const GOLD = 'text-amber-600 dark:text-amber-400';
	const BLUE = 'text-sky-600 dark:text-sky-400';
	const GREEN = 'text-emerald-600 dark:text-emerald-400';
	const VIOLET = 'text-violet-600 dark:text-violet-400';
	const FORGE = 'text-fuchsia-600 dark:text-fuchsia-400';

	/** A two-sided node lit to the side chosen more often; the hover shows both counts. */
	function fork(
		node: string,
		aCount: number,
		aLabel: string,
		aTint: string,
		bCount: number,
		bLabel: string,
		bTint: string
	): BranchCell {
		if (aCount + bCount === 0)
			return {
				glyph: '○',
				sub: '—',
				dim: true,
				tint: NEUTRAL,
				tooltip: `${node} — ${m.campaign_tfa_branch_none()}`
			};
		const a = aCount >= bCount;
		return {
			glyph: '●',
			sub: a ? aLabel : bLabel,
			tint: a ? aTint : bTint,
			tooltip: m.campaign_tfa_branch_tip({ node, a: aLabel, ac: aCount, b: bLabel, bc: bCount })
		};
	}

	const t = $derived(tfa?.threadsOfFate);
	// The confrontation is an Extra input; in log-only mode its node stays neutral so the map keeps its shape.
	const stopped = $derived(ctx.logOnly ? 0 : (t?.listenedIchtaca ?? 0));
	const letGo = $derived(ctx.logOnly ? 0 : (t?.letHerLeave ?? 0));
	const nodes = $derived<BranchCell[]>([
		fork(
			m.campaign_tfa_branch_relic_node(),
			t?.relicToAlejandro ?? 0,
			m.campaign_tfa_branch_relic_a(),
			GOLD,
			t?.relicToHarlan ?? 0,
			m.campaign_tfa_branch_relic_b(),
			BLUE
		),
		fork(
			m.campaign_tfa_branch_ichtaca_node(),
			stopped,
			m.campaign_tfa_branch_ichtaca_a(),
			GREEN,
			letGo,
			m.campaign_tfa_branch_ichtaca_b(),
			VIOLET
		),
		fork(
			m.campaign_tfa_branch_bond_node(),
			tfa?.ichtaca.bond ?? 0,
			m.campaign_tfa_branch_bond_a(),
			GREEN,
			tfa?.ichtaca.inTheDark ?? 0,
			m.campaign_tfa_branch_bond_b(),
			VIOLET
		),
		fork(
			m.campaign_tfa_branch_alejandro_node(),
			tfa?.alejandro.rescued ?? 0,
			m.campaign_tfa_branch_alejandro_a(),
			GREEN,
			tfa?.alejandro.missing ?? 0,
			m.campaign_tfa_branch_alejandro_b(),
			VIOLET
		),
		t?.forgingOwnPath
			? {
					glyph: '★',
					sub: m.campaign_tfa_branch_path_forge(),
					tint: FORGE,
					tooltip: m.campaign_tfa_branch_forge_tip({ n: t.forgingOwnPath })
				}
			: {
					glyph: '○',
					sub: m.campaign_tfa_branch_path_stay(),
					dim: true,
					tint: NEUTRAL,
					tooltip: m.campaign_tfa_branch_path_stay_tip()
				}
	]);
	const decided = $derived(nodes.some((n) => !n.dim));
</script>

<ScenarioInfo
	{ctx}
	showPlays
	headerCards={[TFA_CARD.relic, TFA_CARD.ichtaca, TFA_CARD.alejandro]}
	empty={decided ? null : m.campaign_tfa_threads_empty()}
>
	{#snippet stats()}
		<div>
			<SectionLabel align="center">{m.campaign_tfa_branch_label()}</SectionLabel>
			<div class="flex justify-center">
				<IconTrack items={nodes} size="1.2rem" cellWidth="5.5em" wrap>
					{#snippet icon(it)}
						<span class="text-lg leading-none">{it.glyph}</span>
					{/snippet}
					{#snippet sub(it)}
						<span class="text-[0.7rem]">{it.sub}</span>
					{/snippet}
				</IconTrack>
			</div>
		</div>
	{/snippet}
</ScenarioInfo>
