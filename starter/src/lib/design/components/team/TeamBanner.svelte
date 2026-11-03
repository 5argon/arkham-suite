<!--
@component
Compact banner for a team: name, tags, author, description, and the team-wide
card pool summary. Shared by the team builder's view mode and the pre-built team
listing.
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import {
		BorderedContainer,
		CardCircle,
		type CardLineNote,
		CardLineNotes,
		TagChip
	} from '@5argon/arkham-life-ui';
	import type { Card } from '@5argon/arkham-kohaku';

	import { createCardResolver } from '$lib/card-data';
	import * as m from '$lib/paraglide/messages.js';
	import type { PrebuiltTeamSource } from '$lib/starter-content';
	import type { TeamDisplay } from '$lib/tool/evergreen-team/team-display';
	import type { TeamInfo } from '$lib/tool/evergreen-team/types';

	import MemberHeader from './MemberHeader.svelte';
	import PoolSummary from './PoolSummary.svelte';
	import StarterDeckSourceBanner from './StarterDeckSourceBanner.svelte';

	interface Prop {
		info: TeamInfo;
		display: TeamDisplay;
		tags?: string[];
		/** How each member plays what the reader is looking for, parallel to the members. */
		memberNotes?: CardLineNote[][];
		/** Hosted starter sources parallel to the members. Omit to keep the banner compact. */
		sources?: (PrebuiltTeamSource | undefined)[];
		exclusive?: boolean;
		/** Shown before the author's name. */
		authorAvatar?: Card;
		/**
		 * Links the author's name to their starter deck page; leave out when the
		 * whole banner is already a link.
		 */
		authorSlug?: string;
	}
	const {
		info,
		display,
		tags = [],
		memberNotes,
		sources,
		exclusive = false,
		authorAvatar,
		authorSlug
	}: Prop = $props();

	const resolver = createCardResolver();
</script>

<!-- The avatar already reads as attribution, so the name stands alone beside it. -->
{#snippet byAuthor()}
	{#if authorAvatar}
		<CardCircle card={authorAvatar} />
		{info.author}
	{:else}
		{m.tool_evergreen_team_by_author({ author: info.author })}
	{/if}
{/snippet}

<div class="relative">
	{#if exclusive}
		<span
			class="bg-secondary-700 dark:bg-secondary-300 absolute top-2 right-2 z-10 rounded-full px-2 py-0.5 text-xs font-bold text-white dark:text-black lg:top-4 lg:right-4"
		>
			{m.team_exclusive()}
		</span>
	{/if}
	<BorderedContainer>
		<div class="flex flex-col items-center gap-1 text-center">
			<span class="team-name text-primary-900 dark:text-primary-100 text-xl" class:px-16={exclusive}
				>{info.name}</span
			>
			{#if tags.length > 0}
				<div class="flex flex-wrap justify-center gap-1">
					{#each tags as tag (tag)}
						<TagChip label={tag} />
					{/each}
				</div>
			{/if}
			{#if info.author.length > 0}
				{#if authorSlug}
					<a
						class="text-primary-700 dark:text-primary-300 inline-flex items-center gap-1.5 text-sm hover:underline"
						href={resolve('/starter/[author]', { author: authorSlug })}
					>
						{@render byAuthor()}
					</a>
				{:else}
					<span
						class="text-primary-700 dark:text-primary-300 inline-flex items-center gap-1.5 text-sm"
					>
						{@render byAuthor()}
					</span>
				{/if}
			{/if}
			{#if info.description.length > 0}
				<p class="text-primary-800 dark:text-primary-200 max-w-2xl text-sm break-words">
					{info.description}
				</p>
			{/if}
			<div class="mt-1">
				<PoolSummary usages={display.poolUsage} />
			</div>
			<div class="mt-2 grid w-full grid-cols-1 gap-2 md:grid-cols-2">
				{#each display.members as member, memberIndex (member.investigator)}
					{@const source = sources?.[memberIndex]}
					{@const notes = memberNotes?.[memberIndex] ?? []}
					<div
						class="border-primary-300 dark:border-primary-700 rounded-lg border bg-white/50 dark:bg-black/30"
					>
						<MemberHeader
							investigator={resolver.resolve(member.investigator)}
							mainCount={member.mainCount}
							classCounts={member.classCounts}
							notableCards={member.notable.map((code) => resolver.resolve(code))}
						/>
						{#if source}
							<StarterDeckSourceBanner {source} />
						{/if}
						{#if notes.length > 0}
							<div class="px-2 pt-1 pb-2 text-left">
								<CardLineNotes items={notes} />
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	</BorderedContainer>
</div>

<style>
	.team-name {
		font-family: 'Heading';
	}
</style>
