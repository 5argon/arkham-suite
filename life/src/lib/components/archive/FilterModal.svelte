<!--
@component
Campaign Archive filter modal. Presentational: the draft selections live in the
page (seeded from the URL on open), so reopening reflects the applied filters and
there's no $effect-based init. Apply navigates; the page filters in `listData`.

Campaigns / players / investigators use searchable pickers (icon + name) instead of
flat checkbox grids — same components used when editing a campaign and in the
Limited Pool Explorer. Outcome / player-count / solo stay as small checkbox sets.
-->
<script lang="ts">
	import {
		Modal,
		Button,
		Checkbox,
		CardFormMultiple,
		SearchableDropdown,
		UserDisplay,
		FaIconType,
		type SelectedCardEntry
	} from '@5argon/arkham-life-ui';
	import { campaignToProductMap, type Card, type Campaign } from '@5argon/arkham-kohaku';
	import { ProductIcon } from '@5argon/arkham-icon';
	import { createCardResolver } from '$lib/card-data';
	import * as m from '$lib/paraglide/messages.js';
	import type { FilterOptions, OutcomeFilter, SoloFilter } from '$lib/database/repository';

	interface Props {
		isOpen: boolean;
		options: FilterOptions;
		playGroups: { uid: string; name: string; memberUids: string[] }[];
		campaigns: Set<string>;
		players: Set<string>;
		investigators: Set<string>;
		outcomes: Set<string>;
		playerCounts: Set<number>;
		soloTypes: Set<string>;
		onToggle: (cat: 'outcome' | 'pc' | 'solo', value: string | number) => void;
		onSetCampaigns: (codes: string[]) => void;
		onSetPlayers: (uids: string[]) => void;
		onSetInvestigators: (codes: string[]) => void;
		onToggleGroup: (memberUids: string[]) => void;
		onClear: () => void;
		onApply: () => void;
		onClose: () => void;
	}
	let {
		isOpen,
		options,
		playGroups,
		campaigns,
		players,
		investigators,
		outcomes,
		playerCounts,
		soloTypes,
		onToggle,
		onSetCampaigns,
		onSetPlayers,
		onSetInvestigators,
		onToggleGroup,
		onClear,
		onApply,
		onClose
	}: Props = $props();

	const OUTCOMES: { value: OutcomeFilter; label: string }[] = [
		{ value: 'cleared', label: m.archive_filter_outcome_win() },
		{ value: 'special', label: m.archive_filter_outcome_special() },
		{ value: 'attempted', label: m.archive_filter_outcome_lose() },
		{ value: 'unknown', label: m.archive_filter_outcome_unknown() }
	];

	const soloLabel: Record<SoloFilter, string> = {
		'true-solo': m.archive_filter_solo_true(),
		'multi-handed': m.archive_filter_solo_multi()
	};

	// Shared resolver (cached) for player avatars and investigator card objects.
	const resolver = createCardResolver();
	function resolveCard(code: string): Card | null {
		try {
			return resolver.resolve(code) ?? null;
		} catch {
			return null;
		}
	}

	// ─── Campaigns ───────────────────────────────────────────────────────────────
	const campaignByCode = $derived(new Map(options.campaigns.map((c) => [c.code, c])));
	const campaignName = (code: string) => campaignByCode.get(code)?.name ?? code;
	const campaignProduct = (code: string) => campaignToProductMap[code as Campaign] ?? null;
	function addCampaign(item: { code: string; name: string }) {
		if (!campaigns.has(item.code)) onSetCampaigns([...campaigns, item.code]);
	}
	function removeCampaign(code: string) {
		onSetCampaigns([...campaigns].filter((c) => c !== code));
	}

	// ─── Players ─────────────────────────────────────────────────────────────────
	const playerByUid = $derived(new Map(options.players.map((p) => [p.uid, p])));
	const playerName = (uid: string) => playerByUid.get(uid)?.name ?? uid;
	const playerIcon = (uid: string) => resolveCard(playerByUid.get(uid)?.iconCardCode ?? '');
	function addPlayer(item: { uid: string; name: string }) {
		if (!players.has(item.uid)) onSetPlayers([...players, item.uid]);
	}
	function removePlayer(uid: string) {
		onSetPlayers([...players].filter((u) => u !== uid));
	}

	// ─── Investigators (CardFormMultiple) ────────────────────────────────────────
	// Only offer investigators that actually appear in the archive.
	const investigatorCards = $derived.by((): Card[] => {
		const out: Card[] = [];
		for (const o of options.investigators) {
			const c = resolveCard(o.code);
			if (c) out.push(c);
		}
		return out;
	});
	const investigatorEntries = $derived(
		[...investigators].map((code): SelectedCardEntry => ({ code }))
	);
</script>

<Modal {isOpen} {onClose} title={m.archive_filter_title()} maxWidth="lg">
	<div class="flex flex-col gap-4 py-2">
		{#if options.campaigns.length}
			<section>
				<SearchableDropdown
					label={m.archive_filter_campaigns()}
					items={options.campaigns}
					searchKeys={['name']}
					filter={(c) => !campaigns.has(c.code)}
					onSelect={addCampaign}
					fuzzyThreshold={0.3}
				>
					{#snippet renderItem(item)}
						{@const product = campaignProduct(item.code)}
						<span class="text-primary-600 dark:text-primary-400">
							{#if product != null}<ProductIcon {product} />{/if}
						</span>
						<span class="text-primary-900 dark:text-primary-100">{item.name}</span>
					{/snippet}

					{#snippet selectedItems()}
						{#if campaigns.size > 0}
							<div class="mt-2 space-y-1">
								{#each [...campaigns] as code (code)}
									{@const product = campaignProduct(code)}
									<div
										class="hover:bg-primary-100 dark:hover:bg-primary-800 flex items-center gap-2 rounded p-1.5 transition-colors"
									>
										<Button
											label={m.common_clear()}
											onClick={() => removeCampaign(code)}
											hideLabel
											icon={FaIconType.Delete}
										/>
										<span class="text-primary-600 dark:text-primary-400">
											{#if product != null}<ProductIcon {product} />{/if}
										</span>
										<span class="text-primary-900 dark:text-primary-100">{campaignName(code)}</span>
									</div>
								{/each}
							</div>
						{/if}
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
							<Button label={g.name} onClick={() => onToggleGroup(g.memberUids)} />
						{/each}
					</div>
				{/if}
				<SearchableDropdown
					label={m.archive_filter_players()}
					items={options.players}
					searchKeys={['name']}
					filter={(p) => !players.has(p.uid)}
					onSelect={addPlayer}
					fuzzyThreshold={0.3}
				>
					{#snippet renderItem(item)}
						<UserDisplay username={item.name} card={resolveCard(item.iconCardCode)} size="sm" />
					{/snippet}

					{#snippet selectedItems()}
						{#if players.size > 0}
							<div class="mt-2 space-y-1">
								{#each [...players] as uid (uid)}
									<div
										class="hover:bg-primary-100 dark:hover:bg-primary-800 flex items-center gap-2 rounded p-1.5 transition-colors"
									>
										<Button
											label={m.common_clear()}
											onClick={() => removePlayer(uid)}
											hideLabel
											icon={FaIconType.Delete}
										/>
										<UserDisplay username={playerName(uid)} card={playerIcon(uid)} size="sm" />
									</div>
								{/each}
							</div>
						{/if}
					{/snippet}
				</SearchableDropdown>
			</section>
		{/if}

		{#if options.investigators.length}
			<section>
				<CardFormMultiple
					label={m.archive_filter_investigators()}
					cards={investigatorCards}
					selectedEntries={investigatorEntries}
					onEntriesChange={(entries) => onSetInvestigators(entries.map((e) => e.code))}
					allowDuplicates={false}
				/>
			</section>
		{/if}

		<section>
			<h3 class="text-primary-800 dark:text-primary-200 mb-1 text-sm font-semibold">
				{m.archive_filter_outcome()}
			</h3>
			<div class="flex flex-wrap gap-2">
				{#each OUTCOMES as o (o.value)}
					<Checkbox
						label={o.label}
						checked={outcomes.has(o.value)}
						onChange={() => onToggle('outcome', o.value)}
					/>
				{/each}
			</div>
		</section>

		{#if options.playerCounts.length}
			<section>
				<h3 class="text-primary-800 dark:text-primary-200 mb-1 text-sm font-semibold">
					{m.archive_filter_player_count()}
				</h3>
				<div class="flex flex-wrap gap-2">
					{#each options.playerCounts as pc (pc)}
						<Checkbox
							label={`${pc}P`}
							checked={playerCounts.has(pc)}
							onChange={() => onToggle('pc', pc)}
						/>
					{/each}
				</div>
			</section>
		{/if}

		{#if options.soloTypes.length}
			<section>
				<h3 class="text-primary-800 dark:text-primary-200 mb-1 text-sm font-semibold">
					{m.archive_filter_solo()}
				</h3>
				<div class="flex flex-wrap gap-2">
					{#each options.soloTypes as st (st)}
						<Checkbox
							label={soloLabel[st]}
							checked={soloTypes.has(st)}
							onChange={() => onToggle('solo', st)}
						/>
					{/each}
				</div>
			</section>
		{/if}
	</div>

	{#snippet footer()}
		<div class="flex justify-between gap-2">
			<Button label={m.archive_filter_clear()} icon={FaIconType.Clear} onClick={onClear} />
			<Button label={m.archive_filter_apply()} highlighted onClick={onApply} />
		</div>
	{/snippet}
</Modal>
