<script lang="ts">
	import { InlineTextBox } from '@5argon/arkham-life-ui';

	interface Props {
		currentText: string;
		onChange?: (n: string) => void;
		justText?: boolean;
	}

	let { currentText, onChange = () => {}, justText = false }: Props = $props();

	function inputChangedHandler(e: Event & { currentTarget: HTMLInputElement }) {
		onChange(e.currentTarget.value);
	}
</script>

<span>
	{#if justText}
		<span
			class="inline-flex h-6 w-6 items-center justify-center text-xs text-primary-700 dark:text-primary-300"
		>
			{currentText}
		</span>
	{:else}
		<InlineTextBox
			bind:value={currentText}
			align="center"
			class="w-6 text-xs"
			onchange={inputChangedHandler}
		/>
	{/if}
</span>
