<!--
@component
One compact line in a list of what's said about a card, and in search results of everything someone
has said. A row that lives on another site opens it there in a new tab. Without that or `href` it only
credits someone, for what can't be linked to. Goes inside a `ReviewList`. The link covers the whole
row without containing it, so the time point and the person on it can be pressed on their own.
-->
<script lang="ts">
	import clsx from 'clsx';
	import type { Snippet } from 'svelte';

	import FaIcon from '../icon/FaIcon.svelte';
	import { FaIconType } from '../icon/fa-icon-type.js';
	import * as m from '../paraglide/messages.js';
	import EnvironmentPoint from '../environment/EnvironmentPoint.svelte';
	import PersonAvatar from './PersonAvatar.svelte';
	import ReviewDate from './ReviewDate.svelte';
	import type { ReviewRowData } from './review-entry.js';

	interface Prop {
		entry: ReviewRowData;
		/**
		 * A page of this site to go to.
		 */
		href?: string;
		/**
		 * For following `href` some other way, like scrolling within the page.
		 */
		onLinkClick?: (event: MouseEvent) => void;
		/**
		 * Shown instead of the person, for a list all by one person.
		 */
		lead?: Snippet;
		/**
		 * More about it under the row, still part of what the row's link covers. Anything to press in
		 * here needs `relative z-10` to be above that link.
		 */
		below?: Snippet;
	}
	const { entry, href, onLinkClick, lead, below }: Prop = $props();

	const icon = $derived(
		entry.medium === 'video'
			? FaIconType.Video
			: entry.medium === 'audio'
				? FaIconType.Audio
				: FaIconType.Article
	);
	const personIsElsewhere = $derived(entry.person.href?.startsWith('http') ?? false);
	const linkClass = 'flex min-w-0 flex-col after:absolute after:inset-0';
	const rowClass = $derived(
		clsx(
			'relative w-full px-2 py-1 text-left',
			(href || entry.externalHref) &&
				'hover:bg-primary-300/30 dark:hover:bg-primary-800/60 cursor-pointer'
		)
	);
</script>

{#snippet tag(text: string, strong: boolean = false)}
	<span
		class={clsx(
			'rounded-sm px-1 text-[0.6rem] leading-4 font-semibold whitespace-nowrap',
			strong
				? 'bg-secondary-500 dark:bg-secondary-300 dark:text-secondary-950 text-white'
				: 'bg-primary-300 text-primary-900 dark:bg-primary-700 dark:text-primary-100'
		)}
	>
		{text}
	</span>
{/snippet}

{#snippet tags()}
	{#if entry.preview}{@render tag(m.card_review_preview(), true)}{/if}
	{#if entry.official}{@render tag(m.card_review_official())}{/if}
	{#if entry.humor}{@render tag(m.card_review_humor())}{/if}
	{#if entry.languageLabel}{@render tag(entry.languageLabel)}{/if}
	{#if entry.startLabel}{@render tag(m.card_review_starts_at({ time: entry.startLabel }))}{/if}
{/snippet}

{#snippet label()}
	{#if lead}
		{@render lead()}
		<span class="flex flex-wrap items-center gap-x-1.5">
			{@render tags()}
		</span>
		{#if entry.title}
			<span class="text-primary-800 dark:text-primary-200 text-xs leading-snug">
				{entry.title}
			</span>
		{/if}
	{:else}
		<span class="text-primary-900 dark:text-primary-100 text-sm leading-snug font-semibold">
			{entry.title ?? entry.person.name}
		</span>
	{/if}
{/snippet}

{#snippet credit()}
	<span class="flex flex-wrap items-center gap-x-1.5">
		{#if entry.title}
			{#if entry.person.href}
				<!-- eslint-disable svelte/no-navigation-without-resolve -->
				<a
					class="text-primary-800 dark:text-primary-200 relative z-10 text-xs leading-snug hover:underline"
					href={entry.person.href}
					rel={personIsElsewhere ? 'noopener' : undefined}
					target={personIsElsewhere ? '_blank' : undefined}
				>
					{entry.person.name}
				</a>
				<!-- eslint-enable svelte/no-navigation-without-resolve -->
			{:else}
				<span class="text-primary-800 dark:text-primary-200 text-xs leading-snug">
					{entry.person.name}
				</span>
			{/if}
		{/if}
		{@render tags()}
	</span>
{/snippet}

<div class={rowClass}>
	<div class="flex flex-wrap items-center gap-x-3">
		<div class="flex min-w-0 flex-1 basis-48 items-center gap-1.5">
			<span class="text-primary-700 dark:text-primary-300 w-4 shrink-0 text-center text-xs">
				<FaIcon {icon} />
			</span>
			{#if !lead}
				<PersonAvatar person={entry.person} />
			{/if}
			<div class="flex min-w-0 flex-col">
				{#if entry.externalHref}
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
					<a class={linkClass} href={entry.externalHref} rel="noopener" target="_blank">
						{@render label()}
					</a>
				{:else if href}
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
					<a class={linkClass} {href} onclick={onLinkClick}>
						{@render label()}
					</a>
				{:else}
					<span class="flex min-w-0 flex-col">
						{@render label()}
					</span>
				{/if}
				{#if !lead}
					{@render credit()}
				{/if}
			</div>
		</div>
		<div class="ml-auto flex shrink-0 items-center gap-2">
			{#if entry.environment}
				<EnvironmentPoint environment={entry.environment} />
			{/if}
			{#if entry.dateLabel}
				<ReviewDate date={entry.dateLabel} />
			{/if}
			{#if entry.externalHref}
				<span class="text-primary-700 dark:text-primary-300 text-xs">
					<FaIcon icon={FaIconType.ExternalLink} />
				</span>
			{/if}
		</div>
	</div>
	{@render below?.()}
</div>
