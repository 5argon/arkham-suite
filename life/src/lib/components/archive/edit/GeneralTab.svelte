<script lang="ts">
	import {
		Checkbox,
		DateField,
		RadioButtons,
		SectionSeparator,
		TextInput
	} from '@5argon/arkham-life-ui';
	import * as m from '$lib/paraglide/messages.js';
	import type { CampaignLog } from '$lib/campaign/campaign-log-source';
	import type { LocalLog } from '$lib/campaign/recorded-state';
	import ChaosBagSection from './sections/ChaosBagSection.svelte';
	import Doc from '$lib/docs/Doc.svelte';

	interface Props {
		canEdit: boolean;
		title: string;
		difficulty: 'easy' | 'standard' | 'hard' | 'expert';
		draft: boolean;
		displayInProfile: 'default' | 'visible' | 'hidden';
		startDate: string;
		finishDate: string;
		/** Campaign log — drives the chaos bag's starting-bag seeding. */
		log: CampaignLog | undefined;
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
		title = $bindable(),
		difficulty = $bindable(),
		draft = $bindable(),
		displayInProfile = $bindable(),
		startDate = $bindable(),
		finishDate = $bindable(),
		log,
		chaosBagEntries,
		onChaosBagChange,
		onDifficultyChange,
		onGeneralChange
	}: Props = $props();
</script>

{#snippet difficultyHelp()}<Doc path="archive/edit/difficulty" />{/snippet}
{#snippet startDateHelp()}<Doc path="archive/edit/start-date" />{/snippet}
{#snippet finishDateHelp()}<Doc path="archive/edit/finish-date" />{/snippet}
{#snippet draftModeHelp()}<Doc path="archive/edit/draft-mode" />{/snippet}
{#snippet displayInProfileHelp()}<Doc path="archive/edit/display-in-profile" />{/snippet}

<div class="mt-4 max-w-xl space-y-4">
	<TextInput
		label={m.archive_campaign_name()}
		bind:value={title}
		oninput={() => onGeneralChange()}
		placeholder={m.archive_campaign_name_placeholder()}
	/>

	<RadioButtons
		label={m.archive_difficulty()}
		bind:selectedValue={difficulty}
		onChange={onDifficultyChange}
		helpContent={difficultyHelp}
		choices={[
			{ value: 'easy', label: 'Easy' },
			{ value: 'standard', label: 'Standard' },
			{ value: 'hard', label: 'Hard' },
			{ value: 'expert', label: 'Expert' }
		]}
	/>

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
				entries={chaosBagEntries}
				onChange={onChaosBagChange}
			/>
		</div>
	{/if}
</div>
