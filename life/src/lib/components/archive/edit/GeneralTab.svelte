<!--
@component
The General tab: title, difficulty, dates, draft, profile visibility, and the final chaos bag. Every
field saves as it changes.
-->
<script lang="ts">
	import { Checkbox, DateField, RadioButtons, SectionSeparator, TextInput } from '@5argon/arkham-life-ui';
	import * as m from '$lib/paraglide/messages.js';
	import Doc from '$lib/docs/Doc.svelte';
	import type { LocalLog } from '$lib/campaign/records/recorded-state';
	import { DIFFICULTY_ORDER, difficultyLabel } from '$lib/campaign/utils/difficulty';
	import { databaseStore } from '$lib/database/database.svelte';
	import type {
		CampaignGeneralFields,
		CampaignRecord,
		Difficulty,
		DisplayInProfile
	} from '$lib/database/document';
	import ChaosBagSection from './sections/ChaosBagSection.svelte';
	import { fromDateInput, toDateInput } from './date-input';

	interface Props {
		record: CampaignRecord;
		isStandalone: boolean;
		/** Difficulties a standalone scenario offers; absent = all four. */
		difficultyOptions?: string[];
		/** No campaign log (unspecified campaign) has no chaos bag to record. */
		showChaosBag: boolean;
		/** Starting chaos bags per difficulty; null = none. */
		startingBags: Record<string, Record<string, number>> | null;
		chaosBagEntries: LocalLog[];
		onChaosBagChange: (next: LocalLog[]) => void;
		/** The difficulty changed (the page may re-seed the chaos bag). */
		onDifficultyChange: (next: Difficulty, previous: Difficulty) => void;
	}
	let {
		record,
		isStandalone,
		difficultyOptions,
		showChaosBag,
		startingBags,
		chaosBagEntries,
		onChaosBagChange,
		onDifficultyChange
	}: Props = $props();

	const update = (fields: CampaignGeneralFields) =>
		databaseStore.updateCampaignGeneral(record.id, fields);

	const difficultyChoices = $derived(
		DIFFICULTY_ORDER.filter((d) => !difficultyOptions?.length || difficultyOptions.includes(d)).map(
			(d) => ({ value: d as Difficulty, label: difficultyLabel(d) })
		)
	);
	const displayChoices: { value: DisplayInProfile; label: string }[] = [
		{ value: 'default', label: m.archive_display_default() },
		{ value: 'visible', label: m.archive_display_visible() },
		{ value: 'hidden', label: m.archive_display_hidden() }
	];
</script>

{#snippet difficultyHelp()}<Doc path="archive/edit/difficulty" />{/snippet}
{#snippet startDateHelp()}<Doc path="archive/edit/start-date" />{/snippet}
{#snippet finishDateHelp()}<Doc path="archive/edit/finish-date" />{/snippet}
{#snippet draftModeHelp()}<Doc path="archive/edit/draft-mode" />{/snippet}
{#snippet displayInProfileHelp()}<Doc path="archive/edit/display-in-profile" />{/snippet}

<div class="mt-4 max-w-xl space-y-4">
	<TextInput
		label={isStandalone ? m.archive_standalone_title() : m.archive_campaign_name()}
		value={record.title}
		oninput={(title) => update({ title })}
		placeholder={isStandalone
			? m.archive_standalone_title_placeholder()
			: m.archive_campaign_name_placeholder()}
	/>

	{#if difficultyChoices.length <= 1}
		<div>
			<p class="text-primary-500 text-xs">{m.archive_difficulty()}</p>
			<p class="text-primary-700 dark:text-primary-300">
				{difficultyChoices[0]?.label ?? difficultyLabel('standard')}
			</p>
		</div>
	{:else}
		<RadioButtons
			label={m.archive_difficulty()}
			selectedValue={record.difficulty}
			onChange={(next) => {
				const previous = record.difficulty;
				if (next === previous) return;
				update({ difficulty: next });
				onDifficultyChange(next, previous);
			}}
			helpContent={difficultyHelp}
			choices={difficultyChoices}
		/>
	{/if}

	<DateField
		label={m.archive_start_date()}
		value={toDateInput(record.startDate)}
		onchange={(v) => update({ startDate: fromDateInput(v) })}
		name="startDate"
		helpContent={startDateHelp}
		clearable
	/>

	<DateField
		label={m.archive_finish_date()}
		value={toDateInput(record.finishDate)}
		onchange={(v) => update({ finishDate: fromDateInput(v) })}
		name="finishDate"
		helpContent={finishDateHelp}
		clearable
	/>

	<Checkbox
		label={m.archive_draft()}
		checked={record.draft}
		onChange={() => update({ draft: !record.draft })}
		helpContent={draftModeHelp}
	/>

	<RadioButtons
		label={m.archive_display_in_profile()}
		selectedValue={record.displayInProfile ?? 'default'}
		onChange={(displayInProfile) => update({ displayInProfile })}
		helpContent={displayInProfileHelp}
		choices={displayChoices}
	/>

	{#if showChaosBag}
		<div class="space-y-3">
			<SectionSeparator title={m.archive_chaos_bag()} />
			<ChaosBagSection
				{startingBags}
				difficulty={record.difficulty}
				entries={chaosBagEntries}
				onChange={onChaosBagChange}
			/>
		</div>
	{/if}
</div>
