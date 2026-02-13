<!--
@component
Button to add more deck import forms.
-->
<script lang="ts">
	import * as m from '../paraglide/messages.js';

	interface Prop {
		onClick: () => void;
		disabled?: boolean;
	}

	const { onClick, disabled = false }: Prop = $props();
</script>

<button
	type="button"
	onclick={onClick}
	disabled={disabled}
	class="w-full cursor-pointer rounded border-2 border-dashed border-primary-300 bg-primary-50 py-3 text-primary-700 hover:border-primary-400 hover:bg-primary-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-primary-700 dark:bg-primary-900/30 dark:text-primary-300 dark:hover:border-primary-600 dark:hover:bg-primary-900/50"
>
	<div class="flex items-center justify-center gap-2">
		<span class="text-2xl">+</span>
		<span>{m.button_add_deck()}</span>
	</div>
</button>
