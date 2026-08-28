<!--
@component
Click-without-drag destination picker: the complete alternative to
drag-and-drop, and the primary path on touch devices. Each destination has an
adjustable copy count that starts from the current pick mode.
-->
<script lang="ts">
	import { CardScanFullTiny, Modal } from '@5argon/arkham-life-ui';
	import type { CardCode, CardResolver } from '@5argon/arkham-kohaku';

	import * as m from '$lib/paraglide/messages.js';
	import {
		computeMoveQuantity,
		deckLimitOf,
		availableOf,
		routeZone,
		titleCountInDeck,
		wantOf
	} from '$lib/tool/evergreen-team/rules';
	import type { EvergreenState, PoolEntry } from '$lib/tool/evergreen-team/types';

	import type { DragSource } from './dnd.svelte';
	import StackActionRow from './StackActionRow.svelte';

	interface Prop {
		team: EvergreenState;
		pool: Map<CardCode, PoolEntry>;
		eligibility: Map<CardCode, boolean[]>;
		resolver: CardResolver;
		/**
		 * Deck indices currently on the board (all, or the soloed subset).
		 */
		activeDeckIndices?: number[];
		source: DragSource | null;
		onClose: () => void;
		onMoveTo: (source: DragSource, deckIndex: number, quantity: number) => void;
		onReturn: (source: DragSource, quantity: number) => void;
	}
	const {
		team,
		pool,
		eligibility,
		resolver,
		activeDeckIndices,
		source,
		onClose,
		onMoveTo,
		onReturn
	}: Prop = $props();

	const card = $derived(source === null ? null : (pool.get(source.cardCode)?.card ?? null));
	const heldAtSource = $derived.by(() => {
		if (source === null) return 0;
		return source.kind === 'collection'
			? availableOf(team, pool, source.cardCode)
			: (team.decks[source.deckIndex]?.[source.zone][source.cardCode] ?? 0);
	});

	interface Row {
		deckIndex: number;
		investigator: ReturnType<CardResolver['resolve']>;
		count: number;
		size: number;
		defaultQuantity: number;
		maxQuantity: number;
		reason: string | null;
	}
	const rows = $derived.by((): Row[] => {
		if (source === null || card === null) return [];
		const titleKey = pool.get(source.cardCode)?.titleKey ?? '';
		return team.decks
			.map((deck, deckIndex) => {
				if (source.kind === 'deck' && source.deckIndex === deckIndex) return null;
				if (activeDeckIndices !== undefined && !activeDeckIndices.includes(deckIndex)) {
					return null;
				}
				const investigator = resolver.resolve(deck.investigator);
				const size = investigator.deckRequirements?.size ?? 30;
				const count = Object.values(deck.main).reduce((s, q) => s + q, 0);
				const canUse = eligibility.get(source.cardCode)?.[deckIndex] ?? false;
				const inTitle = titleCountInDeck(deck, pool, titleKey);
				const clamp = (want: number) =>
					computeMoveQuantity({
						want,
						remainingAtSource: heldAtSource,
						deckLimit: deckLimitOf(card),
						inTargetDeck: inTitle
					});
				const maxQuantity = clamp(deckLimitOf(card));
				const defaultQuantity = clamp(wantOf(team, card));
				let reason: string | null = null;
				if (!canUse) {
					reason = m.tool_evergreen_team_reason_cannot_use();
				} else if (maxQuantity === 0) {
					reason =
						inTitle >= deckLimitOf(card)
							? m.tool_evergreen_team_reason_deck_limit()
							: m.tool_evergreen_team_reason_none_remaining();
				}
				return { deckIndex, investigator, count, size, defaultQuantity, maxQuantity, reason };
			})
			.filter((row): row is Row => row !== null);
	});
</script>

<Modal isOpen={source !== null} {onClose} maxWidth="md" title={card?.name ?? ''}>
	{#if source !== null && card !== null}
		{#key `${source.kind}:${source.cardCode}`}
			<div class="flex flex-col items-center gap-3">
				<CardScanFullTiny {card} eager hideQuantity width={220} />
				<div class="flex w-full flex-col gap-1.5">
					{#each rows as row (row.deckIndex)}
						<StackActionRow
							investigator={row.investigator}
							count={row.count}
							size={row.size}
							defaultQuantity={row.defaultQuantity}
							maxQuantity={row.maxQuantity}
							reason={row.reason}
							toSide={routeZone(card) === 'side'}
							label={(n) =>
								source.kind === 'collection'
									? m.tool_evergreen_team_add_n({ n })
									: m.tool_evergreen_team_move_n({ n })}
							onConfirm={(n) => {
								onMoveTo(source, row.deckIndex, n);
								onClose();
							}}
						/>
					{/each}
					{#if source.kind === 'deck' && heldAtSource > 0}
						<StackActionRow
							investigator={resolver.resolve(team.decks[source.deckIndex].investigator)}
							defaultQuantity={Math.min(wantOf(team, card), heldAtSource)}
							maxQuantity={heldAtSource}
							reason={null}
							label={(n) => m.tool_evergreen_team_return_n({ n })}
							onConfirm={(n) => {
								onReturn(source, n);
								onClose();
							}}
						/>
					{/if}
				</div>
			</div>
		{/key}
	{/if}
</Modal>
