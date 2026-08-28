<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { MarginText } from '@5argon/arkham-life-ui';

	import StarterTeamBar from '$lib/design/pages/starter/StarterTeamBar.svelte';

	const { children } = $props();

	let root = $state<HTMLElement | null>(null);

	// The site scrolls inside its own container rather than the window, so
	// SvelteKit's scroll reset never reaches it: bring the container back to
	// the top when moving between starter pages (hash targets are left to the
	// browser so series anchors still land).
	afterNavigate((nav) => {
		if (nav.type !== 'link' && nav.type !== 'goto') return;
		if (nav.to?.url.hash) return;
		let el: HTMLElement | null = root;
		while (el !== null && !/(auto|scroll)/.test(getComputedStyle(el).overflowY)) {
			el = el.parentElement;
		}
		el?.scrollTo({ top: 0 });
	});
</script>

<!-- The starter team cart sits above every /starter page, before its title. -->
<div bind:this={root}></div>
<MarginText>
	<div class="mt-4">
		<StarterTeamBar />
	</div>
</MarginText>

{@render children()}
