<script lang="ts">
	import { FaIcon, FaIconType, HoverTooltip } from '@5argon/arkham-life-ui';

	let { inferred }: { inferred: boolean } = $props();

	let hovered = $state(false);
	let referenceElement: HTMLSpanElement | null = $state(null);

	const icon = $derived(inferred ? FaIconType.AchievementInferred : FaIconType.AchievementManual);
	const label = $derived(
		inferred
			? 'Can be inferred automatically from your recorded campaign logs.'
			: 'Requires manual bookkeeping.'
	);
</script>

<span
	bind:this={referenceElement}
	onmouseenter={() => (hovered = true)}
	onmouseleave={() => (hovered = false)}
	role="none"
	class="cursor-help text-secondary-500 dark:text-secondary-400"
>
	<FaIcon {icon} />
</span>

<HoverTooltip visible={hovered} {referenceElement}>
	<span
		class="px-1 py-1 text-xs whitespace-nowrap not-italic text-primary-900 dark:text-primary-100"
	>
		{label}
	</span>
</HoverTooltip>
