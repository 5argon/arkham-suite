<!--
@component
A `notes` section (Campaign Notes, Missing Persons, Memories, …): search this section's entries to
add them; an entry with a count, text or `#name#` asks for it first.
-->
<script lang="ts">
	import { sectionEntries, type ResolvedLogEntry } from '@5argon/arkham-campaign-data';
	import {
		Button,
		CardFormSingle,
		Dropdown,
		FaIcon,
		FaIconType,
		SearchableDropdown,
		TextInput
	} from '@5argon/arkham-life-ui';
	import { card } from '@5argon/arkham-kohaku';
	import * as m from '$lib/paraglide/messages.js';
	import { getAllCards, resolveCardOrNull } from '$lib/card-data';
	import { itemLabel, portraitUrl } from '$lib/campaign/records/campaign-log-source';
	import {
		CROSSED_MARK,
		firstNumber,
		hasCrossedMark,
		makeEntry,
		type LocalLog
	} from '$lib/campaign/records/recorded-state';
	import EntryText from '../EntryText.svelte';
	import { cardPoolFor } from '../card-pool';
	import type { RosterSectionProps } from './types';

	interface Props extends RosterSectionProps {
		/** Entries of side stories recorded in the Extra tab, offered here too. */
		extraEntries?: ResolvedLogEntry[];
		/** Side-story name per extra entry key. */
		extraSource?: Map<string, string>;
	}
	let {
		log,
		section,
		entries,
		investigators,
		onChange,
		extraEntries = [],
		extraSource
	}: Props = $props();

	const available = $derived([
		...sectionEntries(log, section.id).filter((e) => !e.def.hidden),
		...extraEntries
	]);
	const byKey = $derived(new Map(available.map((e) => [e.key, e])));
	const recordedKeys = $derived(new Set(entries.map((e) => e.key)));
	/** A plain note leaves the dropdown once recorded; a `repeatable` one (its identity is the card +
	 *  number it carries, e.g. Fortune and Folly's Stashed) stays. */
	const selectable = $derived(available.filter((e) => e.def.repeatable || !recordedKeys.has(e.key)));

	// A `#name#` entry picks a partner from the campaign's partner roster (EotE), or else a card.
	const partnerSection = $derived(log.db.sections.find((s) => s.type === 'partner'));
	const nameChoices = $derived(
		(partnerSection?.items ?? []).map((it) => ({ value: it.id, label: itemLabel(log, it.id) }))
	);
	const rosterCodes = $derived(new Set(investigators.map((i) => i.code)));
	const uniquePlayerCards = getAllCards()
		.filter(card.playerCardsNonCampaignFilter)
		.filter((c) => c.unique === true);

	/** Card-code-keyed sections (TCU Missing Persons) show the sheet portrait when there is one. */
	const hasPortrait = $derived(/^\d{5}$/.test(section.id));
	let photoFailed = $state(false);

	// ─── An entry that needs a value before it is added ─────────────────────────
	let pending = $state<ResolvedLogEntry | null>(null);
	let pendingValue = $state('');
	/** The `#X#` of a `#name#` entry like "Stashed: #name# (#X#)". */
	let pendingCount = $state('');
	const pendingType = $derived(pending ? paramType(pending) : null);
	const pendingNeedsCount = $derived(pendingType === 'name' && /#X#/.test(pending?.en.text ?? ''));
	const pendingCardPool = $derived(
		pending?.def.cardFilter
			? cardPoolFor(pending.def.cardFilter, getAllCards(), rosterCodes)
			: uniquePlayerCards
	);

	function paramType(entry: ResolvedLogEntry): 'count' | 'text' | 'name' | null {
		const p = entry.def.param;
		if (p?.type === 'count' || p?.type === 'investigatorCount') return 'count';
		if (p?.type === 'text') return 'text';
		if (p?.type === 'cards' && p.cards?.mode === 'choice') return 'name';
		return null;
	}

	function handleSelect(entry: ResolvedLogEntry) {
		if (paramType(entry)) {
			pending = entry;
			pendingValue = '';
			pendingCount = '';
		} else {
			onChange([...entries, makeEntry(section.id, entry.key)]);
		}
	}

	function confirmPending() {
		if (!pending || (pendingType === 'name' && !pendingValue)) return;
		const num = (v: string) => ({ type: 'number' as const, value: String(Number(v) || 0) });
		const args: LocalLog['args'] =
			pendingType === 'count'
				? [num(pendingValue)]
				: [{ type: 'string', value: pendingValue }, ...(pendingNeedsCount ? [num(pendingCount)] : [])];
		onChange([...entries, makeEntry(section.id, pending.key, args)]);
		pending = null;
	}

	/** Entries keep their recorded order (the play order); the player can reorder them. */
	function move(index: number, dir: -1 | 1) {
		const j = index + dir;
		if (j < 0 || j >= entries.length) return;
		const next = [...entries];
		[next[index], next[j]] = [next[j], next[index]];
		onChange(next);
	}

	function toggleCrossed(target: LocalLog) {
		const args = hasCrossedMark(target.args)
			? target.args.filter((a) => !(a.type === 'string' && a.value === CROSSED_MARK))
			: [...target.args, { type: 'string' as const, value: CROSSED_MARK }];
		onChange(entries.map((e) => (e === target ? { ...e, args } : e)));
	}

	/** The entry text with its recorded `#X#` count and `#name#` pick filled in. */
	function displayText(entry: LocalLog): string | undefined {
		const resolved = byKey.get(entry.key);
		if (!resolved) return undefined;
		let text = resolved.en.text;
		const num = firstNumber(entry.args);
		if (num !== undefined) text = text.replace(/#X#/g, String(num));
		const name = entry.args.find((a) => a.type === 'string' && a.value !== CROSSED_MARK)?.value;
		if (name) {
			const label = partnerSection ? itemLabel(log, name) : (resolveCardOrNull(name)?.name ?? name);
			text = text.replace(/#name#/gi, label);
		}
		return text;
	}
</script>

<div class="space-y-2">
	{#if hasPortrait && !photoFailed}
		<img
			src={portraitUrl(log.db.code, section.id)}
			alt=""
			class="border-primary-200 dark:border-primary-700 h-28 w-24 rounded border object-cover"
			onerror={() => (photoFailed = true)}
		/>
	{/if}
	<SearchableDropdown
		label={m.archive_logs_search_label()}
		placeholder={m.archive_logs_search_placeholder()}
		items={selectable}
		fuzzyThreshold={0.4}
		searchKeys={['en.text']}
		onSelect={handleSelect}
	>
		{#snippet renderItem(item)}
			<EntryText class="text-sm text-black dark:text-white" en={item.en} />
		{/snippet}
	</SearchableDropdown>

	{#if pending}
		<div class="bg-primary-50 dark:bg-primary-900 space-y-2 rounded border p-3">
			<EntryText class="text-sm font-semibold text-black dark:text-white" en={pending.en} />
			{#if pendingType === 'name' && !partnerSection}
				<CardFormSingle
					label={m.archive_logs_search_card()}
					placeholder={m.archive_logs_search_card_placeholder()}
					cards={pendingCardPool}
					selectedCard={pendingValue ? resolveCardOrNull(pendingValue) : null}
					onSelect={(c) => (pendingValue = c.code)}
				/>
			{:else if pendingType === 'name'}
				<Dropdown
					label={m.archive_logs_choose_name()}
					value={pendingValue}
					options={[{ value: '', label: '—' }, ...nameChoices]}
					onchange={(v) => (pendingValue = v)}
				/>
			{:else}
				<TextInput
					label={pendingType === 'count' ? m.archive_logs_count_label() : m.archive_logs_text_label()}
					bind:value={pendingValue}
				/>
			{/if}
			{#if pendingNeedsCount}
				<div class="w-28">
					<TextInput label={m.archive_logs_count_label()} bind:value={pendingCount} />
				</div>
			{/if}
			<div class="flex gap-2 pt-1">
				<Button label={m.archive_logs_add()} icon={FaIconType.Add} onClick={confirmPending} />
				<Button label={m.common_back()} onClick={() => (pending = null)} />
			</div>
		</div>
	{/if}

	{#if entries.length === 0}
		<p class="text-primary-400 dark:text-primary-500 text-sm">{m.archive_logs_empty()}</p>
	{:else}
		<div class="flex flex-col gap-2">
			{#each entries as entry, i (entry.clientId)}
				{@const resolved = byKey.get(entry.key)}
				{@const crossed = hasCrossedMark(entry.args)}
				{@const source = extraSource?.get(entry.key)}
				<div
					class="bg-primary-100 dark:bg-primary-800 flex items-center justify-between gap-2 rounded p-3"
				>
					<div class="flex min-w-0 flex-1 items-center gap-2">
						{#if source}
							<span
								class="text-secondary-600 dark:text-secondary-400 shrink-0"
								title={m.archive_logs_from_side_story({ name: source })}
							>
								<FaIcon icon={FaIconType.StandaloneSource} />
							</span>
						{/if}
						{#if resolved}
							<EntryText
								class={`text-sm font-semibold text-black dark:text-white${crossed ? ' line-through opacity-60' : ''}`}
								en={resolved.en}
								text={displayText(entry)}
							/>
						{:else}
							<span
								class="text-sm font-semibold text-black dark:text-white"
								class:line-through={crossed}
								class:opacity-60={crossed}>{entry.key}</span
							>
						{/if}
					</div>
					<div class="flex shrink-0 items-center gap-1">
						<Button
							label={m.archive_logs_move_up()}
							icon={FaIconType.ArrowUp}
							hideLabel
							disabled={i === 0}
							onClick={() => move(i, -1)}
						/>
						<Button
							label={m.archive_logs_move_down()}
							icon={FaIconType.ArrowDown}
							hideLabel
							disabled={i === entries.length - 1}
							onClick={() => move(i, 1)}
						/>
						{#if resolved?.def.crossOut}
							<Button
								label={crossed ? m.archive_logs_restore() : m.archive_logs_cross_off()}
								onClick={() => toggleCrossed(entry)}
							/>
						{/if}
						<Button
							label={m.archive_logs_remove()}
							icon={FaIconType.Delete}
							danger
							hideLabel
							onClick={() => onChange(entries.filter((e) => e !== entry))}
						/>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
