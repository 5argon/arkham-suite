<script lang="ts">
	interface Prop {
		label: string;
		checked: boolean;
	}
	let { label, checked = $bindable() }: Prop = $props();
</script>

<label
	class="text-primary-800 dark:text-primary-200 flex cursor-pointer items-center gap-3 text-sm"
>
	<input
		type="checkbox"
		bind:checked
		class="accent-primary-600 h-4 w-4 rounded"
	/>
	{label}
</label>
