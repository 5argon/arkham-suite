<!--
@component
The main drafting board: investigator drop areas on the left, the shared
collection on the right (stacking to top/bottom on narrow screens), with a
readiness strip on top. All quantity bookkeeping goes through the reducers in
rules.ts, shared by drag-drop and the click picker.
-->
<script lang="ts">
	import { CardLineHoverTooltip } from '@5argon/arkham-life-ui';
	import type { Card } from '@5argon/arkham-kohaku';
	import { SvelteSet } from 'svelte/reactivity';

	import { createCardResolver, getAllCards } from '$lib/card-data';
	import * as m from '$lib/paraglide/messages.js';
	import { encodeEvergreen } from '$lib/tool/evergreen-team/codec';
	import { buildPool } from '$lib/tool/evergreen-team/pool';
	import {
		buildEligibility,
		moveBetweenDecks,
		moveToDeck,
		returnToCollection
	} from '$lib/tool/evergreen-team/rules';
	import { deckMetaFor } from '$lib/tool/evergreen-team/team-info';
	import type { EvergreenFocus, EvergreenState, TeamInfo } from '$lib/tool/evergreen-team/types';

	import CollectionPanel from './CollectionPanel.svelte';
	import { DRAG_MIME, type DragSource, EvergreenDnd } from './dnd.svelte';
	import ExportTeamModal from './ExportTeamModal.svelte';
	import InvestigatorArea from './InvestigatorArea.svelte';
	import ShareExportBar from './ShareExportBar.svelte';
	import StackActionModal from './StackActionModal.svelte';
	import TeamInfoModal from './TeamInfoModal.svelte';
	import TeamStatusBar from './TeamStatusBar.svelte';

	interface Prop {
		team: EvergreenState;
		/**
		 * Discards the whole team and returns to setup.
		 */
		onDeleteTeam: () => void;
		/**
		 * Called after every deck mutation, for URL/localStorage persistence.
		 */
		onChange?: () => void;
	}
	const { team, onDeleteTeam, onChange }: Prop = $props();

	const allCards = getAllCards();
	const resolver = createCardResolver();
	// Setup is immutable once planning starts, so the pool and per-player
	// eligibility are computed exactly once.
	const getFrozenSetup = () => team.setup;
	const pool = buildPool(getFrozenSetup(), allCards);
	const eligibility = buildEligibility(
		getFrozenSetup().investigators.map((code) => resolver.resolve(code)),
		pool
	);

	const dnd = new EvergreenDnd();
	let pickerSource = $state<DragSource | null>(null);
	let showExport = $state(false);
	let showInfo = $state(false);
	const encodedNow = $derived(encodeEvergreen($state.snapshot(team) as EvergreenState));
	const deckMeta = $derived(
		deckMetaFor(team, resolver, `https://arkham-starter.com/tool/team-builder?t=${encodedNow}`)
	);

	function saveInfo(info: TeamInfo) {
		team.info = info;
		showInfo = false;
		onChange?.();
	}

	// Undo history: snapshots of the decks only (pick mode and view toggles
	// are not part of it). One committed mutation - a drop, a picker action,
	// a section clear, a whole class sweep, or Start Over - is one step.
	type DeckSnapshot = {
		investigator: string;
		main: Record<string, number>;
		side: Record<string, number>;
	}[];
	const HISTORY_LIMIT = 100;
	// $state.raw: history arrays are replaced wholesale and their snapshots
	// must stay plain (deep proxies cannot be structuredCloned).
	let past = $state.raw<DeckSnapshot[]>([]);
	let future = $state.raw<DeckSnapshot[]>([]);

	function snapshotDecks(): DeckSnapshot {
		return structuredClone($state.snapshot(team.decks)) as DeckSnapshot;
	}

	function restoreDecks(snapshot: DeckSnapshot) {
		team.decks.forEach((deck, i) => {
			deck.main = structuredClone(snapshot[i].main);
			deck.side = structuredClone(snapshot[i].side);
		});
	}

	/**
	 * Runs one user action as one undo step; no-op mutations record nothing.
	 */
	function commit(mutate: () => void) {
		const before = snapshotDecks();
		mutate();
		const after = snapshotDecks();
		if (JSON.stringify(before) !== JSON.stringify(after)) {
			past = [...past.slice(-(HISTORY_LIMIT - 1)), before];
			future = [];
		}
		onChange?.();
	}

	function undo() {
		if (past.length === 0) return;
		const current = snapshotDecks();
		restoreDecks(past[past.length - 1]);
		past = past.slice(0, -1);
		future = [...future, current];
		onChange?.();
	}

	function redo() {
		if (future.length === 0) return;
		const current = snapshotDecks();
		restoreDecks(future[future.length - 1]);
		future = future.slice(0, -1);
		past = [...past, current];
		onChange?.();
	}

	function handleKeydown(ev: KeyboardEvent) {
		if (!(ev.metaKey || ev.ctrlKey) || ev.key.toLowerCase() !== 'z') return;
		const target = ev.target as HTMLElement | null;
		if (target?.closest('input, textarea, [contenteditable]')) return;
		ev.preventDefault();
		if (ev.shiftKey) {
			redo();
		} else {
			undo();
		}
	}

	function applyMove(source: DragSource, deckIndex: number, quantity?: number) {
		commit(() => {
			// Class pickup mode: a collection drag sweeps its whole class group
			// in; members the target investigator cannot use stay behind.
			const codes =
				source.kind === 'collection' && source.classGroup !== undefined && team.pickMode === 'class'
					? source.classGroup
					: [source.cardCode];
			for (const code of codes) {
				const entry = pool.get(code);
				if (entry === undefined) continue;
				if (codes.length > 1 && !(eligibility.get(code)?.[deckIndex] ?? false)) continue;
				if (source.kind === 'collection') {
					moveToDeck(team, pool, entry.card, deckIndex, quantity);
				} else {
					moveBetweenDecks(
						team,
						pool,
						entry.card,
						source.deckIndex,
						source.zone,
						deckIndex,
						quantity
					);
				}
			}
		});
	}

	function applyReturn(source: DragSource, quantity?: number) {
		if (source.kind !== 'deck') return;
		commit(() => {
			// Class pickup mode works inversely: one grabbed card returns its
			// whole class group from that zone.
			const codes =
				source.classGroup !== undefined && team.pickMode === 'class'
					? source.classGroup
					: [source.cardCode];
			for (const code of codes) {
				const entry = pool.get(code);
				if (entry === undefined) continue;
				returnToCollection(team, entry.card, source.deckIndex, source.zone, quantity);
			}
		});
	}

	function clearZone(deckIndex: number, zone: 'main' | 'side') {
		const deck = team.decks[deckIndex];
		if (deck === undefined) return;
		commit(() => {
			deck[zone] = {};
		});
	}

	// A card dragged out of a deck returns to the collection when dropped
	// anywhere that is not a deck area - the collection panel, empty board
	// space, the toolbar. Deck areas keep their own rules (an ineligible,
	// greyed-out deck stays a no-op).
	function isInsideDeckArea(ev: DragEvent): boolean {
		const target = ev.target as HTMLElement | null;
		return target?.closest?.('.area') != null;
	}

	function handleWindowDragOver(ev: DragEvent) {
		if (dnd.active?.kind !== 'deck' || isInsideDeckArea(ev)) return;
		if (!(ev.dataTransfer?.types.includes(DRAG_MIME) ?? false)) return;
		ev.preventDefault();
		if (ev.dataTransfer) ev.dataTransfer.dropEffect = 'move';
	}

	function handleWindowDrop(ev: DragEvent) {
		// Inner drop targets (the collection panel, deck areas) run first and
		// end the drag; by the time this fires for them, nothing is active.
		if (dnd.active?.kind !== 'deck' || isInsideDeckArea(ev)) return;
		ev.preventDefault();
		const parsed = EvergreenDnd.parsePayload(ev.dataTransfer);
		if (parsed?.kind === 'deck' && parsed.cardCode === dnd.active.cardCode) {
			applyReturn(parsed);
		}
		dnd.endDrag();
	}

	// Focus: a view filter over one aspect (hand, ally, skill) applied to both
	// the collection and the decks; counts are never affected.
	let focus = $state<EvergreenFocus>('none');

	// Collection visibility: hiding it gives the decks the full width, for
	// shuffling cards between members without the collection in the way.
	let showCollection = $state(true);

	function handleStartOver() {
		if (!window.confirm(m.tool_evergreen_team_start_over_confirm())) return;
		commit(() => {
			for (const deck of team.decks) {
				deck.main = {};
				deck.side = {};
			}
		});
	}

	// Solo view state: when any member is soloed, only those areas render,
	// bringing far-apart decks closer for drag and drop.
	const soloIndices = new SvelteSet<number>();
	function toggleSolo(deckIndex: number) {
		if (soloIndices.has(deckIndex)) {
			soloIndices.delete(deckIndex);
		} else {
			soloIndices.add(deckIndex);
		}
	}
	const visibleDeckIndices = $derived(
		team.decks
			.map((_, deckIndex) => deckIndex)
			.filter((deckIndex) => soloIndices.size === 0 || soloIndices.has(deckIndex))
	);

	// Card name tooltip: tiny scans are hard to read at this size.
	let tooltipCard = $state<Card | null>(null);
	let tooltipEl = $state<HTMLElement | null>(null);
	function handleCardHover(card: Card, el: HTMLElement) {
		tooltipCard = card;
		tooltipEl = el;
	}
	function handleCardHoverEnd() {
		tooltipCard = null;
	}
</script>

<svelte:window
	ondragend={() => dnd.endDrag()}
	ondragover={handleWindowDragOver}
	ondrop={handleWindowDrop}
	onkeydown={handleKeydown}
/>

<!-- Counteracts the site Main's reading padding: a two-panel board wants near edge-to-edge width. -->
<div class="sm:-mx-5 md:-mx-7 lg:-mx-11 xl:-mx-[60px]">
	<div class="flex flex-wrap items-center justify-between gap-2">
		<TeamStatusBar {team} {resolver} {soloIndices} onToggleSolo={toggleSolo} />
		<ShareExportBar
			encoded={encodedNow}
			collectionVisible={showCollection}
			canUndo={past.length > 0}
			canRedo={future.length > 0}
			onUndo={undo}
			onRedo={redo}
			onToggleCollection={() => (showCollection = !showCollection)}
			onExport={() => (showExport = true)}
			onEditInfo={() => (showInfo = true)}
			onStartOver={handleStartOver}
			{onDeleteTeam}
		/>
	</div>

	<div class="evergreen-layout">
		<div class="decks-panel-outer">
			<div class="decks-panel">
				<div class="grid min-w-0 gap-2">
					{#each visibleDeckIndices as deckIndex (team.decks[deckIndex].investigator)}
						<InvestigatorArea
							{team}
							{deckIndex}
							{pool}
							{eligibility}
							{dnd}
							{resolver}
							{focus}
							onStackClick={(source) => (pickerSource = source)}
							onDropFrom={applyMove}
							onClearZone={clearZone}
							onCardHover={handleCardHover}
							onCardHoverEnd={handleCardHoverEnd}
						/>
					{/each}
				</div>
			</div>
		</div>
		{#if showCollection}
			<div class="collection-panel-outer">
				<div class="collection-panel">
					<CollectionPanel
						{team}
						{pool}
						{eligibility}
						activeDeckIndices={visibleDeckIndices}
						{focus}
						onFocusChange={(next) => (focus = next)}
						{dnd}
						{onChange}
						onStackClick={(source) => (pickerSource = source)}
						onDropReturn={applyReturn}
						onCardHover={handleCardHover}
						onCardHoverEnd={handleCardHoverEnd}
					/>
				</div>
			</div>
		{/if}
	</div>
</div>

{#if tooltipCard}
	<CardLineHoverTooltip card={tooltipCard} visible={true} referenceElement={tooltipEl} />
{/if}

<StackActionModal
	{team}
	{pool}
	{eligibility}
	{resolver}
	activeDeckIndices={visibleDeckIndices}
	source={pickerSource}
	onClose={() => (pickerSource = null)}
	onMoveTo={applyMove}
	onReturn={applyReturn}
/>

{#if showInfo}
	<TeamInfoModal
		info={team.info}
		isOpen={true}
		onSave={saveInfo}
		onClose={() => (showInfo = false)}
	/>
{/if}

<ExportTeamModal
	{team}
	{resolver}
	{deckMeta}
	isOpen={showExport}
	onClose={() => (showExport = false)}
/>

<style>
	.evergreen-layout {
		display: flex;
		flex-direction: row;
		gap: 8px;
		margin-top: 0.5rem;
		justify-content: center;
		align-items: flex-start;
	}

	.decks-panel-outer {
		flex: 1 1 auto;
		min-width: 0;
		max-width: 980px;
	}

	/* Inner padding keeps the drop-target outlines from being clipped at the
	   scroll container's edges; overflow-x is never allowed - content wraps. */
	.decks-panel {
		height: calc(100vh - 140px);
		overflow-y: auto;
		overflow-x: hidden;
		padding: 8px;
	}

	/* The collection flexes between ~5 and ~8 stacks per row so the side-by-side
	   layout survives a not-quite-maximized browser window. */
	.collection-panel-outer {
		flex: 0 0 clamp(420px, 42%, 660px);
	}

	.collection-panel {
		height: calc(100vh - 140px);
		overflow-y: auto;
		overflow-x: hidden;
		padding: 8px;
	}

	@media (max-width: 1100px) {
		.evergreen-layout {
			flex-direction: column;
			align-items: stretch;
		}

		.decks-panel-outer {
			max-width: none;
		}

		/* Stacked layout: both panels keep their own scrollbar so dragging
		   between them never depends on page scroll. */
		.decks-panel {
			height: 45vh;
		}

		.collection-panel-outer {
			width: auto;
		}

		.collection-panel {
			height: 50vh;
		}
	}
</style>
