<script lang="ts">
	import {
		Checkbox,
		DateField,
		RadioButtons,
		SectionSeparator,
		TextInput
	} from '@5argon/arkham-life-ui';
	import * as m from '$lib/paraglide/messages.js';
	import type { CampaignLog } from '$lib/campaign/records/campaign-log-source';
	import type { LocalLog } from '$lib/campaign/records/recorded-state';
	import ChaosBagSection from './sections/ChaosBagSection.svelte';
	import Doc from '$lib/docs/Doc.svelte';

	interface Props {
		canEdit: boolean;
		/** Standalone archive — swaps campaign-specific labels for standalone wording. */
		isStandalone?: boolean;
		title: string;
		difficulty: 'easy' | 'standard' | 'hard' | 'expert';
		draft: boolean;
		displayInProfile: 'default' | 'visible' | 'hidden';
		startDate: string;
		finishDate: string;
		/** Campaign log — drives the chaos bag's starting-bag seeding. */
		log: CampaignLog | undefined;
		/** Limit the difficulty radio to these (standalone setup); absent ⇒ all four. */
		difficultyOptions?: string[];
		/** Standalone override for the chaos-bag starting bags; `undefined` ⇒ use the campaign log's. */
		startingChaosBag?: Record<string, Record<string, number>> | null;
		/** Chaos bag entries (reserved `__chaos_bag` log section). */
		chaosBagEntries: LocalLog[];
		onChaosBagChange: (next: LocalLog[]) => void;
		/** Called when the difficulty radio changes (lets the page prompt about chaos-bag re-init). */
		onDifficultyChange?: (value: 'easy' | 'standard' | 'hard' | 'expert') => void;
		/** Autosave callback: fired whenever a general field changes. */
		onGeneralChange: () => void;
	}

	let {
		canEdit,
		isStandalone = false,
		title = $bindable(),
		difficulty = $bindable(),
		draft = $bindable(),
		displayInProfile = $bindable(),
		startDate = $bindable(),
		finishDate = $bindable(),
		log,
		difficultyOptions,
		startingChaosBag,
		chaosBagEntries,
		onChaosBagChange,
		onDifficultyChange,
		onGeneralChange
	}: Props = $props();

	const allDifficultyChoices: { value: 'easy' | 'standard' | 'hard' | 'expert'; label: string }[] = [
		{ value: 'easy', label: 'Easy' },
		{ value: 'standard', label: 'Standard' },
		{ value: 'hard', label: 'Hard' },
		{ value: 'expert', label: 'Expert' }
	];
	// A standalone scenario allows only a subset of difficulties; a single allowed
	// difficulty is shown as a fixed label rather than a radio.
	const difficultyChoices = $derived(
		difficultyOptions && difficultyOptions.length
			? allDifficultyChoices.filter((c) => difficultyOptions.includes(c.value))
			: allDifficultyChoices
	);
</script>

{#snippet difficultyHelp()}<Doc path="archive/edit/difficulty" />{/snippet}
{#snippet startDateHelp()}<Doc path="archive/edit/start-date" />{/snippet}
{#snippet finishDateHelp()}<Doc path="archive/edit/finish-date" />{/snippet}
{#snippet draftModeHelp()}<Doc path="archive/edit/draft-mode" />{/snippet}
{#snippet displayInProfileHelp()}<Doc path="archive/edit/display-in-profile" />{/snippet}

<div class="mt-4 max-w-xl space-y-4">
	<TextInput
		label={isStandalone ? 'Title' : m.archive_campaign_name()}
		bind:value={title}
		oninput={() => onGeneralChange()}
		placeholder={isStandalone ? 'e.g. Carnevale solo run' : m.archive_campaign_name_placeholder()}
	/>

	{#if difficultyChoices.length <= 1}
		<div>
			<p class="text-primary-500 text-xs">{m.archive_difficulty()}</p>
			<p class="text-primary-700 dark:text-primary-300">
				{difficultyChoices[0]?.label ?? 'Standard'}
			</p>
		</div>
	{:else}
		<RadioButtons
			label={m.archive_difficulty()}
			bind:selectedValue={difficulty}
			onChange={onDifficultyChange}
			helpContent={difficultyHelp}
			choices={difficultyChoices}
		/>
	{/if}

	<DateField
		label={m.archive_start_date()}
		bind:value={startDate}
		onchange={() => onGeneralChange()}
		name="startDate"
		helpContent={startDateHelp}
		clearable
	/>

	<DateField
		label={m.archive_finish_date()}
		bind:value={finishDate}
		onchange={() => onGeneralChange()}
		name="finishDate"
		helpContent={finishDateHelp}
		clearable
	/>

	<Checkbox
		label={m.archive_draft()}
		bind:checked={draft}
		onChange={() => onGeneralChange()}
		helpContent={draftModeHelp}
	/>

	<RadioButtons
		label={m.archive_display_in_profile()}
		bind:selectedValue={displayInProfile}
		onChange={() => onGeneralChange()}
		helpContent={displayInProfileHelp}
		choices={[
			{ value: 'default', label: 'Default' },
			{ value: 'visible', label: 'Visible' },
			{ value: 'hidden', label: 'Hidden' }
		]}
	/>

	<!-- Chaos bag: campaign setup, seeded from the difficulty selected above. -->
	{#if log}
		<div class="space-y-3">
			<SectionSeparator title={m.archive_chaos_bag()} />
			<ChaosBagSection
				{log}
				{difficulty}
				{canEdit}
				{startingChaosBag}
				entries={chaosBagEntries}
				onChange={onChaosBagChange}
			/>
		</div>
	{/if}
</div>
