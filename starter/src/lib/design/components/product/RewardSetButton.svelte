<!--
@component
Every Reward card as one tile, shown next to products though it is not one.
-->
<script lang="ts">
	import { FaIcon, FaIconType, GraphicButton } from '@5argon/arkham-life-ui';

	import * as m from '$lib/paraglide/messages.js';
	import { rewardImageUrl } from '$lib/utility/reward';

	interface Prop {
		/**
		 * A function runs on click, a string is a link.
		 */
		onClick: (() => void) | string;
	}
	const { onClick }: Prop = $props();
</script>

<GraphicButton small text={m.common_reward_cards()} graphic={rewardImageUrl} {onClick}>
	<FaIcon icon={FaIconType.Reward} />
</GraphicButton>
