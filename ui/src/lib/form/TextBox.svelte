<!-- 
 @component
 Basic text input element without form wrapper.
 -->
<script lang="ts">
	interface Prop {
		/**
		 * Bindable.
		 */
		value: string;

		/**
		 * Placeholder text for the input.
		 */
		placeholder?: string;

		/**
		 * Whether the input is disabled.
		 */
		disabled?: boolean;

		/**
		 * Callback when input changes. Receives the new value.
		 */
		oninput?: (value: string) => void;

		/**
		 * Callback when input loses focus.
		 */
		onblur?: () => void;

		/**
		 * Additional CSS classes to apply.
		 */
		class?: string;
	}
	let {
		value = $bindable(),
		placeholder,
		disabled = false,
		oninput,
		onblur,
		class: className
	}: Prop = $props();

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		oninput?.(target.value);
	}
</script>

<input
	bind:value
	{disabled}
	{placeholder}
	oninput={handleInput}
	{onblur}
	class="border-primary-600 disabled:bg-primary-400 dark:disabled:bg-primary-600 bg-primary-200 disabled:text-primary-500 flex-1 rounded border-2 p-1 pr-8 {className ||
		''}"
/>
