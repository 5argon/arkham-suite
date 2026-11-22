<!-- @component The campaign reward card a standalone scenario grants, and whether the subject has unlocked it. -->
<script lang="ts">
	import type { RewardUnlock } from '$lib/campaign/rewards/rewards';
	import RewardCards from '$lib/components/profile/rewards/RewardCards.svelte';

	let { reward }: { reward: RewardUnlock | null } = $props();
</script>

{#if reward}
	<RewardCards rewards={[reward]} showWhere={false} />
{/if}
