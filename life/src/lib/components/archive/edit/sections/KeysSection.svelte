<!--
@component
TSK `scarletKeys` section: the 11 paradimensional artifacts, each with a bearer.
The bearer is either one of the campaign's investigators or one of the 11 Red
Coterie NPCs — stored as a card/NPC code in the first string arg. An empty string
means the key is unassigned.
-->
<script lang="ts">
	import type { CampaignLog, LogSectionDef } from '@5argon/arkham-campaign-data';
	import { Dropdown, FaIcon, FaIconType, type OptionOrGroup } from '@5argon/arkham-life-ui';
	import * as m from '$lib/paraglide/messages.js';
	import { itemLabel } from '$lib/campaign/campaign-log-source';
	import { makeEntry, type LocalLog } from '$lib/campaign/recorded-state';
	import type { InvestigatorRef } from '$lib/campaign/investigators';
	import { SCARLET_KEY_NPC_BEARERS, SCARLET_KEY_NPC_CODES } from '$lib/campaign/tsk';

	interface Props {
		log: CampaignLog;
		section: LogSectionDef;
		entries: LocalLog[];
		investigators: InvestigatorRef[];
		canEdit: boolean;
		onChange: (next: LocalLog[]) => void;
	}

	let { log, section, entries, investigators, canEdit, onChange }: Props = $props();

	const keys = $derived(section.items ?? []);

	function keyOf(id: string) {
		return `${section.id}.${id}`;
	}

	/** Current bearer code per key id (local editable copy). */
	let bearers = $state<Record<string, string>>({});
	$effect(() => {
		const next: Record<string, string> = {};
		for (const k of keys) {
			const e = entries.find((x) => x.key === keyOf(k.id));
			next[k.id] = e?.args.find((a) => a.type === 'string')?.value ?? '';
		}
		bearers = next;
	});

	function commit() {
		const next: LocalLog[] = [];
		for (const k of keys) {
			const bearer = bearers[k.id] ?? '';
			if (bearer) next.push(makeEntry(section.id, keyOf(k.id), [{ type: 'string', value: bearer }]));
		}
		onChange(next);
	}

	const bearerOptions = $derived.by((): OptionOrGroup<string>[] => {
		const groups: OptionOrGroup<string>[] = [{ value: '', label: `— ${m.archive_keys_bearer()} —` }];
		if (investigators.length > 0) {
			groups.push({
				groupLabel: 'Investigators',
				options: investigators.map((i) => ({ value: i.code, label: i.name })),
			});
		}
		// Non-investigator bearers, split into their narrative groups (Red Coterie,
		// plus Abarran from the Fortune and Folly standalone) in declaration order.
		for (const groupLabel of [...new Set(SCARLET_KEY_NPC_BEARERS.map((n) => n.group))]) {
			groups.push({
				groupLabel,
				options: SCARLET_KEY_NPC_BEARERS.filter((n) => n.group === groupLabel).map((n) => ({
					value: n.code,
					label: n.name,
				})),
			});
		}
		return groups;
	});

	/** True when the bearer code is one of the campaign's own investigators (vs an
	 *  unassigned key or a Red Coterie NPC). */
	function isInvestigatorBearer(code: string): boolean {
		return !!code && !SCARLET_KEY_NPC_CODES.has(code) && investigators.some((i) => i.code === code);
	}

	/** Display name for a bearer code, used in read-only mode. */
	function bearerName(code: string): string {
		if (!code) return '—';
		const npc = SCARLET_KEY_NPC_BEARERS.find((n) => n.code === code);
		if (npc) return npc.name;
		const inv = investigators.find((i) => i.code === code);
		if (inv) return inv.name;
		return code;
	}
</script>

<div class="flex flex-col gap-2">
	{#each keys as k (k.id)}
		<div class="flex items-center gap-3">
			<span class="w-40 shrink-0 text-sm font-medium text-black dark:text-white"
				>{itemLabel(log, k.id)}</span
			>
			{#if canEdit}
				<div class="flex flex-1 items-center gap-2">
					<div class="flex-1">
						<Dropdown
							label={m.archive_keys_bearer()}
							hideLabel
							options={bearerOptions}
							value={bearers[k.id] ?? ''}
							onchange={(v) => {
								bearers[k.id] = v;
								commit();
							}}
						/>
					</div>
					{#if isInvestigatorBearer(bearers[k.id] ?? '')}
						<span
							class="text-secondary-600 dark:text-secondary-400 shrink-0"
							title="Borne by one of your investigators"
						>
							<FaIcon icon={FaIconType.Investigator} />
						</span>
					{/if}
				</div>
			{:else}
				<span class="text-primary-500 flex items-center gap-1.5 text-sm">
					{bearerName(bearers[k.id] ?? '')}
					{#if isInvestigatorBearer(bearers[k.id] ?? '')}
						<span
							class="text-secondary-600 dark:text-secondary-400"
							title="Borne by one of your investigators"
						>
							<FaIcon icon={FaIconType.Investigator} />
						</span>
					{/if}
				</span>
			{/if}
		</div>
	{/each}
</div>
