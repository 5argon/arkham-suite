<!--
@component
Shared "lit tile" wall — a flex or grid of square tiles. Each tile is a square image
(a card crop, a portrait, or a diagram) that lights up (a primary ring + its count) when
its `count` is > 0 and is greyed out otherwise, with a single shared hover tooltip. A
missing image degrades to a labelled placeholder. Used across the campaign profile widgets:
the EotE roster / tally / memory walls, the "missing persons" / companions / artifacts /
keys walls, TSK's Congress roster, the Dealings Act 2 setup tableau, and more.

Layout (tiles are a uniform fixed size — `w-20` — so a wall looks the same in any slot):
  • `tiles` + `layout='grid'` (default) — a content-width, centred grid of `colsClass` columns.
  • `tiles` + `layout='flex'`           — a centred flex-wrap row.
  • `rows`                              — explicit rows of tiles, each row centred.

Per-tile chrome is opt-in: `showLabel` (a name under the tile), `countPosition` ('corner'
badge vs 'below' the tile), `fit` ('cover' crop vs 'contain' for diagrams that must not be
cropped), `objectTop` (top-framing for portraits), and `markup` (render the label + tooltip
title as Arkham glyphs, e.g. chaos-token symbols).
-->
<script lang="ts" module>
	export interface LitTile {
		id: string;
		/** Square image url (card crop / portrait / diagram); '' or a load failure → placeholder. */
		image: string;
		label: string;
		/** 0 → greyed out; > 0 → lit, with its count shown. */
		count: number;
		/** Hover tooltip's detail line. */
		detail: string;
		/** Optional card code (e.g. a Scarlet Key's bearer investigator) — its square art is inset
		 *  at the tile's BOTTOM-RIGHT corner. Omitted → no corner art. */
		cornerCode?: string;
	}
</script>

<script lang="ts">
	import { getCardImagePath, HoverTooltip, parseArkhamMarkup } from '@5argon/arkham-life-ui';

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
		/** Grid column classes for the flat `tiles` grid layout (e.g. `grid-cols-3 @3xl:grid-cols-9`). */
		colsClass?: string;
		/** `tiles` layout: a `colsClass` grid (default) or a centred flex-wrap row. */
		layout?: 'grid' | 'flex';
		/** Show the tile's label underneath the image. */
		showLabel?: boolean;
		/** Where the count shows when lit: a corner badge, or a line below the tile. */
		countPosition?: 'corner' | 'below';
		/** Show the count when lit. False = a lit ring only, no number (e.g. a "which ones" highlight row). */
		showCount?: boolean;
		/** Image fit: cover-crop (card art / portraits) or contain (diagrams that must not crop). */
		fit?: 'cover' | 'contain';
		/** Frame the image from the top (portraits) instead of centred. */
		objectTop?: boolean;
		/** Render the label + tooltip title as Arkham markup (chaos-token glyphs etc.). */
		markup?: boolean;
	} = $props();

	// Image load failures fall back to a labelled placeholder tile.
	let failed = $state<Record<string, boolean>>({});

	// ── single shared tooltip for every tile ─────────────────────────────────
	let tipVisible = $state(false);
	let tipRef = $state<HTMLElement | null>(null);
	let tipTitle = $state('');
	let tipDetail = $state('');
	function showTip(t: LitTile, e: MouseEvent) {
		tipTitle = t.label;
		tipDetail = t.detail;
		tipRef = e.currentTarget as HTMLElement;
		tipVisible = true;
	}
	const hideTip = () => (tipVisible = false);

	const imgFit = $derived(
		`${fit === 'contain' ? 'object-contain' : 'object-cover'} ${objectTop ? 'object-top' : ''}`
	);
</script>

{#snippet tile(t: LitTile)}
	<div
		role="img"
		aria-label="{t.label} — {t.detail}"
		class="flex w-full cursor-default flex-col items-center gap-1"
		onmouseenter={(e) => showTip(t, e)}
		onmouseleave={hideTip}
	>
		<div
			class="bg-primary-200 dark:bg-primary-700 relative aspect-square w-full overflow-hidden rounded {fit ===
			'contain'
				? 'p-1.5'
				: ''} {t.count > 0 ? 'ring-primary-500 ring-2' : ''}"
		>
			{#if t.image && !failed[t.id]}
				<img
					src={t.image}
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
					>{#if markup}{@html parseArkhamMarkup(t.label)}{:else}{t.label}{/if}</span
				>
			{/if}
			{#if t.count > 0 && countPosition === 'corner' && showCount}
				<span
					class="bg-primary-600 absolute top-0.5 right-0.5 rounded-full px-1.5 py-0.5 text-[0.65rem] font-bold text-white tabular-nums"
					>{t.count}</span
				>
			{/if}
			{#if t.cornerCode && !failed[`${t.id}-corner`]}
				<!-- Bearer art: a small inset card square at the bottom-right corner. -->
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
				>{#if markup}{@html parseArkhamMarkup(t.label)}{:else}{t.label}{/if}</span
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
	<!-- Content-width + centred (mx-auto / justify-center) so tiles stay close together
	     instead of spreading across a full-width widget. -->
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

<HoverTooltip visible={tipVisible} referenceElement={tipRef}>
	<span class="block max-w-xs py-1 text-xs text-neutral-900 dark:text-neutral-100">
		<span class="font-semibold"
			>{#if markup}{@html parseArkhamMarkup(tipTitle)}{:else}{tipTitle}{/if}</span
		>
		{#if tipDetail}
			<br />
			<span class="text-neutral-600 dark:text-neutral-300">{tipDetail}</span>
		{/if}
	</span>
</HoverTooltip>
