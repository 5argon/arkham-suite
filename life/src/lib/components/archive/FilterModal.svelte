<!--
@component
Campaign Archive filters: searchable pickers for campaigns, players (a play group adds its members)
and investigators, and checkbox facets for outcome, player count and solo. Selections stay drafts
until Apply.
-->
<script module lang="ts">
	export const CAMPAIGN_FACETS = ['camp', 'who', 'inv', 'outcome', 'pc', 'solo'] as const;
	export type CampaignFacet = (typeof CAMPAIGN_FACETS)[number];
</script>

<script lang="ts">
	import {
		Button,
		CardFormMultiple,
		FaIconType,
		Modal,
		SearchableDropdown,
		UserDisplay,
		type SelectedCardEntry
	} from '@5argon/arkham-life-ui';
	import { campaignToProductMap, type Campaign, type Card } from '@5argon/arkham-kohaku';
	import { ProductIcon } from '@5argon/arkham-icon';
	import * as m from '$lib/paraglide/messages.js';
	import { resolveCardOrNull } from '$lib/card-data';
	import type { FilterOptions } from '$lib/database/archive-list';
	import type { LocalPlayGroup } from '$lib/database/document';
	import FacetCheckboxes from './FacetCheckboxes.svelte';
	import type { FilterDrafts } from './list-url';
	import { soloLabel } from './solo-label';

	interface Props {
		isOpen: boolean;
		options: FilterOptions;
		playGroups: LocalPlayGroup[];
		drafts: FilterDrafts<CampaignFacet>;
		onToggle: (facet: CampaignFacet, value: string) => void;
		onSet: (facet: CampaignFacet, values: string[]) => void;
		onClear: () => void;
		onApply: () => void;
		onClose: () => void;
	}
	let { isOpen, options, playGroups, drafts, onToggle, onSet, onClear, onApply, onClose }: Props =
		$props();

	const outcomes = [
		{ value: 'cleared', label: m.archive_filter_outcome_win() },
		{ value: 'special', label: m.archive_filter_outcome_special() },
		{ value: 'attempted', label: m.archive_filter_outcome_lose() },
		{ value: 'unknown', label: m.archive_filter_outcome_unknown() }
	];

	const campaignName = $derived(new Map(options.campaigns.map((c) => [c.code, c.name])));
	const campaignProduct = (code: string) => campaignToProductMap[code as Campaign] ?? null;
	const player = $derived(new Map(options.players.map((p) => [p.uid, p])));
	const investigatorCards = $derived(
		options.investigators.flatMap((o) => resolveCardOrNull(o.code) ?? []) as Card[]
	);

	const add = (facet: CampaignFacet, value: string) => onSet(facet, [...drafts[facet], value]);
	const remove = (facet: CampaignFacet, value: string) =>
		onSet(facet, [...drafts[facet]].filter((v) => v !== value));

	/** Adds the group's members, or removes them when all are already selected. */
	function toggleGroup(memberUids: string[]) {
		const members = memberUids.filter((u) => player.has(u));
		const selected = drafts.who;
		const allOn = members.length > 0 && members.every((u) => selected.has(u));
		const next = new Set(selected);
		for (const u of members) {
			if (allOn) next.delete(u);
			else next.add(u);
		}
		onSet('who', [...next]);
	}
</script>

{#snippet removeButton(facet: CampaignFacet, value: string)}
	<Button label={m.common_clear()} onClick={() => remove(facet, value)} hideLabel icon={FaIconType.Delete} />
{/snippet}

{#snippet productIcon(code: string)}
	{@const product = campaignProduct(code)}
	<span class="text-primary-600 dark:text-primary-400">
		{#if product != null}<ProductIcon {product} />{/if}
	</span>
{/snippet}

<Modal {isOpen} {onClose} title={m.archive_filter_title()} maxWidth="lg">
	<div class="flex flex-col gap-4 py-2">
		{#if options.campaigns.length}
			<section>
				<SearchableDropdown
					label={m.archive_filter_campaigns()}
					items={options.campaigns}
					searchKeys={['name']}
					filter={(c) => !drafts.camp.has(c.code)}
					onSelect={(c) => add('camp', c.code)}
					fuzzyThreshold={0.3}
				>
					{#snippet renderItem(item)}
						{@render productIcon(item.code)}
						<span class="text-primary-900 dark:text-primary-100">{item.name}</span>
					{/snippet}
					{#snippet selectedItems()}
						<div class="mt-2 space-y-1" class:hidden={drafts.camp.size === 0}>
							{#each [...drafts.camp] as code (code)}
								<div class="hover:bg-primary-100 dark:hover:bg-primary-800 flex items-center gap-2 rounded p-1.5">
									{@render removeButton('camp', code)}
									{@render productIcon(code)}
									<span class="text-primary-900 dark:text-primary-100">{campaignName.get(code) ?? code}</span>
								</div>
							{/each}
						</div>
					{/snippet}
				</SearchableDropdown>
			</section>
		{/if}

		{#if options.players.length}
			<section>
				{#if playGroups.length}
					<div class="mb-2 flex flex-wrap items-center gap-2">
						<span class="text-primary-500 dark:text-primary-400 text-xs"
							>{m.archive_filter_play_group_shortcut()}</span
						>
						{#each playGroups as g (g.uid)}
							<Button label={g.name} onClick={() => toggleGroup(g.memberUids)} />
						{/each}
					</div>
				{/if}
				<SearchableDropdown
					label={m.archive_filter_players()}
					items={options.players}
					searchKeys={['name']}
					filter={(p) => !drafts.who.has(p.uid)}
					onSelect={(p) => add('who', p.uid)}
					fuzzyThreshold={0.3}
				>
					{#snippet renderItem(item)}
						<UserDisplay username={item.name} card={resolveCardOrNull(item.iconCardCode)} size="sm" />
					{/snippet}
					{#snippet selectedItems()}
						<div class="mt-2 space-y-1" class:hidden={drafts.who.size === 0}>
							{#each [...drafts.who] as uid (uid)}
								<div class="hover:bg-primary-100 dark:hover:bg-primary-800 flex items-center gap-2 rounded p-1.5">
									{@render removeButton('who', uid)}
									<UserDisplay
										username={player.get(uid)?.name ?? uid}
										card={resolveCardOrNull(player.get(uid)?.iconCardCode ?? '')}
										size="sm"
									/>
								</div>
							{/each}
						</div>
					{/snippet}
				</SearchableDropdown>
			</section>
		{/if}

		{#if options.investigators.length}
			<section>
				<CardFormMultiple
					label={m.archive_filter_investigators()}
					cards={investigatorCards}
					selectedEntries={[...drafts.inv].map((code): SelectedCardEntry => ({ code }))}
					onEntriesChange={(entries) => onSet('inv', entries.map((e) => e.code))}
					allowDuplicates={false}
				/>
			</section>
		{/if}

		<FacetCheckboxes
			title={m.archive_filter_outcome()}
			options={outcomes}
			selected={drafts.outcome}
			onToggle={(v) => onToggle('outcome', v)}
		/>
		{#if options.playerCounts.length}
			<FacetCheckboxes
				title={m.archive_filter_player_count()}
				options={options.playerCounts.map((pc) => ({ value: String(pc), label: `${pc}P` }))}
				selected={drafts.pc}
				onToggle={(v) => onToggle('pc', v)}
			/>
		{/if}
		{#if options.soloTypes.length}
			<FacetCheckboxes
				title={m.archive_filter_solo()}
				options={options.soloTypes.map((st) => ({ value: st, label: soloLabel(st, 0) ?? st }))}
				selected={drafts.solo}
				onToggle={(v) => onToggle('solo', v)}
			/>
		{/if}
	</div>

	{#snippet footer()}
		<div class="flex justify-between gap-2">
			<Button label={m.archive_filter_clear()} icon={FaIconType.Clear} onClick={onClear} />
			<Button label={m.archive_filter_apply()} highlighted onClick={onApply} />
		</div>
	{/snippet}
</Modal>
