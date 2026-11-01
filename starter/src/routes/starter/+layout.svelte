<script lang="ts">
	import { MarginText } from '@5argon/arkham-life-ui';

	import StarterTeamBar from '$lib/design/pages/starter/StarterTeamBar.svelte';

	const { children } = $props();
</script>

<!-- The starter team cart sits above every /starter page, before its title. -->
<MarginText>
	<div class="mt-4">
		<StarterTeamBar />
	</div>
</MarginText>

{@render children()}
