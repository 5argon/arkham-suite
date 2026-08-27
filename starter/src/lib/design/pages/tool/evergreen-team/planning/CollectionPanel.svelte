<!--
@component
The shared collection, sectioned by product like the physical boxes on the
table (or by class across all products when merging), split into a Lv. 0 tab
and a Lv. 1-5 tab so leveled cards are easy to tell apart at tiny sizes. One
merged stack per distinct card, decremented as decks draft them; a stack
thrown back from any deck lands in its place automatically. Sections collapse
individually or all at once (a collapsed list doubles as an overview of the
pool). The whole panel is the drop target for returns.
-->
<script lang="ts">
	import {
		Button,
		CarouselRadio,
		Checkbox,
		LIMIT_STACKING_QUANTITY,
		SectionSeparator,
		SmallTabs
	} from '@5argon/arkham-life-ui';
	import { ArkhamIcon, ProductIcon } from '@5argon/arkham-icon';
	import {
		type ArkhamInlineIcon,
		type Card,
		CardClass,
		type CardCode,
		type Product
	} from '@5argon/arkham-kohaku';
	import { u as stringUtils } from '@5argon/arkham-string';
	import clsx from 'clsx';
	import { SvelteSet } from 'svelte/reactivity';
	import { slide } from 'svelte/transition';

	import * as m from '$lib/paraglide/messages.js';
	import { classGroupFor, poolSections } from '$lib/tool/evergreen-team/pool';
	import {
		deckLimitOf,
		matchesFocus,
		remainingOf,
		routeZone
	} from '$lib/tool/evergreen-team/rules';
	import type {
		EvergreenFocus,
		EvergreenPickMode,
		EvergreenState,
		EvergreenZone,
		PoolEntry
	} from '$lib/tool/evergreen-team/types';

	import CardStack from './CardStack.svelte';
	import { DRAG_MIME, type DragSource, EvergreenDnd } from './dnd.svelte';

	interface Prop {
		team: EvergreenState;
		pool: Map<CardCode, PoolEntry>;
		/**
		 * Per-card usability per team member; cards no active member can use
		 * are hidden.
		 */
		eligibility: Map<CardCode, boolean[]>;
		/**
		 * Deck indices currently on the board (all, or the soloed subset). The
		 * collection adapts as if only these members were in the team.
		 */
		activeDeckIndices?: number[];
		focus: EvergreenFocus;
		onFocusChange: (focus: EvergreenFocus) => void;
		dnd: EvergreenDnd;
		onStackClick: (source: DragSource) => void;
		onDropReturn: (source: DragSource) => void;
		onChange?: () => void;
		onCardHover?: (card: Card, el: HTMLElement) => void;
		onCardHoverEnd?: () => void;
	}
	const {
		team,
		pool,
		eligibility,
		activeDeckIndices,
		focus,
		onFocusChange,
		dnd,
		onStackClick,
		onDropReturn,
		onChange,
		onCardHover,
		onCardHoverEnd
	}: Prop = $props();

	// Setup and pool are frozen for the lifetime of the planning phase.
	const getFrozen = () => ({ setup: team.setup, pool, eligibility });
	const allProductSections = poolSections(getFrozen().setup, getFrozen().pool);

	// Cards that no active member can use are filtered out of the collection
	// entirely; with Solo active this narrows to the soloed members only.
	const usable = $derived.by(() => {
		const active = activeDeckIndices ?? team.decks.map((_, i) => i);
		return new Set(
			[...pool.keys()].filter((code) => {
				const row = eligibility.get(code) ?? [];
				return active.some((i) => row[i] === true);
			})
		);
	});
	const productSections = $derived(
		allProductSections
			.map((section) => ({
				product: section.product,
				entries: section.entries.filter((e) => usable.has(e.card.code))
			}))
			.filter((section) => section.entries.length > 0)
	);

	let levelTab = $state<'lv0' | 'lvUp'>('lv0');
	const zone = $derived<EvergreenZone>(levelTab === 'lv0' ? 'main' : 'side');

	const classOrder = [
		CardClass.Guardian,
		CardClass.Seeker,
		CardClass.Rogue,
		CardClass.Mystic,
		CardClass.Survivor,
		CardClass.Neutral
	];

	interface DisplaySection {
		key: string;
		product?: Product;
		cardClass?: CardClass;
		entries: PoolEntry[];
	}
	const sections = $derived.by((): DisplaySection[] => {
		if (team.mergeProducts) {
			const filtered = entries.filter(
				(e) => routeZone(e.card) === zone && matchesFocus(e.card, focus)
			);
			return classOrder
				.map((c) => ({
					key: `class-${c}`,
					cardClass: c,
					entries: filtered.filter((e) => (e.card.cardClass?.class1 ?? CardClass.Neutral) === c)
				}))
				.filter((s) => s.entries.length > 0);
		}
		return productSections
			.map((s) => ({
				key: `product-${s.product}`,
				product: s.product,
				entries: s.entries.filter((e) => routeZone(e.card) === zone && matchesFocus(e.card, focus))
			}))
			.filter((s) => s.entries.length > 0);
	});

	const entries = $derived([...pool.values()].filter((e) => usable.has(e.card.code)));
	const poolTotal = $derived(entries.reduce((sum, e) => sum + e.total, 0));
	const remainingTotal = $derived(
		entries.reduce((sum, e) => sum + remainingOf(team, pool, e.card.code), 0)
	);
	const gridMaxQuantity = $derived(
		Math.min(LIMIT_STACKING_QUANTITY, Math.max(1, ...entries.map((e) => e.total)))
	);

	const levelTabOptions: { value: 'lv0' | 'lvUp'; label: string }[] = [
		{ value: 'lv0', label: m.tool_evergreen_team_tab_lv0() },
		{ value: 'lvUp', label: m.tool_evergreen_team_tab_lv1plus() }
	];

	const focusOptions: { value: EvergreenFocus; label: string }[] = [
		{ value: 'none', label: m.tool_evergreen_team_focus_none() },
		{ value: 'hand', label: m.tool_evergreen_team_focus_hand() },
		{ value: 'ally', label: m.tool_evergreen_team_focus_ally() },
		{ value: 'skill', label: m.tool_evergreen_team_focus_skill() }
	];

	const pickModeOptions: { value: EvergreenPickMode; label: string }[] = [
		{ value: 'max', label: m.tool_evergreen_team_pick_max() },
		{ value: 'one', label: m.tool_evergreen_team_pick_one() },
		{ value: 'class', label: m.tool_evergreen_team_pick_class() }
	];

	function collectionSource(entry: PoolEntry): DragSource {
		if (team.pickMode !== 'class') {
			return { kind: 'collection', cardCode: entry.card.code };
		}
		return {
			kind: 'collection',
			cardCode: entry.card.code,
			classGroup: classGroupFor({
				pool,
				cardCode: entry.card.code,
				zone,
				mergeProducts: team.mergeProducts
			})
		};
	}

	function dragCopiesFor(entry: PoolEntry, remaining: number): number {
		if (team.pickMode === 'one') return 1;
		return Math.max(1, Math.min(deckLimitOf(entry.card), remaining));
	}

	const collapsed = new SvelteSet<string>();
	const allCollapsed = $derived(sections.every((s) => collapsed.has(s.key)));

	function toggleSection(key: string) {
		if (collapsed.has(key)) {
			collapsed.delete(key);
		} else {
			collapsed.add(key);
		}
	}

	function toggleAll() {
		if (allCollapsed) {
			collapsed.clear();
		} else {
			for (const section of sections) {
				collapsed.add(section.key);
			}
		}
	}

	function sectionRemaining(section: DisplaySection): number {
		return section.entries.reduce((sum, e) => sum + remainingOf(team, pool, e.card.code), 0);
	}
	function sectionTotal(section: DisplaySection): number {
		return section.entries.reduce((sum, e) => sum + e.total, 0);
	}

	const returnEligible = $derived(dnd.active?.kind === 'deck');

	let hoverDepth = $state(0);
	const hovering = $derived(hoverDepth > 0);

	function isOurDrag(ev: DragEvent): boolean {
		return ev.dataTransfer?.types.includes(DRAG_MIME) ?? false;
	}

	function handleDragOver(ev: DragEvent) {
		if (!returnEligible || !isOurDrag(ev)) return;
		ev.preventDefault();
		if (ev.dataTransfer) ev.dataTransfer.dropEffect = 'move';
	}

	function handleDrop(ev: DragEvent) {
		ev.preventDefault();
		hoverDepth = 0;
		const parsed = EvergreenDnd.parsePayload(ev.dataTransfer);
		const active = dnd.active;
		if (
			parsed === null ||
			active === null ||
			parsed.cardCode !== active.cardCode ||
			parsed.kind !== 'deck'
		) {
			dnd.endDrag();
			return;
		}
		onDropReturn(parsed);
		dnd.endDrag();
	}
</script>

<div
	class={clsx(
		'return-target min-w-0 rounded-lg p-2',
		returnEligible && 'return-eligible',
		returnEligible && hovering && 'hovering'
	)}
	role="region"
	ondragover={handleDragOver}
	ondragenter={(ev) => {
		if (returnEligible && isOurDrag(ev)) hoverDepth++;
	}}
	ondragleave={() => {
		if (hoverDepth > 0) hoverDepth--;
	}}
	ondrop={handleDrop}
>
	<SectionSeparator title={m.tool_evergreen_team_collection()} />
	<div
		class="bg-primary-50/80 dark:bg-primary-950/80 z-10 flex flex-col gap-1 px-1 py-1 backdrop-blur-sm md:sticky md:top-0"
	>
		<div class="flex flex-wrap items-center justify-between gap-2">
			<span class="text-primary-900 dark:text-primary-100 text-sm font-medium">
				{m.tool_evergreen_team_remaining({ remaining: remainingTotal, total: poolTotal })}
			</span>
			<div class="flex flex-wrap items-center gap-2">
				<Button
					label={allCollapsed
						? m.tool_evergreen_team_expand_all()
						: m.tool_evergreen_team_collapse_all()}
					onClick={toggleAll}
				/>
				<Checkbox
					label={m.tool_evergreen_team_merge_products()}
					checked={team.mergeProducts}
					onChange={() => {
						team.mergeProducts = !team.mergeProducts;
						onChange?.();
					}}
				/>
				<!-- Pick mode only matters for drag and drop, which phones do not have. -->
				<div class="hidden sm:block">
					<CarouselRadio
						label={m.tool_evergreen_team_pick_mode()}
						options={pickModeOptions}
						value={team.pickMode}
						width="11rem"
						onCycle={(next) => {
							team.pickMode = next;
							onChange?.();
						}}
					/>
				</div>
				<CarouselRadio
					label={m.tool_evergreen_team_focus()}
					options={focusOptions}
					value={focus}
					width="8rem"
					onCycle={onFocusChange}
				/>
			</div>
		</div>
		<SmallTabs options={levelTabOptions} value={levelTab} onSelect={(next) => (levelTab = next)} />
	</div>
	{#each sections as section (section.key)}
		{@const isCollapsed = collapsed.has(section.key)}
		<button
			type="button"
			class="section-header border-primary-300 dark:border-primary-700 text-primary-900 dark:text-primary-100 hover:bg-primary-200/60 active:bg-primary-300/60 dark:hover:bg-primary-800/60 dark:active:bg-primary-700/60 mt-2 flex w-full cursor-pointer items-center gap-2 rounded-t border-b px-1 pb-0.5 text-left transition-colors"
			onclick={() => toggleSection(section.key)}
		>
			<span
				class={clsx('chevron text-xs transition-transform', !isCollapsed && 'rotate-90')}
				aria-hidden="true"
			>
				▶
			</span>
			{#if section.product !== undefined}
				<ProductIcon product={section.product} />
				<span class="font-semibold">{stringUtils.productName(section.product)}</span>
			{:else if section.cardClass !== undefined}
				<ArkhamIcon icon={`[${section.cardClass}]` as ArkhamInlineIcon} />
				<span class="font-semibold">{stringUtils.cardClass(section.cardClass)}</span>
			{/if}
			<span class="text-primary-600 dark:text-primary-400 ml-auto text-xs">
				{sectionRemaining(section)} / {sectionTotal(section)}
			</span>
		</button>
		{#if !isCollapsed}
			<div class="mt-1 flex flex-wrap gap-1.5" transition:slide={{ duration: 150 }}>
				{#each section.entries as entry (entry.card.code)}
					{@const remaining = remainingOf(team, pool, entry.card.code)}
					<CardStack
						card={entry.card}
						source={collectionSource(entry)}
						{dnd}
						quantity={Math.max(remaining, 1)}
						maxQuantity={gridMaxQuantity}
						width={72}
						dimmed={remaining === 0}
						badge={remaining}
						draggable={remaining > 0}
						dragCopies={dragCopiesFor(entry, remaining)}
						onClick={(source) => {
							if (remaining > 0) onStackClick(source);
						}}
						onHover={onCardHover}
						onHoverEnd={onCardHoverEnd}
					/>
				{/each}
			</div>
		{/if}
	{/each}
</div>

<style>
	/* Constant-width transparent outline: showing/hiding the highlight can
	   never shift the layout, and the panel's own padding keeps it clear of
	   the content. */
	.return-target {
		outline: 3px solid transparent;
		outline-offset: 2px;
		transition:
			outline-color 120ms ease,
			background-color 120ms ease;
	}

	.return-eligible {
		outline-color: rgba(220, 38, 38, 0.85);
	}

	.return-eligible.hovering {
		outline-color: rgb(220, 38, 38);
		background-color: rgba(220, 38, 38, 0.06);
	}

	.chevron {
		display: inline-block;
	}
</style>
