<script lang="ts">
	import { FaIcon, FaIconType, HoverTooltip } from '@5argon/arkham-life-ui';

	// `log`-scope achievements can be read straight from the campaign log (gear). `extra`-scope ones
	// depend on more than the log (a chosen option, the difficulty, the active ultimatums…), so they
	// need manual bookkeeping; `manual` ones too. Clicking a log gear opens the caller's modal listing
	// exactly what to look for in the log, so you can check it off in retrospect.
	let { scope, onClick }: { scope: 'log' | 'extra' | 'manual'; onClick?: () => void } = $props();

	const isGear = $derived(scope === 'log');
	let hovered = $state(false);
	let referenceElement: HTMLElement | null = $state(null);

	const icon = $derived(isGear ? FaIconType.AchievementInferred : FaIconType.AchievementManual);
	const label = $derived(
		scope === 'log'
			? 'Can be read straight from your campaign log — no manual tracking needed. Click to see what to look for.'
			: scope === 'extra'
				? 'Requires manual bookkeeping — it depends on more than the campaign log.'
				: 'Requires manual bookkeeping.'
	);
</script>

{#if isGear}
	<button
		type="button"
		bind:this={referenceElement}
		onmouseenter={() => (hovered = true)}
		onmouseleave={() => (hovered = false)}
		onclick={() => onClick?.()}
		aria-label={label}
		class="cursor-pointer text-secondary-500 dark:text-secondary-400 hover:text-secondary-700"
	>
		<FaIcon {icon} />
	</button>
{:else}
	<span
		bind:this={referenceElement}
		onmouseenter={() => (hovered = true)}
		onmouseleave={() => (hovered = false)}
		role="none"
		class="cursor-help text-secondary-500 dark:text-secondary-400"
	>
		<FaIcon {icon} />
	</span>
{/if}

<HoverTooltip visible={hovered} {referenceElement}>
	<span class="px-1 py-1 text-xs whitespace-normal max-w-xs not-italic text-primary-900 dark:text-primary-100">
		{label}
	</span>
</HoverTooltip>
