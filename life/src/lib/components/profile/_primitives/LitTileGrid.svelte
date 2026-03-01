<!--
@component
Shared "lit-tile grid" used by the EotE roster / tally / wall widgets (Killed in
the Plane Crash, Confronted Their Demons, Survivors, Memories Banished, Supplies
Recovered, Camped). Each tile is a square image (a card crop or portrait) that
lights up when its `count` is > 0 (a primary ring + a count badge) and is greyed
out otherwise, with a single shared hover tooltip (label + detail). A missing
image degrades to a labelled placeholder.

Tiles are a fixed size (`w-20`, larger when wide) so the layouts stay tight and
centred rather than stretching apart at full width. Two layouts:
  • `tiles`  — a flat list in a content-width, centred grid of `colsClass` columns.
  • `rows`   — explicit rows of tiles, each row centred (e.g. the Camp ascent
               tiers, or a single wrapping row for Supplies).
-->
<script lang="ts" module>
	export interface LitTile {
		id: string;
		/** Square image url (card crop / portrait); '' or a load failure → placeholder. */
		image: string;
		label: string;
		/** 0 → greyed out; > 0 → lit, with a count badge. */
		count: number;
		/** Hover tooltip's detail line. */
		detail: string;
		/** Optional card code (e.g. the Scarlet Key's bearer investigator) — its square art
		 *  is inset at the tile's BOTTOM-RIGHT corner. Omitted → no corner art. */
		cornerCode?: string;
	}
</script>

<script lang="ts">
	import { getCardImagePath, HoverTooltip } from '@5argon/arkham-life-ui';

	let {
		tiles = null,
		rows = null,
		colsClass = 'grid-cols-3'
	}: {
		tiles?: LitTile[] | null;
		rows?: LitTile[][] | null;
		/** Grid column classes for the flat `tiles` layout (e.g. `grid-cols-3 @3xl:grid-cols-9`).
		 *  The grid is content-width + centred, so tiles stay close together. */
		colsClass?: string;
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
			class="bg-primary-200 dark:bg-primary-700 relative aspect-square w-full overflow-hidden rounded {t.count >
			0
				? 'ring-primary-500 ring-2'
				: ''}"
		>
			{#if t.image && !failed[t.id]}
				<img
					src={t.image}
					alt=""
					onerror={() => (failed = { ...failed, [t.id]: true })}
					class="h-full w-full object-cover transition {t.count > 0 ? '' : 'opacity-30 grayscale'}"
				/>
			{:else}
				<span
					class="text-primary-500 dark:text-primary-300 absolute inset-0 flex items-center justify-center px-1 text-center text-[0.6rem] leading-tight font-medium {t.count >
					0
						? ''
						: 'opacity-40'}">{t.label}</span
				>
			{/if}
			{#if t.count > 0}
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
		<span
			class="w-full truncate text-center text-[0.7rem] {t.count > 0
				? 'text-black dark:text-white'
				: 'text-primary-400'}">{t.label}</span
		>
	</div>
{/snippet}

{#if rows}
	<div class="@container space-y-3">
		{#each rows as row, i (i)}
			<div class="flex flex-wrap justify-center gap-3">
				{#each row as t (t.id)}
					<div class="w-20 @3xl:w-28">{@render tile(t)}</div>
				{/each}
			</div>
		{/each}
	</div>
{:else if tiles}
	<!-- Content-width grid, centred (mx-auto + w-fit) so tiles stay close together
	     instead of spreading across a full-width widget. -->
	<div class="@container">
		<div class="mx-auto grid w-fit gap-3 {colsClass}">
			{#each tiles as t (t.id)}
				<div class="w-20 @3xl:w-28">{@render tile(t)}</div>
			{/each}
		</div>
	</div>
{/if}

<HoverTooltip visible={tipVisible} referenceElement={tipRef}>
	<span class="block max-w-xs py-1 text-xs text-neutral-900 dark:text-neutral-100">
		<span class="font-semibold">{tipTitle}</span>
		{#if tipDetail}
			<br />
			<span class="text-neutral-600 dark:text-neutral-300">{tipDetail}</span>
		{/if}
	</span>
</HoverTooltip>
