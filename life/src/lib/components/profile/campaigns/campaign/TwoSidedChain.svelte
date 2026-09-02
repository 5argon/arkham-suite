<!--
@component
A two-sided campaign spine as an icon track: every decision point in book order, each drawn as its
encounter-set icon with the side's letter beneath (a superscript for weighted marks), dimmed where
the run took no side. Hover names the decision. Shared by the PtC Doubt/Conviction chain and the
TCU Lodge/Coven chain, which supply the labels.
-->
<script lang="ts" module>
	export interface ChainBead {
		scenario: string;
		side: string;
		amount: number;
	}
	export interface ChainSide {
		abbr: string;
		tint: string;
	}
</script>

<script lang="ts" generics="B extends ChainBead">
	import type { EncounterSet } from '@5argon/arkham-kohaku';
	import IconTrack, {
		type IconTrackItem
	} from '$lib/components/profile/_primitives/IconTrack.svelte';
	import ScenarioSetIcon from '$lib/components/profile/_primitives/ScenarioSetIcon.svelte';

	let {
		beads,
		sources,
		sides,
		iconSet,
		scenarioName,
		earnedTitle,
		neutralLabel,
		size = '1.4rem'
	}: {
		beads: B[];
		/** Decision points in book order; every one renders, earned or not. */
		sources: readonly string[];
		sides: Record<string, ChainSide>;
		iconSet: (scenario: string) => EncounterSet | null;
		scenarioName: (scenario: string) => string;
		/** Tooltip for an earned bead. */
		earnedTitle: (bead: B) => string;
		/** Tooltip suffix for a decision the run took no side at ("<scenario> — <neutralLabel>"). */
		neutralLabel: string;
		size?: string;
	} = $props();

	const initials = (scenario: string) =>
		scenario
			.split('_')
			.filter((w) => !['of', 'the', 's', 'a'].includes(w))
			.slice(0, 2)
			.map((w) => w[0]?.toUpperCase() ?? '')
			.join('');

	const byScenario = $derived(new Map(beads.map((b) => [b.scenario, b] as const)));

	interface ChainItem extends IconTrackItem {
		bead: B | undefined;
		iconSet: EncounterSet | null;
		fallback: string;
	}
	const items = $derived<ChainItem[]>(
		sources.map((scenario) => {
			const bead = byScenario.get(scenario);
			return {
				bead,
				iconSet: iconSet(scenario),
				fallback: initials(scenario),
				tooltip: bead ? earnedTitle(bead) : `${scenarioName(scenario)} — ${neutralLabel}`,
				dim: !bead,
				tint: bead ? sides[bead.side]?.tint : 'text-primary-300 dark:text-primary-600'
			};
		})
	);
</script>

<IconTrack {items} {size} cellWidth="0.9em" gap="0.3em">
	{#snippet icon(it)}
		<ScenarioSetIcon iconSet={it.iconSet} fallback={it.fallback} />
	{/snippet}
	{#snippet sub(it)}
		<span class="text-[0.7rem] font-bold">
			{#if it.bead}{sides[it.bead.side]?.abbr}{#if it.bead.amount > 1}<sup
						>{it.bead.amount}</sup
					>{/if}{:else}—{/if}
		</span>
	{/snippet}
</IconTrack>
