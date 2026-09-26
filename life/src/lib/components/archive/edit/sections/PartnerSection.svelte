<!--
@component
EotE "Expedition Team" (`partner`): each member's portrait with the guide's own marks: name crossed
off, the Resolute checkmark, MIA and its cross-off (rescued), and damage / horror up to health /
sanity (resolute values once resolute). The marks stack independently.
-->
<script lang="ts">
	import type { SectionItem } from '@5argon/arkham-campaign-data';
	import { Button, CardScanFullSmall, Checkbox, getCardImagePath } from '@5argon/arkham-life-ui';
	import * as m from '$lib/paraglide/messages.js';
	import { cardByCode } from '$lib/card-data';
	import { itemLabel, portraitUrl } from '$lib/campaign/records/campaign-log-source';
	import {
		makeEntry,
		partnerArgs,
		readPartner,
		type LocalLog,
		type PartnerMarks
	} from '$lib/campaign/records/recorded-state';
	import Stepper from '../Stepper.svelte';
	import type { SectionProps } from './types';

	let { log, section, entries, onChange }: SectionProps = $props();

	const partners = $derived(section.items ?? []);
	const key = (pid: string) => `${section.id}.${pid}`;
	const read = (pid: string) => readPartner(entries.find((x) => x.key === key(pid))?.args ?? []);
	/** "The survivors of the expedition were:" = every member whose name is not crossed off. */
	const survivors = $derived(partners.filter((p) => !read(p.id).nameCrossed));
	/** Members whose sheet photo failed to load; they fall back to card art. */
	let photoFailed = $state(new Set<string>());

	const maxHealth = (it: SectionItem, st: PartnerMarks) =>
		(st.resolute ? (it.resoluteHealth ?? it.health) : it.health) ?? 0;
	const maxSanity = (it: SectionItem, st: PartnerMarks) =>
		(st.resolute ? (it.resoluteSanity ?? it.sanity) : it.sanity) ?? 0;

	function update(pid: string, patch: Partial<PartnerMarks>) {
		const next: LocalLog[] = [];
		for (const p of partners) {
			const args = partnerArgs(p.id === pid ? { ...read(p.id), ...patch } : read(p.id));
			if (args) next.push(makeEntry(section.id, key(p.id), args));
		}
		onChange(next);
	}
</script>

<div class="flex flex-col gap-4">
	{#if section.id === 'expedition_team'}
		<div class="border-secondary-300 dark:border-secondary-700 bg-secondary-500/5 rounded-lg border p-3">
			<p class="text-secondary-700 dark:text-secondary-300 text-xs font-semibold tracking-wider uppercase">
				{m.archive_partner_survivors({ count: survivors.length, total: partners.length })}
			</p>
			<p class="mt-1 text-sm text-black dark:text-white">
				{survivors.length ? survivors.map((p) => itemLabel(log, p.id)).join(', ') : '—'}
			</p>
		</div>
	{/if}
	{#each partners as p (p.id)}
		{@const st = read(p.id)}
		{@const card = p.code ? cardByCode(p.code) : undefined}
		{@const mh = maxHealth(p, st)}
		{@const ms = maxSanity(p, st)}
		<div class="border-primary-200 dark:border-primary-700 flex gap-3 rounded-lg border p-3">
			<div class="shrink-0">
				{#if !photoFailed.has(p.id)}
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
								class="bg-secondary-500/15 text-secondary-700 dark:text-secondary-300 shrink-0 rounded px-1.5 py-0.5 text-[0.7rem] font-bold tracking-wide uppercase"
								class:line-through={st.miaCrossed}
								class:opacity-60={st.miaCrossed}>{m.archive_partner_mia()}</span
							>
						{/if}
					</div>
					<Button
						label={st.nameCrossed ? m.archive_partner_restore_name() : m.archive_partner_cross_name()}
						onClick={() => update(p.id, { nameCrossed: !st.nameCrossed })}
					/>
				</div>

				<div class="flex flex-wrap items-center gap-x-4 gap-y-1">
					<Checkbox
						label={m.archive_partner_resolute()}
						checked={st.resolute}
						onChange={() => update(p.id, { resolute: !st.resolute })}
					/>
					<div class="inline-flex items-center gap-2">
						<Checkbox
							label={m.archive_partner_mia()}
							checked={st.mia}
							onChange={() => update(p.id, { mia: !st.mia, miaCrossed: st.mia ? false : st.miaCrossed })}
						/>
						{#if st.mia}
							<Button
								label={st.miaCrossed ? m.archive_partner_restore_mia() : m.archive_partner_cross_mia()}
								onClick={() => update(p.id, { miaCrossed: !st.miaCrossed })}
							/>
						{/if}
					</div>
				</div>

				<div class="flex gap-4">
					<div class="flex items-center gap-1.5">
						<span class="text-primary-600 dark:text-primary-300 text-xs">{m.archive_partner_damage()}</span>
						<Stepper value={st.damage} max={mh || undefined} onChange={(v) => update(p.id, { damage: v })} />
					</div>
					<div class="flex items-center gap-1.5">
						<span class="text-primary-600 dark:text-primary-300 text-xs">{m.archive_partner_horror()}</span>
						<Stepper value={st.horror} max={ms || undefined} onChange={(v) => update(p.id, { horror: v })} />
					</div>
				</div>
			</div>
		</div>
	{/each}
</div>
