<script lang="ts">
	interface Props {
		prefix: string;
		list: string[];
	}
	let { prefix, list }: Props = $props();
</script>

<h1 class="text-black dark:text-white font-bold">{prefix}</h1>
<ul>
	{#each list as l}
		<li class="my-2 rounded border-2 border-black dark:border-white hover:dark:bg-white/20 hover:bg-secondary-200/50">
			<a
				class="block border-black px-4 text-black dark:border-white dark:text-white"
				aria-label={l}
				href={prefix + l}
			>
				{l}
			</a>
		</li>
	{/each}
</ul>
