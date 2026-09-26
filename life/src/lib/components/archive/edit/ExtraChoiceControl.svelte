<!--
@component
The input for one campaign-data Extra choice: dropdown, radio (labels may carry `[skull]` glyphs),
counter, or a filtered card picker. A `cards` choice with a bearer list gets one box per investigator.
-->
<script lang="ts">
	import { CardFormMultiple, Dropdown, parseArkhamMarkup, RadioButtons } from '@5argon/arkham-life-ui';
	import type { CardCode } from '@5argon/arkham-kohaku';
	import { getAllCards } from '$lib/card-data';
	import { splitCodes } from '$lib/campaign/records/extra-fields';
	import type { ScenarioChoiceDef } from '$lib/campaign/stats/scenario-extras';
	import type { InvestigatorRef } from '$lib/campaign/utils/investigators';
	import { cardPoolFor } from './card-pool';
	import InvestigatorCardPicker from './InvestigatorCardPicker.svelte';
	import NumberField from './NumberField.svelte';

	interface Props {
		choice: ScenarioChoiceDef;
		value: string;
		investigators: InvestigatorRef[];
		/** The bearer list's value, when the choice has one. */
		bearerValue?: string;
		onChange: (value: string, bearerValue?: string) => void;
	}
	let { choice, value, investigators, bearerValue, onChange }: Props = $props();

	const blank = { value: '', label: '—' };
	const pool = $derived(
		choice.control === 'cards'
			? cardPoolFor(choice.cardFilter, getAllCards(), new Set(investigators.map((i) => i.code)))
			: []
	);
</script>

{#snippet glyphLabel(text: string)}{@html parseArkhamMarkup(text)}{/snippet}

{#if choice.control === 'cards' && bearerValue !== undefined}
	<div class="max-w-md">
		<p class="text-primary-600 dark:text-primary-300 mb-1 text-xs font-medium">{choice.label}</p>
		<InvestigatorCardPicker
			{investigators}
			cards={pool}
			cardCsv={value}
			investigatorCsv={bearerValue}
			{onChange}
		/>
	</div>
{:else if choice.control === 'cards'}
	<div class="max-w-md">
		<CardFormMultiple
			label={choice.label}
			cards={pool}
			selectedCodes={splitCodes(value) as CardCode[]}
			onSelectionChange={(codes) => onChange(codes.join(','))}
			allowDuplicates={false}
		/>
	</div>
{:else if choice.control === 'counter'}
	<div class="w-28">
		<NumberField
			label={choice.label}
			value={value === '' ? null : Number(value)}
			min={choice.min ?? 0}
			max={choice.max}
			onCommit={(n) => onChange(n == null ? '' : String(n))}
		/>
	</div>
{:else if choice.control === 'radio'}
	<div class="max-w-xs">
		<RadioButtons
			vertical
			label={choice.label}
			selectedValue={value}
			onChange={(v) => onChange(String(v))}
			choices={[blank, ...choice.options]}
			renderLabel={glyphLabel}
		/>
	</div>
{:else}
	<div class="max-w-xs">
		<Dropdown
			label={choice.label}
			{value}
			options={[blank, ...choice.options]}
			onchange={(v) => onChange(v)}
		/>
	</div>
{/if}
