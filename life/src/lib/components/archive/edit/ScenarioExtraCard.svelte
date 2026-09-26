<!--
@component
One scenario's Extra fields, in ArkhamCards' order: choices asked before the resolution, TSK tiers,
resolution, choices after it, victory display / experience, then choices after that. The name dims
while nothing is recorded (an empty form is not a form of zeros).
-->
<script lang="ts">
	import type { CampaignLog } from '@5argon/arkham-campaign-data';
	import { Checkbox, Dropdown, EncounterSetIcon, FaIcon, FaIconType } from '@5argon/arkham-life-ui';
	import * as m from '$lib/paraglide/messages.js';
	import { isVersionLogInferable, scenarioReference } from '$lib/campaign/campaigns/tsk/solver';
	import {
		SKIPPABLE_SCENARIOS,
		bearerChoiceId,
		clearExtras,
		hasExtras,
		readExtras,
		setExtra,
		withBearerLists,
		type ExtraField
	} from '$lib/campaign/records/extra-fields';
	import type { LocalLog } from '$lib/campaign/records/recorded-state';
	import { choicesForScenario, type ScenarioChoiceDef } from '$lib/campaign/stats/scenario-extras';
	import type { InvestigatorRef } from '$lib/campaign/utils/investigators';
	import { resolutionLabel } from '$lib/campaign/utils/resolutions';
	import { scenarioRepresentativeSet } from '$lib/campaign/utils/standalone-scenarios';
	import { rewardKindLabel } from '$lib/campaign/utils/scenario-reward';
	import ExtraChoiceControl from './ExtraChoiceControl.svelte';
	import NumberField from './NumberField.svelte';
	import { scenarioTitle } from './scenario-title';

	interface Props {
		log: CampaignLog;
		scenario: string;
		logs: LocalLog[];
		investigators: InvestigatorRef[];
		/** Standalone archive: also ask for experience earned on top of a victory display. */
		showEarnedXp: boolean;
		onLogsChange: (next: LocalLog[]) => void;
	}
	let { log, scenario, logs, investigators, showEarnedXp, onLogsChange }: Props = $props();

	const meta = $derived(log.db.scenarioMeta?.find((sm) => sm.id === scenario));
	const victoryDisplay = $derived(meta?.victoryDisplay ?? true);
	const extras = $derived(readExtras(logs, scenario));
	const touched = $derived(hasExtras(logs, scenario));
	const iconSet = $derived(scenarioRepresentativeSet(scenario));
	const tiers = $derived(scenarioReference(scenario));
	const choices = $derived(withBearerLists(choicesForScenario(log, scenario)));
	const placed = (after: ScenarioChoiceDef['after']) => choices.filter((c) => c.choice.after === after);

	const set = (field: ExtraField, value: string | null) =>
		onLogsChange(setExtra(logs, scenario, field, value));
	const numberOf = (v: string | undefined) => (v === undefined ? null : Number(v));
</script>

{#snippet choiceFields(list: typeof choices)}
	{#each list as { choice, bearers } (choice.id)}
		<div class="mt-2">
			<ExtraChoiceControl
				{choice}
				{investigators}
				value={extras[`choice.${choice.id}`] ?? ''}
				bearerValue={bearers ? (extras[`choice.${bearers.id}`] ?? '') : undefined}
				onChange={(value, bearerValue) => {
					let next = setExtra(logs, scenario, `choice.${choice.id}`, value);
					if (bearerValue !== undefined)
						next = setExtra(next, scenario, `choice.${bearerChoiceId(choice.id)}`, bearerValue);
					onLogsChange(next);
				}}
			/>
		</div>
	{/each}
{/snippet}

{#snippet tierField(kind: 'level' | 'version', label: string, options: { id: string; label: string }[])}
	<div class="min-w-0 flex-1">
		<Dropdown
			{label}
			value={extras[`tier.${kind}`] ?? ''}
			options={[{ value: '', label: '—' }, ...options.map((o) => ({ value: o.id, label: o.label }))]}
			onchange={(v) => set(`tier.${kind}`, v)}
		/>
	</div>
{/snippet}

<div class="border-primary-100 dark:border-primary-800 rounded border p-3">
	<div class="mb-2 flex items-center justify-between gap-2">
		<p
			class="flex items-center gap-2 font-medium text-black transition-opacity dark:text-white"
			class:opacity-40={!touched}
		>
			{#if iconSet}
				<span class="text-primary-700 dark:text-primary-300 text-xl leading-none">
					<EncounterSetIcon encounterSet={iconSet} />
				</span>
			{/if}
			{scenarioTitle(log, scenario)}
		</p>
		{#if touched}
			<button
				type="button"
				class="text-primary-400 shrink-0 px-2 py-1 text-sm leading-none hover:text-red-500"
				title={m.archive_extra_clear_scenario()}
				aria-label={m.archive_extra_clear_scenario()}
				onclick={() => onLogsChange(clearExtras(logs, scenario))}
			>
				<FaIcon icon={FaIconType.Clear} />
			</button>
		{/if}
	</div>

	{#if SKIPPABLE_SCENARIOS.has(scenario)}
		<div class="mt-2">
			<Checkbox
				label={m.archive_extra_skipped()}
				checked={!!extras.skipped}
				onChange={() => set('skipped', extras.skipped ? null : '1')}
			/>
		</div>
	{/if}

	{@render choiceFields(placed(undefined))}

	{#if tiers && (tiers.levels.length || tiers.versions.length)}
		<div class="flex flex-wrap gap-3">
			{#if tiers.levels.length}
				{@render tierField('level', m.archive_extra_tier_level(), tiers.levels)}
			{/if}
			{#if tiers.versions.length && !isVersionLogInferable(scenario)}
				{@render tierField('version', m.archive_extra_tier_version(), tiers.versions)}
			{/if}
		</div>
	{/if}

	{#if meta?.resolutions?.length}
		<div class="mt-2 max-w-xs">
			<Dropdown
				label={m.archive_extra_resolution()}
				value={extras.resolution ?? ''}
				options={[
					{ value: '', label: '—' },
					...meta.resolutions.map((r) => ({ value: r, label: resolutionLabel(r) }))
				]}
				onchange={(v) => set('resolution', v)}
			/>
		</div>
	{/if}

	{@render choiceFields(placed('resolution'))}

	<div class="mt-2 w-28">
		<NumberField
			label={rewardKindLabel(victoryDisplay)}
			helpMd={meta?.xpNote}
			value={numberOf(extras.xp)}
			onCommit={(n) => set('xp', n == null ? null : String(n))}
		/>
	</div>

	<!-- An Experience scenario already records its earned XP above. -->
	{#if showEarnedXp && victoryDisplay}
		<div class="mt-2 w-28">
			<NumberField
				label={m.archive_extra_earned_xp()}
				value={numberOf(extras.earnedXp)}
				onCommit={(n) => set('earnedXp', n == null ? null : String(n))}
			/>
		</div>
	{/if}

	{@render choiceFields(placed('victory'))}
</div>
