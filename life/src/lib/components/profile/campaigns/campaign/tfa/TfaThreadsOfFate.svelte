<!--
@component
TFA flagship — "Threads of Fate", the campaign's great branch, drawn as a map of its decision nodes
in narrative order: the Relic (to Alejandro's museum or hidden with Harlan) · Ichtaca's confrontation
(you stopped her or let her go) · her trust (bonded or left in the dark) · Alejandro's fate (rescued
or missing) · and your path — forging your own opens the secret Turn Back Time finale (highlighted).
Each node lights to the choice you made most, hovering to the full split. Built on IconTrack, wrapped
in the shared TFA passport (three-thread header art: the Relic, Ichtaca, Alejandro).
-->
<script lang="ts">
	import {
		TFA_RELIC_CODE,
		TFA_ICHTACA_CODE,
		TFA_ALEJANDRO_CODE,
		type CampaignTfa
	} from '$lib/campaign/campaigns/tfa';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import TfaScenarioInfo from './TfaScenarioInfo.svelte';
	import CardThumb from '$lib/components/profile/_primitives/CardThumb.svelte';
	import IconTrack, { type IconTrackItem } from '$lib/components/profile/_primitives/IconTrack.svelte';
	import SectionLabel from '$lib/components/profile/_primitives/SectionLabel.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let {
		tfa,
		family = null,
		achievements = [],
		scenarios = null,
		logOnly = false
	}: {
		tfa: CampaignTfa | null;
		family?: string | null;
		achievements?: ProfileFamilyAchievement[];
		scenarios?: CampaignScenarios | null;
		logOnly?: boolean;
	} = $props();

	const t = $derived(tfa?.threadsOfFate);
	const ich = $derived(tfa?.ichtaca);
	// The Ichtaca-confrontation lean is an Extra-tab input — hidden in Log-only mode (the node then
	// renders as the neutral "○" so the five-node book-order map keeps its shape).
	const ichtacaStop = $derived(logOnly ? 0 : (t?.listenedIchtaca ?? 0));
	const ichtacaLeave = $derived(logOnly ? 0 : (t?.letHerLeave ?? 0));
	const hasData = $derived(
		!!t &&
			t.relicToAlejandro +
				t.relicToHarlan +
				ichtacaStop +
				ichtacaLeave +
				(ich?.bond ?? 0) +
				(ich?.inTheDark ?? 0) +
				t.rescuedAlejandro +
				t.alejandroMissing +
				t.forgingOwnPath >
				0
	);

	interface BranchCell extends IconTrackItem {
		glyph: string;
		sub: string;
	}
	const NEUTRAL = 'text-primary-300 dark:text-primary-600';
	// A two-sided node: light the side chosen more often; hover shows both counts.
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
			return { glyph: '○', sub: '—', dim: true, tint: NEUTRAL, tooltip: `${node} — ${m.campaign_tfa_branch_none()}` };
		const a = aCount >= bCount;
		return {
			glyph: '●',
			sub: a ? aLabel : bLabel,
			tint: a ? aTint : bTint,
			tooltip: m.campaign_tfa_branch_tip({ node, a: aLabel, ac: aCount, b: bLabel, bc: bCount })
		};
	}
	const GOLD = 'text-amber-600 dark:text-amber-400';
	const BLUE = 'text-sky-600 dark:text-sky-400';
	const GREEN = 'text-emerald-600 dark:text-emerald-400';
	const VIOLET = 'text-violet-600 dark:text-violet-400';
	const FORGE = 'text-fuchsia-600 dark:text-fuchsia-400';

	const nodes = $derived<BranchCell[]>(
		t
			? [
					fork(
						m.campaign_tfa_branch_relic_node(),
						t.relicToAlejandro,
						m.campaign_tfa_branch_relic_a(),
						GOLD,
						t.relicToHarlan,
						m.campaign_tfa_branch_relic_b(),
						BLUE
					),
					fork(
						m.campaign_tfa_branch_ichtaca_node(),
						ichtacaStop,
						m.campaign_tfa_branch_ichtaca_a(),
						GREEN,
						ichtacaLeave,
						m.campaign_tfa_branch_ichtaca_b(),
						VIOLET
					),
					fork(
						m.campaign_tfa_branch_bond_node(),
						ich?.bond ?? 0,
						m.campaign_tfa_branch_bond_a(),
						GREEN,
						ich?.inTheDark ?? 0,
						m.campaign_tfa_branch_bond_b(),
						VIOLET
					),
					fork(
						m.campaign_tfa_branch_alejandro_node(),
						t.rescuedAlejandro,
						m.campaign_tfa_branch_alejandro_a(),
						GREEN,
						t.alejandroMissing,
						m.campaign_tfa_branch_alejandro_b(),
						VIOLET
					),
					t.forgingOwnPath > 0
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
				]
			: []
	);
</script>

<TfaScenarioInfo scenarioId="threads_of_fate" {family} {achievements} {scenarios} {logOnly}>
	{#snippet headerArt()}
		<div class="flex shrink-0 gap-2">
			<CardThumb code={TFA_RELIC_CODE} alt={m.campaign_tfa_branch_relic_node()} objectTop />
			<CardThumb code={TFA_ICHTACA_CODE} alt={m.campaign_tfa_companion_ichtaca()} objectTop />
			<CardThumb code={TFA_ALEJANDRO_CODE} alt={m.campaign_tfa_companion_alejandro()} objectTop />
		</div>
	{/snippet}
	{#snippet stats()}
		{#if hasData}
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
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_tfa_threads_empty()}</p>
		{/if}
	{/snippet}
</TfaScenarioInfo>
