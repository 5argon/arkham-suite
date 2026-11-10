<script lang="ts">
	import { replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import {
		Button,
		CardLine,
		FaIconType,
		MarginFull,
		Modal,
		ReviewList,
		ReviewRow,
		TextParagraph,
		WrittenReview,
		type WrittenReviewPart
	} from '@5argon/arkham-life-ui';

	import OpenGraph from '$lib/components/OpenGraph.svelte';
	import ReviewBuildQlPresets from '$lib/design/pages/review/ReviewBuildQlPresets.svelte';
	import ReviewCardAside from '$lib/design/pages/review/ReviewCardAside.svelte';
	import ReviewCardUsers from '$lib/design/pages/review/ReviewCardUsers.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { reviewCardHref } from '$lib/review/paths';

	import type { PageProps } from './$types';

	const { data }: PageProps = $props();
	const card = $derived(data.card);
	const written = $derived(data.entries.filter((entry) => entry.parts !== undefined));
	const external = $derived(data.entries.filter((entry) => entry.parts === undefined));
	const contentsId = 'review-contents';

	/**
	 * How many of the newest a long list shows, the rest a press away.
	 */
	const shownCount = 5;
	let allOpen = $state<'external' | 'insights' | null>(null);

	/**
	 * Scrolls without navigating, so the back button keeps leading to where they came from.
	 */
	function jumpTo(id: string, event?: MouseEvent) {
		if (event?.metaKey || event?.ctrlKey || event?.shiftKey) return;
		event?.preventDefault();
		document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		replaceState(`#${id}`, page.state);
	}

	type CardsPart = Extract<WrittenReviewPart, { kind: 'cards' }>;
	/**
	 * The parts of a review about certain cards, for the contents to list under it.
	 */
	function subsectionsOf(entry: (typeof written)[number]): CardsPart[] {
		return (entry.parts ?? []).filter((part): part is CardsPart => part.kind === 'cards');
	}

	const resolveCard = (code: string) => data.mentioned[code];
	const resolveText = (code: string) => data.mentionedText[code];
</script>

{#snippet externalList(entries: typeof external)}
	<ReviewList>
		{#each entries as entry (entry.id)}
			<ReviewRow {entry} />
		{/each}
	</ReviewList>
{/snippet}

{#snippet insightList(insights: typeof data.insights)}
	<ReviewList>
		{#each insights as insight, i (i)}
			<ReviewRow entry={insight.entry} href={insight.href}>
				{#snippet lead()}
					<CardLine card={insight.card} hideQuantity />
				{/snippet}
			</ReviewRow>
		{/each}
	</ReviewList>
{/snippet}

{#snippet seeAll(count: number, list: 'external' | 'insights')}
	{#if count > shownCount}
		<div class="mt-2 flex justify-center">
			<Button label={m.review_see_all({ count })} onClick={() => (allOpen = list)} />
		</div>
	{/if}
{/snippet}

<OpenGraph
	description={data.seo.description}
	image={data.seo.image}
	jsonLd={data.seo.jsonLd}
	noindex={data.entries.length === 0 && data.insights.length === 0}
	title={data.seo.title}
	url={reviewCardHref(card.code)}
	canonical
/>

<MarginFull>
	<div class="flex flex-col gap-6 md:flex-row md:items-start">
		<ReviewCardAside
			arkhamBuildUrl={data.arkhamBuildUrl}
			arkhamdbReviewsUrl={data.arkhamdbReviewsUrl}
			{card}
			text={data.text}
		/>

		<div class="flex min-w-0 flex-1 flex-col gap-8">
			{#if data.entries.length === 0 && data.insights.length === 0}
				<TextParagraph>{m.review_empty()}</TextParagraph>
			{/if}

			{#if data.users}
				<section>
					<h2 class="text-primary-900 dark:text-primary-100 mb-2 text-xl">{m.review_users()}</h2>
					<ReviewCardUsers users={data.users} />
				</section>
			{/if}

			{#if data.buildQl.length > 0}
				<section>
					<h2 class="text-primary-900 dark:text-primary-100 mb-2 flex items-center gap-2 text-xl">
						{m.review_buildql()}
						<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
						<a
							aria-label={m.review_buildql_help()}
							class="border-primary-400 text-primary-800 hover:bg-primary-200/60 dark:border-primary-600 dark:text-primary-200 dark:hover:bg-primary-800/60 flex h-6 w-6 items-center justify-center rounded-full border font-sans text-sm"
							href="https://github.com/arkham-build/arkham.build/blob/main/frontend/src/store/lib/buildql/buildql.md#buildql"
							rel="noopener"
							target="_blank"
							title={m.review_buildql_help()}>?</a
						>
					</h2>
					<ReviewBuildQlPresets topics={data.buildQl} />
				</section>
			{/if}

			{#if external.length > 0}
				<section>
					<h2 class="text-primary-900 dark:text-primary-100 mb-2 text-xl">
						{m.review_section_external()}
					</h2>
					{@render externalList(external.slice(0, shownCount))}
					{@render seeAll(external.length, 'external')}
				</section>
				<Modal
					isOpen={allOpen === 'external'}
					maxWidth="lg"
					onClose={() => (allOpen = null)}
					title={m.review_section_external()}
				>
					{@render externalList(external)}
				</Modal>
			{/if}

			{#if written.length > 0}
				<section id={contentsId} class="scroll-mt-4">
					<h2 class="text-primary-900 dark:text-primary-100 mb-2 text-xl">
						{m.review_section_written()}
					</h2>
					<ReviewList>
						{#each written as entry (entry.id)}
							{@const subsections = subsectionsOf(entry)}
							<ReviewRow
								{entry}
								href="#{entry.id}"
								onLinkClick={(event) => jumpTo(entry.id, event)}
							>
								{#snippet below()}
									{#if subsections.length > 0}
										<div class="mt-1 mb-0.5 ml-1 flex items-start gap-2">
											<span
												class="text-primary-700 dark:text-primary-300 shrink-0 pt-1 text-[0.65rem] font-semibold"
											>
												{m.review_contents_interactions()}
											</span>
											<!-- Each part about certain cards, in order, at one level whatever heading the author used. -->
											<ul
												class="border-primary-300 dark:border-primary-700 flex min-w-0 flex-col gap-0.5 border-l pl-2"
											>
												{#each subsections as part (part.anchor)}
													<li>
														<a
															class="hover:bg-primary-300/30 dark:hover:bg-primary-800/60 relative z-10 flex max-w-full flex-col items-start rounded-sm"
															href="#{part.anchor}"
															onclick={(event) => jumpTo(part.anchor, event)}
														>
															{#each part.codes as code (code)}
																{@const linked = resolveCard(code)}
																{#if linked}
																	<CardLine card={linked} hideIcons hideQuantity />
																{/if}
															{/each}
															{#if part.title}
																<span
																	class="text-primary-800 dark:text-primary-200 px-1 text-xs font-semibold"
																>
																	{part.title}
																</span>
															{/if}
														</a>
													</li>
												{/each}
											</ul>
										</div>
									{/if}
								{/snippet}
							</ReviewRow>
						{/each}
					</ReviewList>
				</section>
			{/if}

			{#if data.insights.length > 0}
				<section>
					<h2 class="text-primary-900 dark:text-primary-100 mb-2 text-xl">
						{m.review_section_insights({ name: card.name })}
					</h2>
					{@render insightList(data.insights.slice(0, shownCount))}
					{@render seeAll(data.insights.length, 'insights')}
				</section>
				<Modal
					isOpen={allOpen === 'insights'}
					maxWidth="lg"
					onClose={() => (allOpen = null)}
					title={m.review_section_insights({ name: card.name })}
				>
					{@render insightList(data.insights)}
				</Modal>
			{/if}

			{#each written as entry (entry.id)}
				<div id={entry.id} class="scroll-mt-4">
					<WrittenReview
						{entry}
						onBackToContents={() => jumpTo(contentsId)}
						parts={entry.parts ?? []}
						{resolveCard}
						{resolveText}
					/>
					<div class="mt-2 flex justify-end">
						<Button
							icon={FaIconType.ArrowUp}
							label={m.review_back_to_contents()}
							onClick={() => jumpTo(contentsId)}
						/>
					</div>
				</div>
			{/each}
		</div>
	</div>
</MarginFull>

<style>
	h2 {
		font-family: 'Heading';
	}
</style>
