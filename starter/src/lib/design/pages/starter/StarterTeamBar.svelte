<!--
@component
Compact, persistent "your team" strip shared by every /starter page: the
starter decks added so far (up to four) as aligned rows with each
investigator's health, sanity, and stats for a vertical comparison, the
team's overlap count, and the card pool utilization. Use This Team opens the
Evergreen Team Builder on exactly this team and product set; with overlaps it
reads Resolve Overlaps instead.
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import {
		Button,
		CardLine,
		FaIconType,
		HealthSanity,
		ImageIconCommit
	} from '@5argon/arkham-life-ui';

	import { createCardResolver, getAllCards } from '$lib/card-data';
	import PoolSummary from '$lib/design/components/team/PoolSummary.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { starterDeck, starterDeckHref } from '$lib/starter-content';
	import { encodeEvergreen } from '$lib/tool/evergreen-team/codec';
	import { defaultTeamInfo } from '$lib/tool/evergreen-team/team-info';
	import { STARTER_TEAM_MAX, starterTeam } from '$lib/tool/starter/team-cart.svelte';
	import { starterTeamOverlaps, starterTeamState } from '$lib/tool/starter/team-export';

	export const HIGHLIGHT_STAT_AT_LEAST = 4;
	export const DIM_STAT_AT_MOST = 2;

	const resolver = createCardResolver();
	const allCards = getAllCards();
	const entries = $derived(
		starterTeam.members
			.map((member) => ({
				member,
				entry: starterDeck(member.author, member.series, member.slug)
			}))
			.filter((x) => x.entry !== undefined)
			.map((x) => ({ member: x.member, entry: x.entry! }))
	);
	const built = $derived(
		entries.length === 0
			? null
			: starterTeamState({
					entries: entries.map((x) => x.entry),
					products: starterTeam.products,
					allCards,
					info: {
						...defaultTeamInfo(),
						description: m.starter_decks_team_description({
							decks: entries.map((x) => x.entry.primary.name).join(', ')
						})
					}
				})
	);
	const overlaps = $derived(
		built === null ? { perDeck: [], total: 0 } : starterTeamOverlaps(built.state, built.pool)
	);

	function useTeam() {
		if (built === null) return;
		const encoded = encodeEvergreen(built.state);
		window.open(resolve(`/tool/team-builder?t=${encoded}`, {}), '_blank', 'noopener');
	}
</script>

<div
	class="border-primary-300 dark:border-primary-700 bg-primary-50/60 dark:bg-primary-950/40 mb-3 rounded-lg border px-3 py-2"
>
	<div class="flex flex-wrap items-center justify-between gap-2">
		<span class="text-primary-900 dark:text-primary-100 text-sm font-bold">
			{m.starter_decks_your_team({ count: entries.length, max: STARTER_TEAM_MAX })}
		</span>
		{#if entries.length > 0}
			<span class="flex flex-wrap items-center gap-1.5">
				<Button
					highlighted
					icon={FaIconType.ExternalLink}
					label={overlaps.total > 0
						? m.starter_decks_resolve_overlaps({ count: overlaps.total })
						: m.starter_decks_use_team()}
					onClick={useTeam}
				/>
				<Button
					hideLabel
					icon={FaIconType.Delete}
					label={m.starter_decks_clear_team()}
					onClick={() => starterTeam.clear()}
				/>
			</span>
		{/if}
	</div>
	{#if entries.length === 0 || built === null}
		<p class="text-primary-700 dark:text-primary-300 mt-1 text-xs">
			{m.starter_decks_team_empty()}
		</p>
	{:else}
		<div class="mt-1.5 overflow-x-auto">
			<table class="w-full border-separate border-spacing-y-1">
				<tbody>
					{#each entries as { member, entry }, i (member.author + '/' + member.series + '/' + member.slug)}
						{@const investigator = resolver.resolve(entry.primary.investigator_code)}
						<tr class="bg-primary-50 dark:bg-primary-900">
							<td class="rounded-l-md py-0.5 pl-2 whitespace-nowrap">
								<CardLine noReserveCardTypeIcon hideIcons card={investigator} />
								<a
									class="text-primary-900 dark:text-primary-100 block max-w-56 truncate pl-1 text-xs font-semibold hover:underline"
									href={resolve(starterDeckHref(entry) as '/starter/[author]/[series]/[deck]', {})}
								>
									{entry.primary.name}
								</a>
							</td>
							<td class="w-px px-1 whitespace-nowrap">
								<HealthSanity health={investigator.health} sanity={investigator.sanity} />
							</td>
							<td class="w-px px-1 whitespace-nowrap">
								<ImageIconCommit
									card={investigator}
									highlightAtLeast={HIGHLIGHT_STAT_AT_LEAST}
									dimAtMost={DIM_STAT_AT_MOST}
								/>
							</td>
							<td class="w-px px-1 whitespace-nowrap">
								{#if overlaps.perDeck[i] > 0}
									<span
										class="rounded-full bg-red-600/15 px-2 py-0.5 font-bold text-red-700 dark:text-red-400"
									>
										{m.starter_decks_overlaps_count({ count: overlaps.perDeck[i] })}
									</span>
								{/if}
							</td>
							<td class="w-px rounded-r-md py-0.5 pr-1 text-right">
								<button
									type="button"
									class="text-primary-600 hover:bg-primary-300 dark:text-primary-300 dark:hover:bg-primary-700 cursor-pointer rounded-full px-1.5 leading-tight"
									aria-label={m.starter_decks_remove_from_team()}
									title={m.starter_decks_remove_from_team()}
									onclick={() => starterTeam.remove(member)}
								>
									✕
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<div class="mt-1.5 flex justify-center">
			{#key built.state.setup.deckProducts.join(',') + '|' + entries.length}
				<PoolSummary team={built.state} pool={built.pool} />
			{/key}
		</div>
	{/if}
</div>
