<!--
@component
A review written for this site, there to be read right where it is. The heading of a part about
certain cards is their card lines in a divider.
-->
<script lang="ts">
	import type { Card } from '@5argon/arkham-kohaku';

	import '../card/deck-description.css';
	import CardLine from '../card/CardLine.svelte';
	import Button from '../button/Button.svelte';
	import CardLinkArea from '../card/CardLinkArea.svelte';
	import FaIcon from '../icon/FaIcon.svelte';
	import { FaIconType } from '../icon/fa-icon-type.js';
	import * as m from '../paraglide/messages.js';
	import TimingDiagram from '../rules/TimingDiagram.svelte';
	import SectionSeparator from '../typography/SectionSeparator.svelte';
	import EnvironmentPoint from './EnvironmentPoint.svelte';
	import PersonAvatar from './PersonAvatar.svelte';
	import ReviewDate from './ReviewDate.svelte';
	import type { CardTextHtml, ReviewRowData, WrittenReviewPart } from './review-entry.js';

	interface Prop {
		entry: ReviewRowData;
		parts: WrittenReviewPart[];
		resolveCard: (code: string) => Card | undefined;
		/**
		 * The text of a linked card, shown when hovering it.
		 */
		resolveText?: (code: string) => CardTextHtml | undefined;
		/**
		 * Goes back up to the page's list of reviews, from the heading of each part about certain cards.
		 */
		onBackToContents?: () => void;
	}
	const { entry, parts, resolveCard, resolveText, onBackToContents }: Prop = $props();

	const cardLineLinkClass =
		'card-link hover:bg-primary-300/30 dark:hover:bg-primary-800/60 max-w-full cursor-pointer rounded-sm';

	function siteOf(url: string): string {
		return new URL(url).hostname.replace(/^www\./, '');
	}

	function isVideo(url: string): boolean {
		return /(^|\.)(youtube\.com|youtu\.be|twitch\.tv)$/.test(siteOf(url));
	}
</script>

{#snippet backToContents(onClick: () => void)}
	<Button hideLabel icon={FaIconType.ArrowUp} label={m.card_review_back_to_contents()} {onClick} />
{/snippet}

<article class="[&_[id]]:scroll-mt-4">
	<header class="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
		<span class="flex min-w-0 flex-1 basis-24 items-center gap-2">
			<PersonAvatar person={entry.person} size="sm" />
			{#if entry.person.href}
				<!-- eslint-disable svelte/no-navigation-without-resolve -->
				<a
					class="text-primary-900 dark:text-primary-100 font-semibold"
					href={entry.person.href}
					rel={entry.person.href.startsWith('http') ? 'noopener' : undefined}
					target={entry.person.href.startsWith('http') ? '_blank' : undefined}
				>
					{entry.person.name}
				</a>
				<!-- eslint-enable svelte/no-navigation-without-resolve -->
			{:else}
				<span class="text-primary-900 dark:text-primary-100 font-semibold">{entry.person.name}</span>
			{/if}
		</span>
		<span class="ml-auto flex shrink-0 items-center gap-2">
			{#if entry.environment}
				<EnvironmentPoint environment={entry.environment} />
			{/if}
			{#if entry.dateLabel}
				<ReviewDate date={entry.dateLabel} />
			{/if}
			{#if onBackToContents}
				{@render backToContents(onBackToContents)}
			{/if}
		</span>
	</header>
	{#if entry.originalUrl}
		<!-- eslint-disable svelte/no-navigation-without-resolve -->
		<a
			class="border-primary-300 bg-primary-100/60 text-primary-900 hover:bg-primary-200/60 dark:border-primary-700 dark:bg-primary-900/40 dark:text-primary-100 dark:hover:bg-primary-800/60 mb-3 flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
			href={entry.originalUrl}
			rel="noopener"
			target="_blank"
		>
			<FaIcon icon={isVideo(entry.originalUrl) ? FaIconType.Video : FaIconType.Article} />
			<span class="min-w-0 flex-1">
				{m.card_review_originally_on({ site: siteOf(entry.originalUrl) })}
			</span>
			<FaIcon icon={FaIconType.ExternalLink} />
		</a>
		<!-- eslint-enable svelte/no-navigation-without-resolve -->
	{/if}
	<CardLinkArea {resolveCard} {resolveText}>
		{#each parts as part, i (i)}
			{#if part.kind === 'text'}
				<!-- Quotes in a review are only ever rules. -->
				<div class="prose dark:prose-invert description-content rule-snippets max-w-none">
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html part.html}
				</div>
			{:else if part.kind === 'timing'}
				<TimingDiagram timing={part.timing} />
			{:else}
				<div class="mt-4 mb-2">
					<SectionSeparator id={part.anchor} inner level={part.level}>
						<span class="flex items-end gap-2">
							<span class="mb-0.5 flex min-w-0 flex-1 flex-col items-start">
								{#each part.codes as code (code)}
									{@const card = resolveCard(code)}
									{@const href = part.hrefs?.[code]}
									{#if card && href}
										<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
										<a class={cardLineLinkClass} data-card-code={code} {href}>
											<CardLine {card} hideQuantity />
										</a>
									{:else if card}
										<button class={cardLineLinkClass} data-card-code={code} type="button">
											<CardLine {card} hideQuantity />
										</button>
									{/if}
								{/each}
								{#if part.title}
									<span class="font-semibold">{part.title}</span>
								{/if}
							</span>
							{#if onBackToContents}
								<span class="mb-1 shrink-0">{@render backToContents(onBackToContents)}</span>
							{/if}
						</span>
					</SectionSeparator>
				</div>
			{/if}
		{/each}
	</CardLinkArea>
</article>
