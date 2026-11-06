<script lang="ts">
	import { CardClass, CardResolver, CardType, Product } from '@5argon/arkham-kohaku';

	import CardLine from '$lib/card/CardLine.svelte';
	import TemporaryCardLine from '$lib/card/TemporaryCardLine.svelte';
	import CardTextBlock from '$lib/review/CardTextBlock.svelte';
	import EnvironmentPoint from '$lib/review/EnvironmentPoint.svelte';
	import ReviewCounts from '$lib/review/ReviewCounts.svelte';
	import ReviewList from '$lib/review/ReviewList.svelte';
	import ReviewRow from '$lib/review/ReviewRow.svelte';
	import WrittenReview from '$lib/review/WrittenReview.svelte';
	import type { EnvironmentDisplay, ReviewRowData } from '$lib/review/review-entry';

	import { allCards } from '../card-data';

	const resolver = new CardResolver(allCards);
	const member = resolver.resolve('01001');
	const investigator = resolver.resolve('02001');
	const reviewed = resolver.resolve('01020');

	const evergreen: EnvironmentDisplay = {
		label: 'Evergreen',
		description: 'Evergreen Products'
	};
	const past: EnvironmentDisplay = {
		slots: ['potd', null, 'nxt', null],
		description: 'Current Environment : Power of the Dreamlands'
	};
	const full: EnvironmentDisplay = {
		slots: ['potd', 'abc', 'nxt', 'def'],
		description: 'Current Environment : Saturated',
		detail: {
			since: 'Feb 19, 2027',
			slots: [
				{ product: Product.PowerOfTheDreamlands, href: '#' },
				{ product: Product.ChildrenOfBlood },
				{ product: Product.TheDrownedCityInvestigatorExpansion, href: '#' },
				null
			],
			defining: [Product.PowerOfTheDreamlands],
			pushedOut: [{ product: Product.TheFeastOfHemlockValeInvestigatorExpansion, href: '#' }],
			evergreen: [
				{ product: Product.CoreSet2026, href: '#' },
				{ product: Product.TommyMuldoon, href: '#' },
				{ product: Product.CarolynFern, href: '#' },
				{ product: Product.AndrePatel, href: '#' },
				{ product: Product.MarieLambeau, href: '#' },
				{ product: Product.MiguelDeLaCruz, href: '#' }
			],
			roster: [member, investigator, resolver.resolve('01002'), resolver.resolve('01003')]
		}
	};

	const rows: ReviewRowData[] = [
		{
			id: 'written',
			medium: 'text',
			person: { name: 'A Contributor', avatarCard: member },
			environment: evergreen
		},
		{
			id: 'plain',
			medium: 'text',
			person: { name: 'A Contributor', avatarCard: member },
			title: 'A review with a date',
			environment: past,
			dateLabel: 'Mar 2, 2027'
		},
		{
			id: 'video',
			medium: 'video',
			person: { name: 'A Guest With An Image', avatarUrl: '/image/resource/review.webp' },
			title: 'A long video about several cards',
			environment: full,
			dateLabel: 'Feb 19, 2028',
			startLabel: '12:34',
			languageLabel: 'Spanish'
		},
		{
			id: 'article',
			medium: 'text',
			person: { name: 'A Guest With No Picture' },
			title: 'An article this row goes straight to',
			environment: evergreen,
			dateLabel: 'Oct 22, 2026',
			externalHref: 'https://example.com'
		},
		{
			id: 'preview',
			medium: 'audio',
			person: { name: 'A Creator' },
			title: 'From before the cards were sold',
			preview: true,
			dateLabel: 'Nov 6, 2025'
		},
		{
			id: 'joke',
			medium: 'text',
			person: { name: 'A Joker' },
			title: 'A satirical piece',
			humor: true,
			environment: evergreen,
			dateLabel: 'Oct 22, 2026',
			externalHref: 'https://example.com'
		},
		{
			id: 'official',
			medium: 'text',
			person: { name: 'The Publisher' },
			official: true,
			preview: true,
			dateLabel: 'Nov 13, 2025'
		}
	];
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-col gap-2">
		<EnvironmentPoint environment={evergreen} />
		<EnvironmentPoint environment={past} />
		<EnvironmentPoint environment={full} />
	</div>

	<div class="flex flex-col">
		<CardLine card={reviewed} hideQuantity />
		<TemporaryCardLine
			card={{
				name: 'Revealed Asset',
				cardType: CardType.Asset,
				cardClass: { class1: CardClass.Guardian },
				xp: 2
			}}
		/>
		<TemporaryCardLine
			card={{
				name: 'Revealed Multiclass Event',
				cardType: CardType.Event,
				cardClass: { class1: CardClass.Seeker, class2: CardClass.Rogue }
			}}
		/>
		<TemporaryCardLine
			card={{
				name: 'Revealed Mystic Skill',
				cardType: CardType.Skill,
				cardClass: { class1: CardClass.Mystic },
				xp: 5
			}}
		/>
	</div>

	<ReviewCounts counts={{ written: 2, external: 12 }} />
	<ReviewCounts counts={{ written: 0, external: 1 }} />

	<ReviewList>
		{#each rows as entry (entry.id)}
			<ReviewRow {entry} />
		{/each}
	</ReviewList>

	<ReviewList>
		{#each rows as entry (entry.id)}
			<ReviewRow {entry} href="#{entry.id}">
				{#snippet lead()}
					<CardLine card={reviewed} hideQuantity />
				{/snippet}
			</ReviewRow>
		{/each}
	</ReviewList>

	<WrittenReview
		entry={{ ...rows[1], originalUrl: 'https://arkhamdb.com/card/01020' }}
		parts={[
			{
				kind: 'text',
				html: "<p>A review written for this site, with a <span class='card-link' data-card-code='01020'>card link</span>.</p>"
			},
			{ kind: 'cards', anchor: 'preview-part', level: 2, codes: ['01020'], title: 'With words' },
			{ kind: 'text', html: '<p>A part about one card.</p>' }
		]}
		resolveCard={(code) => resolver.resolve(code)}
	/>

	<div class="max-w-80">
		<CardTextBlock
			side={{
				traits: 'Item. Weapon.',
				text: '<p><b>Fight.</b> Text with a <span class="icon-reaction"></span> icon.</p><p>A second line.</p>',
				flavor: '<p>Some flavor text.</p>'
			}}
		/>
	</div>
</div>
