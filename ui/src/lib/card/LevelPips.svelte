<script lang="ts">
	import clsx from 'clsx';

	interface Prop {
		xp: number;
		keepWhite?: boolean;
		shadowed?: boolean;
		themed?: boolean;
	}
	const { xp, keepWhite, shadowed, themed }: Prop = $props();
</script>

<span class="inline-flex cursor-default whitespace-nowrap select-none">
	{#each Array(xp) as _, i (i)}
		<i
			class={clsx(
				keepWhite
					? 'text-white'
					: themed
						? 'text-primary-800 dark:text-primary-200'
						: 'text-black dark:text-white'
			)}
		>
			<svg class:pips-shadow={shadowed} width="7" height="7">
				<circle cx="3.5" cy="3.5" r="2.5" fill="currentColor" />
			</svg>
		</i>
	{/each}
</span>

<style>
	i {
		width: 7px;
		height: 7px;
	}

	.pips-shadow {
		filter: drop-shadow(0 0 1px rgba(0, 0, 0, 1));
	}
</style>
