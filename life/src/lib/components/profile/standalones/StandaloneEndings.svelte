<!-- @component A standalone scenario's endings: each one's face, card, resolution and how many plays reached it. -->
<script lang="ts">
	import type { StandaloneRules } from '$lib/campaign/standalones/rules';
	import type { Tally } from '$lib/campaign/utils/tally';
	import { emptyTally } from '$lib/campaign/utils/tally';
	import { WidgetEmpty } from '$lib/components/profile/_primitives';
	import EndingsGrid from '$lib/components/profile/campaigns/campaign/EndingsGrid.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { standaloneText } from './side/text';

	let { rules, tallies }: { rules: StandaloneRules | null; tallies: Record<string, Tally> | null } =
		$props();

	const endings = $derived(
		(rules?.endings ?? []).map((r) => ({
			kind: r.kind,
			label: standaloneText(`standalone_${rules?.prefix}_ending_${r.id}`),
			resolution: r.resolutions[0],
			tally: tallies?.[r.id] ?? emptyTally(),
			code: r.code
		}))
	);
</script>

{#if endings.some((e) => e.tally.total > 0)}
	<EndingsGrid {endings} />
{:else}
	<WidgetEmpty>{m.standalones_endings_empty()}</WidgetEmpty>
{/if}
