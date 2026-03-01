<!--
@component
EoE "Expedition Team" `partner` section. Each member shows its investigator-card
portrait, name, and the affordances the campaign log offers — faithful to the
guide rather than an abstracted "status":

  • cross off the NAME (the member was killed / removed)
  • a "checkmark" when the member becomes RESOLUTE (a stackable mark)
  • mark the member MIA, and separately cross off "MIA" (they were rescued)
  • Damage / Horror, bounded by health / sanity (resolute values when resolute)

These are independent, stackable toggles — e.g. a member can be rescued (MIA
crossed off) yet still later have their name crossed off (rescued, then died).
Stored keyed `"<section>.<partnerId>"`, params = [...statusFlags, damage, horror].
Survival for "There and Back Again" = the name was never crossed off.
-->
<script lang="ts">
	import type { Card } from '@5argon/arkham-kohaku';
	import type { CampaignLog, LogSectionDef, SectionItem } from '@5argon/arkham-campaign-data';
	import { Button, CardScanFullSmall, Checkbox, getCardImagePath } from '@5argon/arkham-life-ui';
	import * as m from '$lib/paraglide/messages.js';
	import { itemLabel, portraitUrl } from '$lib/campaign/campaign-log-source';
	import { makeEntry, type LocalLog } from '$lib/campaign/recorded-state';

	interface Props {
		log: CampaignLog;
		section: LogSectionDef;
		entries: LocalLog[];
		cards: Card[];
		canEdit: boolean;
		onChange: (next: LocalLog[]) => void;
	}

	let { log, section, entries, cards, canEdit, onChange }: Props = $props();

	const partners = $derived(section.items ?? []);
	const cardByCode = $derived(new Map(cards.map((c) => [c.code, c])));
	// The campaign log's "the survivors of the expedition were:" line is derived
	// live from the roster — every member whose name is not crossed off — rather
	// than recorded separately (matches the "There and Back Again" survival rule).
	const survivors = $derived(partners.filter((p) => !read(p.id).nameCrossed));
	// Members whose cropped sheet photo failed to load → fall back to card art.
	let photoFailed = $state(new Set<string>());

	function key(pid: string) {
		return `${section.id}.${pid}`;
	}

	interface PartnerState {
		/** The member's name has been crossed off (killed / removed). */
		nameCrossed: boolean;
		/** A checkmark — the member became resolute. */
		resolute: boolean;
		/** The member is marked MIA. */
		mia: boolean;
		/** "MIA" has been crossed off — the member was rescued. */
		miaCrossed: boolean;
		damage: number;
		horror: number;
	}
	// Status flags stored as string params (order-independent); a member can hold
	// several at once. `name_crossed` is what "There and Back Again" checks absent.
	function read(pid: string): PartnerState {
		const e = entries.find((x) => x.key === key(pid));
		const flags = new Set((e?.args ?? []).filter((a) => a.type === 'string').map((a) => a.value));
		const nums = (e?.args ?? []).filter((a) => a.type === 'number').map((a) => Number(a.value) || 0);
		return {
			nameCrossed: flags.has('name_crossed'),
			resolute: flags.has('resolute'),
			mia: flags.has('mia'),
			miaCrossed: flags.has('mia_crossed'),
			damage: nums[0] ?? 0,
			horror: nums[1] ?? 0,
		};
	}
	function flagsOf(st: PartnerState): string[] {
		const f: string[] = [];
		if (st.nameCrossed) f.push('name_crossed');
		if (st.resolute) f.push('resolute');
		if (st.mia) f.push('mia');
		if (st.miaCrossed) f.push('mia_crossed');
		return f;
	}
	function maxHealth(it: SectionItem, st: PartnerState): number {
		return st.resolute ? (it.resoluteHealth ?? it.health ?? 0) : (it.health ?? 0);
	}
	function maxSanity(it: SectionItem, st: PartnerState): number {
		return st.resolute ? (it.resoluteSanity ?? it.sanity ?? 0) : (it.sanity ?? 0);
	}

	function update(pid: string, patch: Partial<PartnerState>) {
		const next: LocalLog[] = [];
		for (const p of partners) {
			const st = p.id === pid ? { ...read(p.id), ...patch } : read(p.id);
			const flags = flagsOf(st);
			if (flags.length || st.damage > 0 || st.horror > 0) {
				next.push(
					makeEntry(section.id, key(p.id), [
						...flags.map((value) => ({ type: 'string' as const, value })),
						{ type: 'number' as const, value: String(st.damage) },
						{ type: 'number' as const, value: String(st.horror) },
					]),
				);
			}
		}
		onChange(next);
	}

	/** Read-only one-line summary of a member's recorded marks. */
	function summary(st: PartnerState): string {
		const parts: string[] = [];
		if (st.resolute) parts.push('Resolute ✓');
		if (st.mia) parts.push(st.miaCrossed ? 'MIA (rescued)' : 'MIA');
		if (st.nameCrossed) parts.push('name crossed off');
		return parts.join(' · ') || '—';
	}
</script>

<div class="flex flex-col gap-4">
	{#if section.id === 'expedition_team'}
		<!-- Derived "survivors of the expedition" — the log line that otherwise has no
		     prompt; filled in automatically from who is not crossed off below. -->
		<div class="border-secondary-300 dark:border-secondary-700 bg-secondary-500/5 rounded-lg border p-3">
			<p class="text-secondary-700 dark:text-secondary-300 text-xs font-semibold uppercase tracking-wider">
				The survivors of the expedition were ({survivors.length}/{partners.length})
			</p>
			<p class="mt-1 text-sm text-black dark:text-white">
				{survivors.length ? survivors.map((p) => itemLabel(log, p.id)).join(', ') : '—'}
			</p>
		</div>
	{/if}
	{#each partners as p (p.id)}
		{@const st = read(p.id)}
		{@const card = p.code ? cardByCode.get(p.code) : undefined}
		{@const mh = maxHealth(p, st)}
		{@const ms = maxSanity(p, st)}
		<div class="border-primary-200 dark:border-primary-700 flex gap-3 rounded-lg border p-3">
			<div class="shrink-0">
				{#if !photoFailed.has(p.id)}
					<!-- The member's partner card, square-cropped (codes ride on the roster
					     items); other partner sections without codes fall back to a sheet photo. -->
					<img
						src={p.code ? getCardImagePath(p.code, 'square') : portraitUrl(log.db.code, p.id)}
						alt={itemLabel(log, p.id)}
						class="border-primary-200 dark:border-primary-700 h-30 w-30 rounded border object-cover"
						onerror={() => (photoFailed = new Set([...photoFailed, p.id]))}
					/>
				{:else if card}
					<CardScanFullSmall {card} showCardName={false} />
				{:else}
					<div
						class="bg-primary-100 dark:bg-primary-800 text-primary-400 flex h-42 w-30 items-center justify-center rounded text-xs"
					>
						{itemLabel(log, p.id)}
					</div>
				{/if}
			</div>
			<div class="flex min-w-0 flex-1 flex-col gap-2">
				<!-- Name (crossed off when the member is killed / removed), with the MIA
				     marker shown right beside it — struck through once rescued. -->
				<div class="flex items-center justify-between gap-2">
					<div class="flex min-w-0 items-center gap-2">
						<p
							class="text-sm font-semibold text-black dark:text-white"
							class:line-through={st.nameCrossed}
							class:opacity-60={st.nameCrossed}
						>
							{itemLabel(log, p.id)}
						</p>
						{#if st.mia}
							<span
								class="bg-secondary-500/15 text-secondary-700 dark:text-secondary-300 shrink-0 rounded px-1.5 py-0.5 text-[0.7rem] font-bold uppercase tracking-wide"
								class:line-through={st.miaCrossed}
								class:opacity-60={st.miaCrossed}>MIA</span
							>
						{/if}
					</div>
					{#if canEdit}
						<Button
							label={st.nameCrossed ? 'Restore name' : 'Cross off name'}
							onClick={() => update(p.id, { nameCrossed: !st.nameCrossed })}
						/>
					{/if}
				</div>

				{#if canEdit}
					<div class="flex flex-wrap items-center gap-x-4 gap-y-1">
						<Checkbox
							label="Checkmark (Resolute)"
							checked={st.resolute}
							onChange={() => update(p.id, { resolute: !st.resolute })}
						/>
						<!-- MIA toggle and its rescue (cross-off) action stay on one line. -->
						<div class="inline-flex items-center gap-2">
							<Checkbox
								label="MIA"
								checked={st.mia}
								onChange={() => update(p.id, { mia: !st.mia, miaCrossed: st.mia ? false : st.miaCrossed })}
							/>
							{#if st.mia}
								<Button
									label={st.miaCrossed ? 'Restore MIA' : 'Cross off MIA (rescued)'}
									onClick={() => update(p.id, { miaCrossed: !st.miaCrossed })}
								/>
							{/if}
						</div>
					</div>
				{:else}
					<span class="text-primary-500 text-sm">{summary(st)}</span>
				{/if}

				<div class="flex gap-4">
					<div class="flex items-center gap-1.5">
						<span class="text-primary-600 dark:text-primary-300 text-xs">{m.archive_partner_damage()}</span>
						{#if canEdit}
							<Button label="−" onClick={() => update(p.id, { damage: Math.max(0, st.damage - 1) })} />
						{/if}
						<span class="text-primary-600 dark:text-primary-300 min-w-6 text-center text-sm font-bold tabular-nums"
							>{st.damage}{#if mh}<span class="text-primary-400">/{mh}</span>{/if}</span
						>
						{#if canEdit}
							<Button label="+" onClick={() => update(p.id, { damage: Math.min(mh || 99, st.damage + 1) })} />
						{/if}
					</div>
					<div class="flex items-center gap-1.5">
						<span class="text-primary-600 dark:text-primary-300 text-xs">{m.archive_partner_horror()}</span>
						{#if canEdit}
							<Button label="−" onClick={() => update(p.id, { horror: Math.max(0, st.horror - 1) })} />
						{/if}
						<span class="text-primary-600 dark:text-primary-300 min-w-6 text-center text-sm font-bold tabular-nums"
							>{st.horror}{#if ms}<span class="text-primary-400">/{ms}</span>{/if}</span
						>
						{#if canEdit}
							<Button label="+" onClick={() => update(p.id, { horror: Math.min(ms || 99, st.horror + 1) })} />
						{/if}
					</div>
				</div>
			</div>
		</div>
	{/each}
</div>
