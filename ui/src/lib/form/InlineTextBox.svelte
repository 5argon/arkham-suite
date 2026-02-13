<!-- 
 @component
 Inline text input with fixed height (h-6) for use in compact UIs like tables.
 User provides width styling via the `class` prop.
 -->
<script lang="ts">
	import clsx from 'clsx';

	interface Props {
		/**
		 * Bindable value.
		 */
		value: string;

		/**
		 * Whether the input is disabled.
		 */
		disabled?: boolean;

		/**
		 * Text alignment: left, center, or right.
		 */
		align?: 'left' | 'center' | 'right';

		/**
		 * Input type attribute.
		 */
		type?: string;

		/**
		 * Additional CSS classes to apply (typically for width).
		 */
		class?: string;

		/**
		 * Callback when input value changes.
		 */
		onchange?: (e: Event & { currentTarget: HTMLInputElement }) => void;

		/**
		 * Callback when key is released.
		 */
		onkeyup?: (e: KeyboardEvent & { currentTarget: HTMLInputElement }) => void;
	}

	let {
		value = $bindable(),
		disabled = false,
		align = 'left',
		type = 'text',
		class: className = '',
		onchange,
		onkeyup
	}: Props = $props();

	const alignClass = $derived(
		align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'
	);
</script>

<input
	bind:value
	{disabled}
	{type}
	{onchange}
	{onkeyup}
	class={clsx(
		alignClass,
		className,
		align !== 'center' ? 'px-2' : '',
		'border-primary-200 text-primary-900 focus:border-primary-400 focus:ring-primary-300 dark:border-primary-700 dark:bg-primary-950 dark:text-primary-100 dark:focus:border-primary-500 dark:focus:ring-primary-600 h-6 rounded border bg-white focus:ring-1 focus:outline-none disabled:opacity-50'
	)}
/>
