<!--
@component
The final chaos bag, recorded in the reserved `__chaos_bag` section (token code → count). An
untouched bag previews the difficulty's starting bag; the first edit records it.
-->
<script lang="ts">
	import { ChaosToken, chaosTokenCode, chaosTokenOrder } from '@5argon/arkham-kohaku';
	import { ChaosTokenDisplay } from '@5argon/arkham-life-ui';
	import { chaosBagEntries, firstNumber, type LocalLog } from '$lib/campaign/records/recorded-state';
	import Stepper from '../Stepper.svelte';

	interface Props {
		/** Starting bags per difficulty (token code → count); null = no starting bag. */
		startingBags: Record<string, Record<string, number>> | null;
		difficulty: string;
		entries: LocalLog[];
		onChange: (next: LocalLog[]) => void;
	}
	let { startingBags, difficulty, entries, onChange }: Props = $props();

	const startingBag = $derived(startingBags?.[difficulty] ?? null);
	const isFresh = $derived(entries.length === 0);

	// Frost only exists in campaigns whose starting bags use it; bless / curse never persist.
	const bagTokenCodes = $derived(
		new Set(Object.values(startingBags ?? {}).flatMap((b) => Object.keys(b)))
	);
	const visibleTokens = $derived(
		chaosTokenOrder.filter((t) => {
			if (t === ChaosToken.TokenBless || t === ChaosToken.TokenCurse) return false;
			if (t === ChaosToken.TokenFrost) return bagTokenCodes.has(chaosTokenCode[t]);
			return true;
		})
	);

	function count(token: ChaosToken): number {
		const code = chaosTokenCode[token];
		if (isFresh && startingBag) return startingBag[code] ?? 0;
		const e = entries.find((x) => x.key === code);
		return (e && firstNumber(e.args)) || 0;
	}

	/** Every token repeated by its count, in sheet order. */
	const bagCoins = $derived(
		visibleTokens.flatMap((token) => Array.from({ length: count(token) }, () => token))
	);

	/** Records every visible token, zeros included (see `toRecordedState`). */
	function set(token: ChaosToken, v: number) {
		const bag: Record<string, number> = {};
		for (const t of visibleTokens) bag[chaosTokenCode[t]] = t === token ? Math.max(0, v) : count(t);
		onChange(chaosBagEntries(bag));
	}
</script>

{#if bagCoins.length}
	<div
		class="border-primary-200 dark:border-primary-700 mb-3 flex flex-wrap items-center gap-1.5 rounded-lg border p-2"
	>
		{#each bagCoins as token, i (i)}
			<span class="text-xl"><ChaosTokenDisplay {token} sealed={false} hideLabel /></span>
		{/each}
	</div>
{/if}

<div class="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
	{#each visibleTokens as token (token)}
		{@const c = count(token)}
		<div
			class={[
				'flex items-center justify-between gap-1 rounded border py-1 pr-2 pl-2',
				c > 0 ? 'border-secondary-400 bg-secondary-500/10' : 'border-primary-200 dark:border-primary-700'
			]}
		>
			<span class="text-lg"><ChaosTokenDisplay {token} sealed={false} hideLabel /></span>
			<Stepper value={c} onChange={(v) => set(token, v)} />
		</div>
	{/each}
</div>
