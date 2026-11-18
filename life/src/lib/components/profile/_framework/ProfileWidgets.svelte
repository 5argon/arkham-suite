<!-- @component Renders a pane's widget rows; a split row sits side by side when there is room. -->
<script lang="ts">
	import type { ProfileRow, WidgetSlot } from '$lib/campaign/profile/profile-settings';
	import { WIDGET_BY_ID, isDeckCategoryWidget } from '$lib/campaign/profile/profile-widgets';
	import type { WidgetDef } from '$lib/campaign/profile/widget-def';
	import type { ProfilePayload } from '$lib/profile/profile-types';
	import NonLogPlaceholder from '../_primitives/NonLogPlaceholder.svelte';
	import WidgetFrame from '../_primitives/WidgetFrame.svelte';
	import type { RenderContext } from './widget-renderer';
	import { WIDGET_RENDERERS, defaultWidgetTitle } from './widget-renderers';

	let {
		rows,
		payload,
		campaign = null,
		classFilter = null
	}: {
		rows: ProfileRow[];
		payload: ProfilePayload;
		/** Set on a campaign detail page. */
		campaign?: { slug: string; family: string } | null;
		/** Set on a class detail page. */
		classFilter?: string | null;
	} = $props();

	const family = $derived(campaign?.family ?? null);
	const settings = $derived(payload.settings);
	const campaignLogOnly = $derived(
		campaign ? settings.campaignLogOnly?.[campaign.slug] === true : false
	);
	const achievements = $derived(
		payload.achievements.families.find((f) => f.family === family)?.achievements ?? []
	);
	const scenarios = $derived(payload.scenarios.find((s) => s.family === family) ?? null);
	const blob = $derived(
		family ? ((payload.bespoke as Record<string, unknown>)[family] ?? null) : null
	);

	/** "Campaign categories only" drops deck-derived widgets and collapses rows that empty out. */
	const visibleRows = $derived.by((): ProfileRow[] => {
		if (!settings.campaignCategoriesOnly) return rows;
		const keep = (slot: WidgetSlot | null) => (slot && !isDeckCategoryWidget(slot.id) ? slot : null);
		return rows.flatMap((row): ProfileRow[] => {
			if (row.kind === 'full') {
				const slot = keep(row.slot);
				return slot ? [{ kind: 'full', slot }] : [];
			}
			const left = keep(row.left);
			const right = keep(row.right);
			if (left && right) return [{ kind: 'split', left, right }];
			return left || right ? [{ kind: 'full', slot: left ?? right }] : [];
		});
	});

	const rowKey = (row: ProfileRow): string =>
		row.kind === 'full' ? `full:${row.slot?.id}` : `split:${row.left?.id}|${row.right?.id}`;

	function context(slot: WidgetSlot, def: WidgetDef): RenderContext {
		const logOnly =
			settings.logOnly === true || campaignLogOnly || slot.config?.ignoreNonLog === true;
		return {
			payload,
			def,
			slot,
			family,
			classFilter,
			blob,
			ctx: {
				family,
				scenario: def.scenario ?? null,
				scenarios,
				achievements,
				logOnly,
				config: slot.config ?? {}
			},
			slice: (list) => (family ? list.filter((x) => x.family === family) : list),
			pick: (list) => (family ? (list.find((x) => x.family === family) ?? null) : null)
		};
	}
</script>

{#snippet widgetBody(slot: WidgetSlot)}
	{@const def = WIDGET_BY_ID[slot.id]}
	{@const renderer = WIDGET_RENDERERS[slot.id]}
	{#if def && renderer}
		{@const c = context(slot, def)}
		{@const Body = renderer.component}
		<WidgetFrame
			title={renderer.title?.(c) ?? defaultWidgetTitle(def, classFilter)}
			image={def.image ?? null}
			noteDoc={def.noteDoc ?? null}
			scenario={def.scenario ?? null}
		>
			{#if def.nonLog === 'full' && c.ctx.logOnly}
				<NonLogPlaceholder />
			{:else}
				<Body {...renderer.props(c)} />
			{/if}
		</WidgetFrame>
	{/if}
{/snippet}

<div class="widget-rows mt-6 space-y-6">
	{#each visibleRows as row (rowKey(row))}
		{#if row.kind === 'full'}
			{#if row.slot}
				<div>{@render widgetBody(row.slot)}</div>
			{/if}
		{:else}
			<div class="widget-split">
				<div>
					{#if row.left}{@render widgetBody(row.left)}{/if}
				</div>
				<div>
					{#if row.right}{@render widgetBody(row.right)}{/if}
				</div>
			</div>
		{/if}
	{/each}
</div>

<style>
	.widget-rows {
		/* Break on the content width, not the viewport. */
		container-type: inline-size;
	}
	.widget-split {
		/* One half-width slot: 34rem leaves ~512px of body, a 4-wide card row. The container floor
		   below is 2 × this + the 1.5rem gap − the 6rem bleed, with slack. */
		--widget-half-width: 34rem;
		display: grid;
		gap: 1.5rem;
		grid-template-columns: minmax(0, 1fr);
	}
	@container (min-width: 64rem) {
		.widget-split {
			grid-template-columns: var(--widget-half-width) var(--widget-half-width);
			justify-content: center;
			margin-inline: -3rem;
		}
	}
</style>
