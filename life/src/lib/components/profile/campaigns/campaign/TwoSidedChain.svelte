<!-- @component One run of a two-sided spine: every decision point's icon with the side it leaned (a superscript for weighted marks), dimmed where it leaned neither way. -->
<script lang="ts">
	import type { SideBead } from '$lib/campaign/campaigns/two-sided';
	import {
		IconTrack,
		ScenarioSetIcon,
		type IconTrackItem
	} from '$lib/components/profile/_primitives';
	import type { TwoSidedSpec } from './two-sided';

	let { spec, beads }: { spec: TwoSidedSpec; beads: readonly SideBead[] } = $props();

	interface ChainItem extends IconTrackItem {
		source: string;
		bead: SideBead | undefined;
		abbr: string;
	}
	const items = $derived<ChainItem[]>(
		spec.sources.map((source) => {
			const bead = beads.find((b) => b.scenario === source);
			const side = spec.sides.find((s) => s.key === bead?.side);
			return {
				source,
				bead,
				abbr: side?.abbr ?? '—',
				tooltip: bead ? spec.earned(bead) : `${spec.sourceName(source)} — ${spec.neutral}`,
				dim: !bead,
				tint: side?.tint ?? 'text-primary-300 dark:text-primary-600'
			};
		})
	);
</script>

<IconTrack {items} size="1.4rem" cellWidth="0.9em" gap="0.3em">
	{#snippet icon(it)}
		<ScenarioSetIcon scenarioId={spec.iconScenario(it.source)} />
	{/snippet}
	{#snippet sub(it)}
		<span class="text-[0.7rem] font-bold"
			>{it.abbr}{#if it.bead && it.bead.amount > 1}<sup>{it.bead.amount}</sup>{/if}</span
		>
	{/snippet}
</IconTrack>
