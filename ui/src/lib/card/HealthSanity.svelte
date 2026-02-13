<script lang="ts">
	import { Health, Sanity } from '@5argon/arkham-icon';
	interface Prop {
		health?: number | 'x';
		sanity?: number | 'x';
	}
	const { health, sanity }: Prop = $props();
</script>

<div class="flex gap-1.5">
	{#if health !== undefined}
		<span class="relative flex h-4 w-4 items-center justify-center">
			<span class="health-translate text-lg leading-none text-red-700 dark:text-red-400">
				<Health />
			</span>
			{#if typeof health === 'number'}
				<span
					class="health-shadow absolute flex h-4 w-4 cursor-default select-none items-center justify-center rounded-full text-white"
				>
					{health}
				</span>
			{/if}
		</span>
	{/if}

	{#if sanity !== undefined}
		<span class="relative flex h-4 w-4 items-center justify-center">
			<span class="sanity-translate text-lg leading-none text-blue-800 dark:text-blue-400">
				<Sanity />
			</span>
			{#if typeof sanity === 'number'}
				<span
					class="sanity-shadow absolute flex h-4 w-4 cursor-default select-none items-center justify-center rounded-full text-white"
				>
					{sanity}
				</span>
			{/if}
		</span>
	{/if}
</div>

<style>
	.health-shadow {
		text-shadow:
			1px 1px 0px rgb(198, 53, 53),
			-1px -1px 0px rgb(198, 53, 53),
			1px -1px 0px rgb(198, 53, 53),
			-1px 1px 0px rgb(198, 53, 53);
	}

	.health-translate {
		transform: translate(-0.5px, -0.5px);
	}

	.sanity-shadow {
		text-shadow:
			1px 1px 0px rgb(39, 69, 220),
			-1px -1px 0px rgb(39, 69, 220),
			1px -1px 0px rgb(39, 69, 220),
			-1px 1px 0px rgb(39, 69, 220);
	}

	.sanity-translate {
		transform: translate(-0.5px, -0.5px);
	}
</style>
