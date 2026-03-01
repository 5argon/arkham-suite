<!--
@component
The workhorse recording component for `notes`-type sections (Campaign Notes,
Missing Persons, Memories, Locations, Artifacts Earned, Possible Suspects, …).
Entries come from campaign-data `sectionEntries()`, so the dropdown is naturally
scoped to *this* section's valid entries only. Recorded entries are kept in the
flat editor model; the component owns its section's slice and pushes a whole
replacement up via `onChange`.

Per-entry kind drives the input: `note` → presence checkbox; `count`/`task` →
a number (with optional min/max); `text` → free text. Spoiler-protected text is
rendered via SpoilerEntryText (blurred in the picker, revealed once recorded —
the player already knows it).
-->
<script lang="ts">
	import {
		sectionEntries,
		type CampaignLog,
		type LogSectionDef,
		type ResolvedLogEntry,
	} from '@5argon/arkham-campaign-data';
	import {
		Button,
		CardFormSingle,
		Dropdown,
		FaIcon,
		FaIconType,
		SearchableDropdown,
		TextInput,
	} from '@5argon/arkham-life-ui';
	import { card, type Card } from '@5argon/arkham-kohaku';
	import * as m from '$lib/paraglide/messages.js';
	import { getAllCards, createCardResolver } from '$lib/card-data';
	import { itemLabel, portraitUrl } from '$lib/campaign/campaign-log-source';
	import { CROSSED_MARK, hasCrossedMark, makeEntry, type LocalLog } from '$lib/campaign/recorded-state';
	import SpoilerEntryText from '../SpoilerEntryText.svelte';

	interface Props {
		log: CampaignLog;
		section: LogSectionDef;
		/** This section's current slice of the flat editor model. */
		entries: LocalLog[];
		canEdit: boolean;
		onChange: (next: LocalLog[]) => void;
		/** Extra recordable entries contributed by standalones played inside this
		 *  campaign (recorded in the Extra tab) — offered in the dropdown and stored
		 *  as ordinary ordered entries. Resolved against the standalone's source log. */
		extraEntries?: ResolvedLogEntry[];
		/** Standalone source name per extra-entry key (drives the "from a standalone" marker). */
		extraSource?: Map<string, string>;
	}

	let { log, section, entries, canEdit, onChange, extraEntries = [], extraSource }: Props = $props();

	// This section's own entries PLUS any standalone-contributed ones (offered + resolved here).
	const available = $derived([
		...sectionEntries(log, section.id).filter((e) => !e.def.hidden),
		...extraEntries,
	]);
	const fromStandalone = (key: string): string | undefined => extraSource?.get(key);
	// A `cards`/choice entry (e.g. EotE "#name# was killed in the plane crash.")
	// asks the player to pick an expedition member — offer the campaign's partner
	// roster as the name choices.
	const partnerSection = $derived(log.db.sections.find((s) => s.type === 'partner'));
	const nameChoices = $derived(
		(partnerSection?.items ?? []).map((it) => ({ value: it.id, label: itemLabel(log, it.id) })),
	);
	// A cards/choice `#name#` resolves either to a campaign partner (EotE expedition
	// roster) or — when the campaign has no partner roster — to a *unique* player
	// card the player searches for (e.g. TSK "Erased from existence: #name#"). The
	// chosen value is then a card code rather than a partner item id.
	const nameMode = $derived<'partner' | 'card'>(partnerSection ? 'partner' : 'card');
	const cardResolver = createCardResolver();
	const uniquePlayerCards = $derived(
		nameMode === 'card'
			? getAllCards().filter(card.playerCardsNonCampaignFilter).filter((c) => c.unique === true)
			: [],
	);
	/** The card pool offered for the PENDING entry's `#name#`: when the entry declares a
	 *  `cardFilter` (e.g. Stashed → assets, Alarm level → investigators) use that; otherwise
	 *  the default unique-player-card pool. */
	const pendingCardPool = $derived.by(() => {
		const cf = pending?.def.cardFilter;
		if (!cf) return uniquePlayerCards;
		let pool = getAllCards();
		if (cf.types?.length) pool = pool.filter((c) => cf.types!.includes(c.cardType));
		if (cf.codes?.length) pool = pool.filter((c) => cf.codes!.includes(c.code));
		return pool;
	});
	function resolveCardSafe(code: string): Card | null {
		try {
			return cardResolver.resolve(code);
		} catch {
			return null;
		}
	}
	const isCrossed = (entry: LocalLog) => hasCrossedMark(entry.args);
	// Card-code-keyed notes sections (TCU Missing Persons 05046–05049) carry a
	// portrait on the sheet; attempt it and hide gracefully if absent.
	const hasPortrait = $derived(/^\d{5}$/.test(section.id));
	let photoFailed = $state(false);
	const byKey = $derived(new Map(available.map((e) => [e.key, e])));
	const recordedKeys = $derived(new Set(entries.map((e) => e.key)));
	/** Entries still offerable: a plain note disappears once recorded (presence — no
	 *  duplicates), but a `repeatable` entry (its identity is the card + number it carries,
	 *  e.g. Fortune and Folly's Stashed / Alarm level) stays selectable so you can add more. */
	const selectable = $derived(
		available.filter((e) => e.def.repeatable || !recordedKeys.has(e.key)),
	);

	// Display in ENTRY order (the order recorded), because that sequence is now
	// meaningful — it implies the play order / travel path (TSK Routings). The
	// player can reorder with the move up/down controls.
	const orderedEntries = $derived(entries);

	/** Swap a recorded entry with its neighbour (reorder within this section). */
	function move(index: number, dir: -1 | 1) {
		const j = index + dir;
		if (j < 0 || j >= entries.length) return;
		const next = [...entries];
		[next[index], next[j]] = [next[j], next[index]];
		onChange(next);
	}

	// ─── Pending input (entries that need a count / text before adding) ──────────
	let pending = $state<ResolvedLogEntry | null>(null);
	let pendingValue = $state('');
	/** Secondary count for a cards-choice entry whose text carries `#X#` (e.g. Fortune
	 *  and Folly's "Stashed: #name# (#X#)") — recorded as a number arg alongside the card. */
	let pendingCount = $state('');
	const pendingNeedsCount = $derived(!!pending && paramType(pending) === 'name' && /#X#/.test(pending.en.text));

	function paramType(entry: ResolvedLogEntry): 'count' | 'text' | 'name' | null {
		const p = entry.def.param;
		if (!p) return null;
		if (p.type === 'count' || p.type === 'investigatorCount') return 'count';
		if (p.type === 'text') return 'text';
		if (p.type === 'cards' && p.cards?.mode === 'choice') return 'name';
		return null; // fixed card lists are handled by dedicated section types
	}

	function handleSelect(entry: ResolvedLogEntry) {
		const pt = paramType(entry);
		if (pt) {
			pending = entry;
			pendingValue = '';
			pendingCount = '';
			return;
		}
		add(entry, []);
	}

	function add(entry: ResolvedLogEntry, args: LocalLog['args']) {
		onChange([...entries, makeEntry(section.id, entry.key, args)]);
	}

	function confirmPending() {
		if (!pending) return;
		const pt = paramType(pending);
		if (pt === 'name' && !pendingValue) return; // a name must be chosen
		const args =
			pt === 'count'
				? [{ type: 'number' as const, value: String(Number(pendingValue) || 0) }]
				: pt === 'text' || pt === 'name'
					? pendingNeedsCount
						? [
								{ type: 'string' as const, value: pendingValue },
								{ type: 'number' as const, value: String(Number(pendingCount) || 0) },
							]
						: [{ type: 'string' as const, value: pendingValue }]
					: [];
		add(pending, args);
		pending = null;
		pendingValue = '';
		pendingCount = '';
	}

	function remove(target: LocalLog) {
		onChange(entries.filter((e) => e !== target));
	}

	/** Toggle a cross-off-able entry between recorded and crossed-off (kept on record). */
	function toggleCrossed(target: LocalLog) {
		const args = isCrossed(target)
			? target.args.filter((a) => !(a.type === 'string' && a.value === CROSSED_MARK))
			: [...target.args, { type: 'string' as const, value: CROSSED_MARK }];
		onChange(entries.map((e) => (e === target ? { ...e, args } : e)));
	}

	/** Display text for a recorded entry (substitutes a recorded count into `#X#`
	 *  and the chosen member name into `#name#`). */
	function displayText(entry: LocalLog): string | undefined {
		const resolved = byKey.get(entry.key);
		if (!resolved) return undefined;
		let text = resolved.en.text;
		const num = entry.args.find((a) => a.type === 'number')?.value;
		if (num !== undefined) text = text.replace(/#X#/g, num);
		const name = entry.args.find((a) => a.type === 'string' && a.value !== CROSSED_MARK)?.value;
		if (name) {
			const label = nameMode === 'card' ? (resolveCardSafe(name)?.name ?? name) : itemLabel(log, name);
			text = text.replace(/#name#/gi, label);
		}
		return text;
	}
</script>

<div class="space-y-2">
	{#if hasPortrait && !photoFailed}
		<!-- Portrait cropped from the official sheet (e.g. TCU Missing Persons mugshot). -->
		<img
			src={portraitUrl(log.db.code, section.id)}
			alt=""
			class="border-primary-200 dark:border-primary-700 h-28 w-24 rounded border object-cover"
			onerror={() => (photoFailed = true)}
		/>
	{/if}
	{#if canEdit}
		<SearchableDropdown
			label={m.archive_logs_search_label()}
			placeholder={m.archive_logs_search_placeholder()}
			items={selectable}
			fuzzyThreshold={0.4}
			searchKeys={['en.text']}
			onSelect={handleSelect}
		>
			{#snippet renderItem(item)}
				<SpoilerEntryText class="text-sm text-black dark:text-white" en={item.en} />
			{/snippet}
		</SearchableDropdown>

		{#if pending}
			{@const pt = paramType(pending)}
			<div class="bg-primary-50 dark:bg-primary-900 space-y-2 rounded border p-3">
				<SpoilerEntryText class="text-sm font-semibold text-black dark:text-white" en={pending.en} reveal />
				{#if pt === 'name' && nameMode === 'card'}
					<CardFormSingle
						label="Search a card"
						placeholder="Search by card name"
						cards={pendingCardPool}
						selectedCard={pendingValue ? resolveCardSafe(pendingValue) : null}
						onSelect={(c) => (pendingValue = c.code)}
					/>
				{:else if pt === 'name'}
					<Dropdown
						label="Choose a name"
						value={pendingValue}
						options={[{ value: '', label: '—' }, ...nameChoices]}
						onchange={(v) => (pendingValue = v)}
					/>
				{:else}
					<TextInput
						label={pt === 'count' ? m.archive_logs_count_label() : m.archive_logs_text_label()}
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
	{/if}

	{#if entries.length === 0}
		<p class="text-primary-400 dark:text-primary-500 text-sm">{m.archive_logs_empty()}</p>
	{:else}
		<div class="flex flex-col gap-2">
			{#each orderedEntries as entry, i (entry.clientId)}
				{@const resolved = byKey.get(entry.key)}
				{@const crossed = isCrossed(entry)}
				{@const standalone = fromStandalone(entry.key)}
				<div
					class="bg-primary-100 dark:bg-primary-800 flex items-center justify-between gap-2 rounded p-3"
				>
					<div class="flex min-w-0 flex-1 items-center gap-2">
						{#if standalone}
							<span
								class="text-secondary-600 dark:text-secondary-400 shrink-0"
								title={`From the standalone "${standalone}"`}
							>
								<FaIcon icon={FaIconType.StandaloneSource} />
							</span>
						{/if}
						{#if resolved}
							<SpoilerEntryText
								class={`text-sm font-semibold text-black dark:text-white${crossed ? ' line-through opacity-60' : ''}`}
								en={resolved.en}
								text={displayText(entry)}
								reveal
							/>
						{:else}
							<span
								class="text-sm font-semibold text-black dark:text-white"
								class:line-through={crossed}
								class:opacity-60={crossed}>{entry.key}</span
							>
						{/if}
					</div>
					{#if canEdit}
						<div class="flex shrink-0 items-center gap-1">
							<Button
								label="Move up"
								icon={FaIconType.ArrowUp}
								hideLabel
								disabled={i === 0}
								onClick={() => move(i, -1)}
							/>
							<Button
								label="Move down"
								icon={FaIconType.ArrowDown}
								hideLabel
								disabled={i === orderedEntries.length - 1}
								onClick={() => move(i, 1)}
							/>
							{#if resolved?.def.crossOut}
								<Button
									label={crossed ? 'Restore' : 'Cross off'}
									onClick={() => toggleCrossed(entry)}
								/>
							{/if}
							<Button
								label={m.archive_logs_remove()}
								icon={FaIconType.Delete}
								danger
								hideLabel
								onClick={() => remove(entry)}
							/>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>
