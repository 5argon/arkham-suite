<!--
@component
The final chaos bag — printed on every campaign-log sheet but not a campaign-data
section, so it rides in the reserved `__chaos_bag` section: one entry per token,
keyed by the kohaku token string code, param = count. Tokens are shown in the
canonical sheet order via the shared ChaosTokenDisplay.
-->
<script lang="ts">
	import { ChaosToken, chaosTokenCode, chaosTokenOrder } from '@5argon/arkham-kohaku';
	import type { CampaignLog } from '@5argon/arkham-campaign-data';
	import { Button, ChaosTokenDisplay } from '@5argon/arkham-life-ui';
	import { RESERVED, makeEntry, type LocalLog } from '$lib/campaign/records/recorded-state';

	interface Props {
		log: CampaignLog | undefined;
		/** Campaign difficulty — picks which starting bag to seed a fresh bag with. */
		difficulty: string;
		entries: LocalLog[];
		canEdit: boolean;
		/**
		 * Override the per-difficulty starting bags (token -> count). Pass for a
		 * standalone archive (the scenario's standalone setup); `null` = no starting
		 * bag (manual entry only). `undefined` (default) uses the campaign log's bag.
		 */
		startingChaosBag?: Record<string, Record<string, number>> | null;
		onChange: (next: LocalLog[]) => void;
	}

	let { log, difficulty, entries, canEdit, startingChaosBag, onChange }: Props = $props();

	// The per-difficulty starting bags in effect — a standalone override when given,
	// otherwise the campaign log's.
	const bags = $derived(
		startingChaosBag !== undefined ? startingChaosBag : (log?.db.startingChaosBag ?? null)
	);

	// The starting bag for this difficulty (tokenCode -> count). A fresh, untouched
	// bag is shown seeded with this so the player adjusts from the real opening
	// composition rather than from empty. The first edit materialises it (see `set`).
	const startingBag = $derived(bags?.[difficulty] ?? null);
	const isFresh = $derived(entries.length === 0);

	// Every token any starting bag uses — lets us scope special tokens (frost is
	// Edge of the Earth only). Bless/Curse are never part of a persistent bag.
	const campaignTokenCodes = $derived(
		new Set(Object.values(bags ?? {}).flatMap((b) => Object.keys(b)))
	);
	const SCOPED: ChaosToken[] = [ChaosToken.TokenFrost];
	const visibleTokens = $derived(
		chaosTokenOrder.filter((t) => {
			if (t === ChaosToken.TokenBless || t === ChaosToken.TokenCurse) return false;
			if (SCOPED.includes(t)) return campaignTokenCodes.has(chaosTokenCode[t]);
			return true;
		})
	);

	function count(token: ChaosToken): number {
		if (isFresh && startingBag) return startingBag[chaosTokenCode[token]] ?? 0;
		const e = entries.find((x) => x.key === chaosTokenCode[token]);
		return Number(e?.args.find((a) => a.type === 'number')?.value ?? 0) || 0;
	}

	// The whole bag as a flat, repeated list of tokens (each shown `count` times),
	// in sheet order — so the composition reads at a glance as coins, not just the
	// per-row numbers below (e.g. 0 0 0 −1 −1 −2 −2 …).
	const bagCoins = $derived(
		visibleTokens.flatMap((token) => Array.from({ length: count(token) }, () => token))
	);

	function set(token: ChaosToken, v: number) {
		const counts = new Map(chaosTokenOrder.map((t) => [t, count(t)]));
		counts.set(token, Math.max(0, v));
		const next: LocalLog[] = [];
		// Write ALL visible tokens (including count = 0). Zero-count entries are kept
		// so that scoped tokens like frost are distinguishable from "bag not recorded"
		// by the chaosToken achievement inference (which treats a missing key as unknown).
		for (const t of visibleTokens) {
			const c = counts.get(t) ?? 0;
			next.push(
				makeEntry(RESERVED.chaosBag, chaosTokenCode[t], [{ type: 'number', value: String(c) }])
			);
		}
		onChange(next);
	}
</script>

{#if bagCoins.length}
	<!-- At-a-glance bag: every token repeated by its count, in sheet order. -->
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
				'flex items-center justify-between gap-1 rounded border py-1 pr-3 pl-2',
				c > 0
					? 'border-secondary-400 bg-secondary-500/10'
					: 'border-primary-200 dark:border-primary-700'
			]}
		>
			<div class="flex items-center gap-1.5">
				<span class="text-lg"><ChaosTokenDisplay {token} sealed={false} hideLabel /></span>
				<span
					class="text-primary-600 dark:text-primary-300 min-w-5 text-center text-sm font-bold tabular-nums"
					>{c}</span
				>
			</div>
			{#if canEdit}
				<div class="flex gap-0.5">
					<Button label="−" onClick={() => set(token, c - 1)} />
					<Button label="+" onClick={() => set(token, c + 1)} />
				</div>
			{/if}
		</div>
	{/each}
</div>
