<!--
@component
TSK `scarletKeys`: each Key's bearer, one of the campaign's investigators or a Red Coterie NPC,
stored as the entry's string arg. An unassigned Key records nothing.
-->
<script lang="ts">
	import { Dropdown, FaIcon, FaIconType, type OptionOrGroup } from '@5argon/arkham-life-ui';
	import * as m from '$lib/paraglide/messages.js';
	import { itemLabel } from '$lib/campaign/records/campaign-log-source';
	import { firstString, makeEntry, type LocalLog } from '$lib/campaign/records/recorded-state';
	import {
		SCARLET_KEY_NPC_BEARERS,
		SCARLET_KEY_NPC_CODES
	} from '$lib/campaign/campaigns/tsk/bearers';
	import type { RosterSectionProps } from './types';

	let { log, section, entries, investigators, onChange }: RosterSectionProps = $props();

	const keys = $derived(section.items ?? []);
	const keyOf = (id: string) => `${section.id}.${id}`;

	/** Key id → bearer code ('' = unassigned). */
	const bearers = $derived(
		Object.fromEntries(
			keys.map((k) => {
				const e = entries.find((x) => x.key === keyOf(k.id));
				return [k.id, (e && firstString(e.args)) ?? ''];
			})
		)
	);

	function setBearer(keyId: string, bearer: string) {
		const next: LocalLog[] = [];
		for (const k of keys) {
			const b = k.id === keyId ? bearer : bearers[k.id];
			if (b) next.push(makeEntry(section.id, keyOf(k.id), [{ type: 'string', value: b }]));
		}
		onChange(next);
	}

	const bearerOptions = $derived.by((): OptionOrGroup<string>[] => {
		const groups: OptionOrGroup<string>[] = [{ value: '', label: `— ${m.archive_keys_bearer()} —` }];
		if (investigators.length > 0) {
			groups.push({
				groupLabel: m.archive_keys_investigators(),
				options: investigators.map((i) => ({ value: i.code, label: i.name }))
			});
		}
		// NPC bearers in their narrative groups (Red Coterie, and Abarran from Fortune and Folly).
		for (const groupLabel of new Set(SCARLET_KEY_NPC_BEARERS.map((n) => n.group))) {
			groups.push({
				groupLabel,
				options: SCARLET_KEY_NPC_BEARERS.filter((n) => n.group === groupLabel).map((n) => ({
					value: n.code,
					label: n.name
				}))
			});
		}
		return groups;
	});

	const isInvestigatorBearer = (code: string) =>
		!!code && !SCARLET_KEY_NPC_CODES.has(code) && investigators.some((i) => i.code === code);
</script>

<div class="flex flex-col gap-2">
	{#each keys as k (k.id)}
		<div class="flex items-center gap-3">
			<span class="w-40 shrink-0 text-sm font-medium text-black dark:text-white"
				>{itemLabel(log, k.id)}</span
			>
			<div class="flex flex-1 items-center gap-2">
				<div class="flex-1">
					<Dropdown
						label={m.archive_keys_bearer()}
						hideLabel
						options={bearerOptions}
						value={bearers[k.id]}
						onchange={(v) => setBearer(k.id, v)}
					/>
				</div>
				{#if isInvestigatorBearer(bearers[k.id])}
					<span
						class="text-secondary-600 dark:text-secondary-400 shrink-0"
						title={m.archive_keys_borne_by_investigator()}
					>
						<FaIcon icon={FaIconType.Investigator} />
					</span>
				{/if}
			</div>
		</div>
	{/each}
</div>
