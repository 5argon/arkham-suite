<!--
@component
Every investigator of the latest point of the Current environment as a card square, greyed out
when they can't take the card. Narrow screens start a row for each product, wide screens put the
Evergreen investigators on the first row and the rest on the second.
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { type Card } from '@5argon/arkham-kohaku';
	import { CardLineHoverTooltip, CardSquare } from '@5argon/arkham-life-ui';

	import type { CardUserSlot, CardUsers } from '$lib/server/card-users';

	interface Prop {
		users: CardUsers;
	}
	const { users }: Prop = $props();

	// Kept after leaving, so the tooltip can animate out like every other one.
	let hovered = $state<{ card: Card; element: HTMLElement } | null>(null);
	let visible = $state(false);

	function show(card: Card, event: Event) {
		hovered = { card, element: event.currentTarget as HTMLElement };
		visible = true;
	}

	function hide() {
		visible = false;
	}
</script>

{#snippet grid(columns: number, rows: CardUserSlot[][], className: string)}
	<div class="w-max gap-1.5 {className}" style="grid-template-columns: repeat({columns}, max-content);">
		{#each rows as row, i (i)}
			{#each row as slot (slot.card.code)}
				<a
					aria-label={slot.card.name}
					class="block rounded-sm"
					href={resolve('/review/card/[code]', { code: slot.card.code })}
					onblur={hide}
					onfocus={(event) => show(slot.card, event)}
					onmouseenter={(event) => show(slot.card, event)}
					onmouseleave={hide}
				>
					<CardSquare card={slot.card} greyedOut={!slot.canTake} />
				</a>
			{/each}
			{#each Array.from({ length: columns - row.length }, (_, j) => j) as j (j)}
				<div></div>
			{/each}
		{/each}
	</div>
{/snippet}

{@render grid(users.columns, users.rows, 'grid lg:hidden')}
{@render grid(users.wideColumns, users.wideRows, 'hidden lg:grid')}

<CardLineHoverTooltip card={hovered?.card} referenceElement={hovered?.element} {visible} />
