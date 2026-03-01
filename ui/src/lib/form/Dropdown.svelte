<script lang="ts" module>
	export type Option<T = string> = {
		value: T;
		label: string;
	};

	export type OptionGroup<T = string> = {
		groupLabel: string;
		options: Option<T>[];
	};

	export type OptionOrGroup<T = string> = Option<T> | OptionGroup<T>;

	export function isGroup<T>(item: OptionOrGroup<T>): item is OptionGroup<T> {
		return 'groupLabel' in item;
	}
</script>

<!--
 @component
 Styled dropdown/select component. `options` accepts either a flat array of
 `Option` values or a mixed array of `Option` and `OptionGroup` (which renders
 as `<optgroup>` elements).
 -->
<script lang="ts" generics="T extends string | number">
	import { FaIconType } from '../icon/fa-icon-type.js';
	import FaIcon from '../icon/FaIcon.svelte';
	import FormLabelWithHelp from './FormLabelWithHelp.svelte';

	export type { Option, OptionGroup, OptionOrGroup };

	interface Prop {
		/**
		 * Bindable selected value.
		 */
		value: T;

		/**
		 * Flat options or a mix of plain options and labelled option groups.
		 */
		options: OptionOrGroup<T>[];

		/**
		 * Text over the dropdown.
		 */
		label: string;

		/**
		 * Callback when selection changes.
		 */
		onchange?: (value: T) => void;

		/**
		 * Name attribute for the select element.
		 */
		name?: string;

		/**
		 * Disable the dropdown.
		 */
		disabled?: boolean;

		/**
		 * Visually hide the label (kept as the select's `aria-label`). Use when the
		 * label would be redundant — e.g. a column of identical "Bearer" selects.
		 */
		hideLabel?: boolean;
	}

	let { value = $bindable(), options, label, onchange, name, disabled, hideLabel }: Prop = $props();

	const firstOption = $derived(
		options.length === 0 ? null : isGroup(options[0]) ? options[0].options[0] : options[0],
	);
	const isNumeric = $derived(firstOption != null && typeof firstOption.value === 'number');

	function handleChange(e: Event & { currentTarget: HTMLSelectElement }) {
		const target = e.currentTarget;
		const selectedValue = target.value;
		if (isNumeric) {
			value = Number(selectedValue) as T;
		} else {
			value = selectedValue as T;
		}
		if (onchange) {
			onchange(value);
		}
	}
</script>

{#snippet control()}
	<div class="relative">
		<select
			id={name}
			{name}
			{disabled}
			{value}
			aria-label={hideLabel ? label : undefined}
			onchange={handleChange}
			class="
				w-full rounded-lg border px-3 py-1 pr-10 shadow-lg
				appearance-none
				backdrop-blur-xl
				bg-white/30 dark:bg-black/20
				border-white/40 dark:border-white/20
				text-primary-900 dark:text-white
				hover:bg-white/40 dark:hover:bg-black/30
				focus:outline-none focus:ring-2 focus:ring-primary-500/50
				disabled:cursor-not-allowed disabled:opacity-50
				transition-all duration-200
			"
		>
			{#each options as item (isGroup(item) ? item.groupLabel : item.value)}
				{#if isGroup(item)}
					<optgroup label={item.groupLabel}>
						{#each item.options as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</optgroup>
				{:else}
					<option value={item.value}>{item.label}</option>
				{/if}
			{/each}
		</select>
		<div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-primary-600 dark:text-primary-400">
			<FaIcon duotone icon={FaIconType.Dropdown} />
		</div>
	</div>
{/snippet}

<div>
	{#if hideLabel}
		{@render control()}
	{:else}
		<FormLabelWithHelp {label}>
			{@render control()}
		</FormLabelWithHelp>
	{/if}
</div>
