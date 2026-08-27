<script lang="ts">
	import SvelteMarkdown from 'svelte-marked';
	import MarkdownLink from '$lib/design/components/basic/MarkdownLink.svelte';

	import footerMd from '$lib/md/footer.md?raw';
</script>

<footer>
	<div
		class="p-2 max-w-3xl w-full text-center text-xs sm:p-4 sm:text-sm text-secondary-800 dark:text-secondary-200"
	>
		<SvelteMarkdown
			renderers={{
				link: MarkdownLink
			}}
			source={footerMd}
		/>
	</div>
</footer>

<style>
	footer {
		display: flex;
		justify-content: center;
		text-align: center;
		width: 100%;
		max-width: 1000px;
		margin: 0 auto;
	}
</style>
