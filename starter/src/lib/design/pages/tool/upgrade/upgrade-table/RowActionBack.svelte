<script lang="ts">
	import { FaIcon, FaIconType } from '@5argon/arkham-life-ui';

	interface Props {
		xpLock: boolean;
		onXpLockChanged: (n: boolean) => void;
	}

	let { xpLock, onXpLockChanged }: Props = $props();

	let checked = $derived.by(() => xpLock);

	function toggleIcon() {
		checked = !checked;
		onXpLockChanged(checked);
	}
</script>

<td class="xp-lock-cell col-actions">
	<button
		aria-label="Toggle manual XP calculation"
		class="icon-button"
		class:active={checked}
		onclick={toggleIcon}
		type="button"
	>
		<FaIcon icon={checked ? FaIconType.UpgradePlannerXpUnlock : FaIconType.UpgradePlannerXpLock} />
	</button>
</td>

<style>
	.xp-lock-cell {
		vertical-align: middle;
		padding: 2px;
		white-space: nowrap;
	}

	.icon-button {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 4px;
		background: transparent;
		border: none;
		cursor: pointer;
		border-radius: 4px;
		color: var(--color-primary-600);
		transition: all 0.2s;
	}

	.icon-button:hover {
		background-color: var(--color-primary-100);
	}

	.icon-button.active {
		background-color: var(--color-secondary-100);
		color: var(--color-secondary-700);
	}

	:global(.dark) .icon-button {
		color: var(--color-primary-300);
	}

	:global(.dark) .icon-button:hover {
		background-color: var(--color-primary-800);
	}

	:global(.dark) .icon-button.active {
		background-color: var(--color-secondary-900);
		color: var(--color-secondary-300);
	}
</style>
