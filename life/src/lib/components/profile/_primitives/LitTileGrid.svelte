<!--
@component
A wall of fixed-size square tiles, each lit with its count when above zero and greyed out otherwise,
sharing one tooltip. Pass `tiles` (a grid or a flex row) or explicit `rows`.
-->
<script lang="ts" module>
	import HoverTip from './HoverTip.svelte';
	import { HoverTipState } from './hover-tip.svelte';
	export interface LitTile {
		id: string;
		/** A card whose square art is the image and whose name is the default label. */
		code?: string;
		/** Any other square image; missing or failing shows the label instead. */
		image?: string;
		label?: string;
		/** Lit when above zero. */
		count: number;
		/** The tooltip's detail line. */
		detail: string;
		/** A card inset at the bottom-right corner, e.g. a Scarlet Key's bearer. */
		cornerCode?: string;
	}
</script>

<script lang="ts">
	import { getCardImagePath, parseArkhamMarkup } from '@5argon/arkham-life-ui';
	import { cardByCode } from '$lib/card-data';

	let {
		tiles = null,
		rows = null,
		colsClass = 'grid-cols-3',
		layout = 'grid',
		showLabel = true,
		countPosition = 'corner',
		showCount = true,
		fit = 'cover',
		objectTop = false,
		markup = false
	}: {
		tiles?: LitTile[] | null;
		rows?: LitTile[][] | null;
		/** Grid columns for `tiles`, e.g. `grid-cols-3 @3xl:grid-cols-9`. */
		colsClass?: string;
		layout?: 'grid' | 'flex';
		showLabel?: boolean;
		countPosition?: 'corner' | 'below';
		/** False lights the ring without a number. */
		showCount?: boolean;
		/** `contain` for diagrams that must not be cropped. */
		fit?: 'cover' | 'contain';
		/** Frame portraits from the top. */
		objectTop?: boolean;
		/** Render labels and tooltip titles as Arkham markup (chaos-token glyphs). */
		markup?: boolean;
	} = $props();

	let failed = $state<Record<string, boolean>>({});

	const tip = new HoverTipState();

	const imgFit = $derived(
		`${fit === 'contain' ? 'object-contain' : 'object-cover'} ${objectTop ? 'object-top' : ''}`
	);
</script>

{#snippet tile(t: LitTile)}
	{@const label = t.label ?? (t.code ? (cardByCode(t.code)?.name ?? t.code) : t.id)}
	{@const image = t.image ?? (t.code ? getCardImagePath(t.code, 'square') : '')}
	<div
		role="img"
		aria-label="{label} — {t.detail}"
		class="flex w-full cursor-default flex-col items-center gap-1"
		onmouseenter={(e) => tip.show(label, t.detail, e)}
		onmouseleave={tip.hide}
	>
		<div
			class="bg-primary-200 dark:bg-primary-700 relative aspect-square w-full overflow-hidden rounded {fit ===
			'contain'
				? 'p-1.5'
				: ''} {t.count > 0 ? 'ring-primary-500 ring-2' : ''}"
		>
			{#if image && !failed[t.id]}
				<img
					src={image}
					alt=""
					onerror={() => (failed = { ...failed, [t.id]: true })}
					class="h-full w-full {imgFit} transition {t.count > 0 ? '' : 'opacity-30 grayscale'}"
				/>
			{:else}
				<span
					class="text-primary-500 dark:text-primary-300 absolute inset-0 flex items-center justify-center px-1 text-center text-[0.6rem] leading-tight font-medium {t.count >
					0
						? ''
						: 'opacity-40'}"
					>{#if markup}{@html parseArkhamMarkup(label)}{:else}{label}{/if}</span
				>
			{/if}
			{#if t.count > 0 && countPosition === 'corner' && showCount}
				<span
					class="bg-primary-600 absolute top-0.5 right-0.5 rounded-full px-1.5 py-0.5 text-[0.65rem] font-bold text-white tabular-nums"
					>{t.count}</span
				>
			{/if}
			{#if t.cornerCode && !failed[`${t.id}-corner`]}
				<img
					src={getCardImagePath(t.cornerCode, 'square')}
					alt=""
					onerror={() => (failed = { ...failed, [`${t.id}-corner`]: true })}
					class="border-primary-100 dark:border-primary-800 absolute right-0.5 bottom-0.5 h-1/3 w-1/3 rounded-sm border object-cover shadow {t.count >
					0
						? ''
						: 'opacity-40 grayscale'}"
				/>
			{/if}
		</div>
		{#if showLabel}
			<span
				class="w-full text-center text-[0.7rem] {markup ? '' : 'truncate'} {t.count > 0
					? 'text-black dark:text-white'
					: 'text-primary-400'}"
				>{#if markup}{@html parseArkhamMarkup(label)}{:else}{label}{/if}</span
			>
		{/if}
		{#if countPosition === 'below' && showCount}
			<span
				class="text-center text-[0.65rem] tabular-nums {t.count > 0
					? 'font-semibold text-black dark:text-white'
					: 'text-primary-400'}">{t.count > 0 ? `×${t.count}` : '—'}</span
			>
		{/if}
	</div>
{/snippet}

{#if rows}
	<div class="@container space-y-3">
		{#each rows as row, i (i)}
			<div class="flex flex-wrap justify-center gap-3">
				{#each row as t (t.id)}
					<div class="w-20">{@render tile(t)}</div>
				{/each}
			</div>
		{/each}
	</div>
{:else if tiles}
	<div class="@container">
		{#if layout === 'flex'}
			<div class="flex flex-wrap justify-center gap-3">
				{#each tiles as t (t.id)}
					<div class="w-20">{@render tile(t)}</div>
				{/each}
			</div>
		{:else}
			<div class="mx-auto grid w-fit gap-3 {colsClass}">
				{#each tiles as t (t.id)}
					<div class="w-20">{@render tile(t)}</div>
				{/each}
			</div>
		{/if}
	</div>
{/if}

<HoverTip {tip} {markup} />
