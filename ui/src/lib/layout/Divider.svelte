<script module lang="ts">
	export type DividerType = 'simple' | 'diamond';
</script>

<script lang="ts">
	interface Prop {
		type?: DividerType;
		accentColor?: string;
	}
	const { type = 'simple', accentColor }: Prop = $props();
</script>

{#if type === 'simple'}
	<div class="border-secondary-500 dark:border-secondary-700 mx-auto my-8 max-w-md border-t"></div>
{:else if type === 'diamond'}
	{#snippet line()}
		<div class=" border-secondary-500 dark:border-secondary-700 mx-2 w-32 border-r border-t"></div>
	{/snippet}

	<div class="my-2 flex items-center justify-center">
		{@render line()}
		<div
			class="bg-primary-400/30 dark:bg-primary-950/30 border-secondary-300 dark:border-secondary-700
            flex h-5 w-5 rotate-45 transform items-center justify-center"
		>
			<div class="bg-secondary-600 dark:bg-secondary-400 flex h-3 w-3 items-center justify-center">
				<div
					class:accent-color={accentColor !== undefined}
					class="accent-color bg-secondary-400 dark:bg-secondary-700 h-1.5 w-1.5"
					style={`--accent-color: ${accentColor}`}
				></div>
			</div>
		</div>
		{@render line()}
	</div>
{/if}

<style>
	.accent-color {
		background-color: var(--accent-color);
	}
</style>
