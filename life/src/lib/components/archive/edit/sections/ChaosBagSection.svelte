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
	import { RESERVED, makeEntry, type LocalLog } from '$lib/campaign/recorded-state';

	interface Props {
		log: CampaignLog | undefined;
		/** Campaign difficulty — picks which starting bag to seed a fresh bag with. */
		difficulty: string;
		entries: LocalLog[];
		canEdit: boolean;
		onChange: (next: LocalLog[]) => void;
	}

	let { log, difficulty, entries, canEdit, onChange }: Props = $props();

	// Canonical-ish token colors so the bag reads at a glance like the game's coding
	// (defined here so life's Tailwind generates the classes). Numeric tokens share a
	// blue; symbol tokens get their game colors.
	const TOKEN_COLOR: Record<ChaosToken, string> = {
		[ChaosToken.TokenP1]: 'text-amber-400',
		[ChaosToken.Token0]: 'text-sky-400',
		[ChaosToken.TokenM1]: 'text-sky-400',
		[ChaosToken.TokenM2]: 'text-sky-400',
		[ChaosToken.TokenM3]: 'text-sky-400',
		[ChaosToken.TokenM4]: 'text-sky-400',
		[ChaosToken.TokenM5]: 'text-sky-400',
		[ChaosToken.TokenM6]: 'text-sky-400',
		[ChaosToken.TokenM7]: 'text-sky-400',
		[ChaosToken.TokenM8]: 'text-sky-400',
		[ChaosToken.TokenSkull]: 'text-rose-500',
		[ChaosToken.TokenCultist]: 'text-emerald-500',
		[ChaosToken.TokenTablet]: 'text-teal-400',
		[ChaosToken.TokenElderThing]: 'text-fuchsia-500',
		[ChaosToken.TokenAutofail]: 'text-red-700',
		[ChaosToken.TokenElderSign]: 'text-blue-500',
		[ChaosToken.TokenFrost]: 'text-cyan-400',
		[ChaosToken.TokenBless]: 'text-amber-300',
		[ChaosToken.TokenCurse]: 'text-purple-500'
	};

	// The campaign's starting bag for this difficulty (tokenCode -> count). A
	// fresh, untouched bag is shown seeded with this so the player adjusts from
	// the real opening composition rather than from empty. The first edit
	// materialises it (see `set`); we never write on load.
	const startingBag = $derived(log?.db.startingChaosBag?.[difficulty] ?? null);
	const isFresh = $derived(entries.length === 0);

	// Every token any of this campaign's starting bags uses — lets us scope
	// special tokens (frost is Edge of the Earth only). Bless/Curse are never part
	// of a persistent bag (they're added and removed during play).
	const campaignTokenCodes = $derived(
		new Set(Object.values(log?.db.startingChaosBag ?? {}).flatMap((b) => Object.keys(b)))
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
			<span class="text-xl"
				><ChaosTokenDisplay {token} hideLabel fillColor={TOKEN_COLOR[token]} /></span
			>
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
				<span class="text-lg"
					><ChaosTokenDisplay {token} hideLabel fillColor={TOKEN_COLOR[token]} /></span
				>
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
