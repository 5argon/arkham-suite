<!-- @component Cards from PtC plays, newest first, each with its play's finish date and, for weakness draws, the pool trait and the bearer. -->
<script lang="ts">
	import { CardStrip } from '@5argon/arkham-life-ui';
	import { cardsByCode } from '$lib/card-data';
	import { scenarioMeta } from '$lib/campaign/utils/scenario-meta';
	import { CardLineList, FinishDate } from '$lib/components/profile/_primitives';

	let {
		items,
		weaknessPool
	}: {
		items: { code: string; finishDate: number | null; bearer?: string | null }[];
		/** The scenario whose random-weakness trait pool the shown traits are narrowed to. */
		weaknessPool?: string;
	} = $props();

	const byCode = cardsByCode();
	const pool = $derived(
		weaknessPool
			? (scenarioMeta('ptc', weaknessPool)?.choices?.find((c) => c.id === 'randomized_weakness')
					?.cardFilter?.traits ?? [])
			: []
	);
</script>

<CardLineList {items} align="right">
	{#snippet trailing(it)}
		{@const bearer = it.bearer ? byCode.get(it.bearer) : undefined}
		{@const traits = (byCode.get(it.code)?.traits ?? []).filter((t) => pool.includes(t))}
		<span class="inline-flex items-center justify-end gap-2">
			{#if traits.length}
				<span class="text-primary-500 text-xs whitespace-nowrap">{traits.join(' · ')}</span>
			{/if}
			<FinishDate ms={it.finishDate} />
			{#if bearer}<CardStrip card={bearer} />{/if}
		</span>
	{/snippet}
</CardLineList>
