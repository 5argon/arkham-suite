<!--
@component
A review written for this site, there to be read right where it is. The heading of a part about
certain cards is their card lines in a divider.
-->
<script lang="ts">
	import type { Card } from '@5argon/arkham-kohaku';

	import '../card/deck-description.css';
	import CardLine from '../card/CardLine.svelte';
	import CardLinkArea from '../card/CardLinkArea.svelte';
	import FaIcon from '../icon/FaIcon.svelte';
	import { FaIconType } from '../icon/fa-icon-type.js';
	import * as m from '../paraglide/messages.js';
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
	}
	const { entry, parts, resolveCard, resolveText }: Prop = $props();

	function siteOf(url: string): string {
		return new URL(url).hostname.replace(/^www\./, '');
	}

	function isVideo(url: string): boolean {
		return /(^|\.)(youtube\.com|youtu\.be|twitch\.tv)$/.test(siteOf(url));
	}
</script>

<article class="[&_[id]]:scroll-mt-4">
	<header class="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
		<span class="flex min-w-0 flex-1 basis-48 items-center gap-2">
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
				<div class="prose dark:prose-invert description-content max-w-none">
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html part.html}
				</div>
			{:else}
				<div class="mt-4 mb-2">
					<SectionSeparator id={part.anchor} inner level={part.level}>
						<span class="mb-0.5 flex flex-col items-start">
							{#each part.codes as code (code)}
								{@const card = resolveCard(code)}
								{#if card}
									<button
										class="card-link hover:bg-primary-300/30 dark:hover:bg-primary-800/60 max-w-full cursor-pointer rounded-sm"
										data-card-code={code}
										type="button"
									>
										<CardLine {card} hideQuantity />
									</button>
								{/if}
							{/each}
							{#if part.title}
								<span class="font-semibold">{part.title}</span>
							{/if}
						</span>
					</SectionSeparator>
				</div>
			{/if}
		{/each}
	</CardLinkArea>
</article>
