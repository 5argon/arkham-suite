<script lang="ts" module>
	export type Option<T = string> = {
		value: T;
		label: string;
	};
</script>

<!-- 
 @component
 Styled dropdown/select component.
 -->
<script lang="ts" generics="T extends string | number">
	import { FaIconType } from '../icon/fa-icon-type.js';
	import FaIcon from '../icon/FaIcon.svelte';
	import FormLabelWithHelp from './FormLabelWithHelp.svelte';

	export type { Option };

	interface Prop {
		/**
		 * Bindable selected value.
		 */
		value: T;

		/**
		 * Array of options to display in the dropdown.
		 */
		options: Option<T>[];

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
	}

	let { value = $bindable(), options, label, onchange, name, disabled }: Prop = $props();

	// Determine if we're working with numbers based on the first option
	const isNumeric = $derived(options.length > 0 && typeof options[0].value === 'number');

	function handleChange(e: Event & { currentTarget: HTMLSelectElement }) {
		const target = e.currentTarget;
		const selectedValue = target.value;
		// Parse as number if we're in numeric mode
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

<div>
	<FormLabelWithHelp label={label}>
	<div class="relative">
		<select
			id={name}
			{name}
			{disabled}
			value={value}
			on:change={handleChange}
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
			{#each options as option (option.value)}
				<option value={option.value}>
					{option.label}
				</option>
			{/each}
		</select>
		<div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-primary-600 dark:text-primary-400">
			<FaIcon duotone icon={FaIconType.Dropdown} />
		</div>
	</div>
	</FormLabelWithHelp>
</div>