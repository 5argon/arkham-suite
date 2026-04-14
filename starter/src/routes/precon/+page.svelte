<script lang="ts">
	import { PageLead, TextParagraph } from '@5argon/arkham-life-ui';
	import { createCardResolver } from '$lib/card-data';
	import PreconListBanner from './PreconListBanner.svelte';

	const cardResolver = createCardResolver();

	const investigators = [
		{ code: '12001', slug: 'daniela' },
		{ code: '12004', slug: 'joe' },
		{ code: '12007', slug: 'trish' },
		{ code: '12010', slug: 'dexter' },
		{ code: '12013', slug: 'isabelle' }
	] as const;

	const resolvedInvestigators = investigators.map((inv) => ({
		card: cardResolver.resolve(inv.code),
		slug: inv.slug,
		imageUrl: `/image/precon/${inv.slug}.webp`
	}));
</script>

<svelte:head>
	<title>Precon In-Depth</title>
</svelte:head>

<PageLead title="Precon In-Depth" image="/image/resource/precon.webp" />

<div class="mx-auto max-w-4xl px-4 py-6">
	<TextParagraph>
		Just opened your Core Set 2026 box, picked your first investigator, and is looking for longer
		read than provided in the play guide to get the most out of it? This guide is a comprehensive
		reviews for each card's interaction with this investigator, and other teammates <strong
			>all assuming using precon decks</strong
		>.
    </TextParagraph>

	<TextParagraph>
		The design of preconstructed decks is that they give each one each of <strong
			>all possible</strong
		>
		class-colored Lv. 0 cards in the game that the investigator could access. It is great to learn the
		core set player card text together as a team as they come up. The higher the player count, the more
		possible fun combo and moments could be realized due to everyone having a bit of everything.
	</TextParagraph>

	<TextParagraph>
		The common advice was "precon sucks" and a modification is needed even before your first play.
		But I've tried them as-is and the above's advantage can't be underestimated especially in 3~4
		players. It's a lot of fun to cover each other's inconsistencies, too see clearly which one you
		are going to cut or add more in your upcoming first time deckbuilding, and you definitely learn
		a lot more multiplayer interactions in one short session. <strong
			>Two players and above, I highly recommended just using the pre-con and see the magic works
			out.</strong
		> In Core 2026 I suggest modifying the deck immediately only if you are playing solo.
	</TextParagraph>

	<div class="flex flex-col gap-4">
		{#each resolvedInvestigators as inv (inv.card.code)}
			<PreconListBanner card={inv.card} imageUrl={inv.imageUrl} href="/precon/{inv.slug}" />
		{/each}
	</div>
</div>
